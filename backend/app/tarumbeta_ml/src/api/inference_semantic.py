import pandas as pd
import numpy as np
import pickle
import os
import sys
import warnings
from sklearn.exceptions import InconsistentVersionWarning

# Suppress scikit-learn version warnings (Model trained on 1.6.1, running on newer)
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize

from ..utils import config

class SemanticRecommender:
    def __init__(self):
        self.model = None
        self.encoder = None
        self.scaler = None
        self.bert_model = None
        self.instructors_df = None
        self._load_artifacts()
        
    def _load_artifacts(self):
        print("⏳ Loading Semantic Artifacts (0.80/0.10/0.10)...")
        
        # Load the saved brains
        # We use the config paths to find them
        with open(os.path.join(config.SEMANTIC_MODELS, 'knn_model.pkl'), 'rb') as f:
            self.model = pickle.load(f)
        with open(os.path.join(config.SEMANTIC_MODELS, 'encoder.pkl'), 'rb') as f:
            self.encoder = pickle.load(f)
        with open(os.path.join(config.SEMANTIC_MODELS, 'scaler.pkl'), 'rb') as f:
            self.scaler = pickle.load(f)
            
        # Load the text engine
        self.bert_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Load the human-readable data
        self.instructors_df = pd.read_csv(os.path.join(config.DATA_PROCESSED, 'instructors_processed.csv'))
        
        # CRITICAL FIX: Normalize location in synthetic data to match user queries
        # "Kibera, Nairobi" -> "Nairobi"
        if 'location' in self.instructors_df.columns:
            self.instructors_df['location'] = self.instructors_df['location'].apply(
                lambda x: x.split(',')[-1].strip() if isinstance(x, str) else x
            )
            
        print("✅ System Ready.")

    def recommend(self, user_profile, candidates=None, top_k=5):
        """
        Find matches for the user profile.
        
        Args:
            user_profile (dict): The learner's profile
            candidates (list): Optional list of real instructor dicts from the DB.
                             If provided, we vectorize them and rank them.
                             If None, we use the pre-trained synthetic index (fallback).
        """
        
        # 1. Vectorize the User (Query)
        # -----------------------------
        user_df = pd.DataFrame({
            'location': [user_profile.get('location', '')],
            'instrument_type': [user_profile.get('instrument_type', '')],
            'skill_level': [user_profile.get('skill_level', '')],
            'teaching_language': [user_profile.get('teaching_language', '')],
            'bio_keywords': [user_profile.get('bio_keywords', '')],
            'hourly_rate': [0], # Dummy
            'rating': [0],      # Dummy
            'years_experience': [0] # Dummy
        })
        
        user_vec = self._vectorize_dataframe(user_df)
        
        # 2. Handle Candidates (Real vs Synthetic)
        # ----------------------------------------
        if candidates:
            print(f"🧠 Vectorizing {len(candidates)} real candidates on-the-fly...")
            
            # Convert candidates list to DataFrame
            # We need to map the DB fields to the ML feature names
            cand_data = []
            for c in candidates:
                # Extract location from the nested users object if present
                loc = c.get('users', {}).get('location') if c.get('users') else c.get('location')
                
                cand_data.append({
                    'id': c.get('id'),
                    'name': c.get('users', {}).get('full_name') if c.get('users') else c.get('name', 'Unknown'), # Capture name
                    'location': (loc.split(',')[0].strip() if loc else ''), # Normalize "Nairobi, Kenya" -> "Nairobi"
                    'instrument_type': c.get('instrument', ''), # DB uses 'instrument'
                    'skill_level': c.get('skill_level', ''),
                    'teaching_language': c.get('users', {}).get('language') or 'English', # Map language from users table
                    'bio_keywords': f"{c.get('bio', '')} {c.get('genre', '')}", # Construct bio
                    'hourly_rate': float(c.get('hourly_rate', 0)),
                    'rating': float(c.get('rating', 0)),
                    'years_experience': float(c.get('experience_years', 0)) # DB uses 'experience_years'
                })
            
            cand_df = pd.DataFrame(cand_data)
            
            if cand_df.empty:
                return []
                
            # Vectorize Candidates
            cand_vectors = self._vectorize_dataframe(cand_df)
            
            # Calculate Cosine Similarity
            # user_vec is (1, D), cand_vectors is (N, D)
            # Since vectors are normalized, dot product is cosine similarity
            scores = np.dot(cand_vectors, user_vec.T).flatten()
            
            # Rank and Format
            results = []
            # Get top K indices
            top_indices = scores.argsort()[::-1][:top_k]
            
            for idx in top_indices:
                score = scores[idx]
                instructor = cand_data[idx]
                
                results.append({
                    "instructor_id": instructor['id'],
                    "name": instructor.get('name', 'Unknown Instructor'), # Use name from candidate data
                    "match_score": float(score),
                    "bio_short": instructor['bio_keywords'][:100] + "..."
                })
                
            return results
            
        else:
            # Fallback: Use the pre-trained synthetic data BUT re-vectorize it 
            # to ensure it matches the current config weights (0.80/0.10/0.10).
            # The saved KNN model has old weights (0.55) baked in, causing low scores.
            print("⚠️ Re-vectorizing synthetic data on-the-fly to match new weights...")
            
            # 1. Vectorize the synthetic dataframe directly
            cand_vectors = self._vectorize_dataframe(self.instructors_df)
            
            # 2. Calculate Cosine Similarity
            scores = np.dot(cand_vectors, user_vec.T).flatten()
            
            # 3. Rank and Format
            results = []
            top_indices = scores.argsort()[::-1][:top_k]
            
            for idx in top_indices:
                score = scores[idx]
                instructor = self.instructors_df.iloc[idx]
                
                results.append({
                    "instructor_id": instructor['instructor_id'],
                    "name": instructor['name'],
                    "location": instructor['location'],
                    "instrument": instructor['instrument_type'],
                    "match_score": round(float(score), 4),
                    "bio_short": str(instructor['bio_keywords'])[:100] + "...",
                    "hourly_rate": float(instructor.get('hourly_rate', 0)),
                    "rating": float(instructor.get('rating', 0)),
                    "years_experience": float(instructor.get('years_experience', 0))
                })
                
            return results

    def _vectorize_dataframe(self, df):
        """
        Helper to apply the exact same transformation pipeline as training.
        """
        # A. Categorical (Weight: 0.80)
        cat_cols = ['location', 'instrument_type', 'teaching_language', 'skill_level']
        # Handle missing columns if any
        for col in cat_cols:
            if col not in df.columns:
                df[col] = ''
                
        cat_matrix = self.encoder.transform(df[cat_cols])
        cat_matrix = normalize(cat_matrix, axis=1, norm='l2') * config.WEIGHT_CAT
        
        # B. Numerical (Weight: 0.10)
        num_cols = ['hourly_rate', 'rating', 'years_experience']
        num_matrix = self.scaler.transform(df[num_cols])
        num_matrix = normalize(num_matrix, axis=1, norm='l2') * config.WEIGHT_NUM
        
        # C. Text (Weight: 0.10)
        text_matrix = self.bert_model.encode(df['bio_keywords'].tolist())
        text_matrix = normalize(text_matrix, axis=1, norm='l2') * config.WEIGHT_TXT
        
        # D. Stack them
        
        stacked = np.hstack([cat_matrix, num_matrix, text_matrix])
        
        # CRITICAL FIX: Normalize the final vector so dot product = 1.0 for perfect match
        return normalize(stacked, axis=1, norm='l2')

# Singleton Instance
recommender = SemanticRecommender()

def get_matches(profile, candidates=None, top_k=5):
    return recommender.recommend(profile, candidates, top_k=top_k)
