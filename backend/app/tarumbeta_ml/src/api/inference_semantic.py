import pandas as pd
import numpy as np
import pickle
import os
import sys
import faiss  # <--- NEW: High-performance engine
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize

# Ensure we can find the config
try:
    from app.tarumbeta_ml.src.utils import config
except ImportError:
    try:
        from backend.app.tarumbeta_ml.src.utils import config
    except ImportError:
        # Fallback for local testing if not running from backend root
        import sys
        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
        from src.utils import config

class SemanticRecommender:
    def __init__(self):
        self.index = None
        self.encoder = None
        self.scaler = None
        self.bert_model = None
        self.instructors_df = None
        self._load_artifacts()
        
    def _load_artifacts(self):
        print("⏳ Loading Tarumbeta V3 (FAISS Engine)...")
        
        # 1. Load the FAISS Index (The High-Speed Brain)
        index_path = os.path.join(config.SEMANTIC_MODELS, 'faiss_index.bin')
        if not os.path.exists(index_path):
            raise FileNotFoundError(f"❌ Missing FAISS Index at {index_path}")
            
        self.index = faiss.read_index(index_path)
        
        # 2. Load Processors
        with open(os.path.join(config.SEMANTIC_MODELS, 'encoder.pkl'), 'rb') as f:
            self.encoder = pickle.load(f)
        with open(os.path.join(config.SEMANTIC_MODELS, 'scaler.pkl'), 'rb') as f:
            self.scaler = pickle.load(f)
            
        # 3. Load Text Engine
        self.bert_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # 4. Load Database
        self.instructors_df = pd.read_csv(os.path.join(config.DATA_PROCESSED, 'instructors_processed.csv'))
        print(f"✅ System Ready. Index contains {self.index.ntotal} instructors.")

    def recommend(self, user_profile, top_k=5):
        # 1. Prepare Data
        input_data = {
            'location': [user_profile.get('location')],
            'instrument_type': [user_profile.get('instrument_type')],
            'skill_level': [user_profile.get('skill_level')],
            'teaching_language': [user_profile.get('teaching_language')],
            'bio_keywords': [user_profile.get('bio_keywords', '')],
            'hourly_rate': [0], 'rating': [0], 'years_experience': [0] # Dummies
        }
        df = pd.DataFrame(input_data)
        
        # 2. VECTORIZE (Brute Force Logic: 0.80 / 0.10 / 0.10)
        
        # A. Categorical
        cat_cols = ['location', 'instrument_type', 'teaching_language', 'skill_level']
        cat_matrix = self.encoder.transform(df[cat_cols])
        cat_matrix = normalize(cat_matrix, axis=1, norm='l2') * config.WEIGHT_CAT
        
        # B. Numerical
        num_cols = ['hourly_rate', 'rating'] # Note: V3 excluded years_experience
        num_matrix = self.scaler.transform(df[num_cols])
        num_matrix = normalize(num_matrix, axis=1, norm='l2') * config.WEIGHT_NUM
        
        # C. Text
        text_matrix = self.bert_model.encode(df['bio_keywords'].tolist())
        text_matrix = normalize(text_matrix, axis=1, norm='l2') * config.WEIGHT_TXT
        
        # D. Stack
        query_vec = np.hstack([cat_matrix, num_matrix, text_matrix]).astype('float32')
        
        # 3. NORMALIZE QUERY (Critical V3 Fix)
        faiss.normalize_L2(query_vec)
        
        # 4. SEARCH (FAISS)
        distances, indices = self.index.search(query_vec, k=top_k)
        
        # 5. FORMAT OUTPUT
        results = []
        for i, idx in enumerate(indices[0]):
            if idx == -1: continue # Handle empty results safety
            
            instructor = self.instructors_df.iloc[idx]
            score = float(distances[0][i]) # Cosine Similarity
            
            results.append({
                "instructor_id": f"ML-{idx}", # Prefix to indicate ML source
                "name": instructor['name'],
                "location": instructor['location'],
                "instrument": instructor['instrument_type'],
                "match_score": round(score, 4),
                "bio_short": instructor['bio_keywords'][:100] + "...",
                "hourly_rate": float(instructor.get('hourly_rate', 0)),
                "rating": float(instructor.get('rating', 0)),
                "skill_level": instructor.get('skill_level', 'Beginner')
            })
            
        return results

# Singleton
recommender = SemanticRecommender()

def get_matches(profile, top_k=5):
    return recommender.recommend(profile, top_k=top_k)
