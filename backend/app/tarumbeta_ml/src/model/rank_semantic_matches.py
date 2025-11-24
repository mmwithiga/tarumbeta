import pandas as pd
import numpy as np
import pickle
import os
import sys
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize

# Add project root to path
sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def load_artifacts():
    """Loads all separate components needed for Semantic Inference."""
    print("⏳ Loading Semantic Artifacts...")
    
    # 1. The Model
    with open(os.path.join(config.SEMANTIC_MODELS, 'knn_model.pkl'), 'rb') as f:
        model = pickle.load(f)
        
    # 2. The Preprocessors (Saved in Step 5)
    with open(os.path.join(config.SEMANTIC_MODELS, 'encoder.pkl'), 'rb') as f:
        encoder = pickle.load(f)
    with open(os.path.join(config.SEMANTIC_MODELS, 'scaler.pkl'), 'rb') as f:
        scaler = pickle.load(f)
        
    # 3. The BERT Model (For text embeddings)
    bert = SentenceTransformer('all-MiniLM-L6-v2')
        
    # 4. The Raw Data (For display)
    instructors_df = pd.read_csv(os.path.join(config.DATA_PROCESSED, 'instructors_processed.csv'))
    learners_df = pd.read_csv(os.path.join(config.DATA_PROCESSED, 'learners_processed.csv'))
    
    return model, encoder, scaler, bert, instructors_df, learners_df

def get_recommendations(learner_id=None):
    model, encoder, scaler, bert, instructors_df, learners_df = load_artifacts()
    
    # Pick a random learner
    if learner_id:
        learner = learners_df[learners_df['learner_id'] == learner_id]
    else:
        learner = learners_df.sample(1)
    
    # Extract the single row as a DataFrame
    learner_row = learner.iloc[[0]]
    
    print("\n--- 👤 LEARNER PROFILE (Query) ---")
    print(learner_row[['location', 'instrument_type', 'skill_level', 'bio_keywords']].to_string(index=False))
    
    # --- MANUAL VECTORIZATION (Must match Step 5 EXACTLY) ---
    
    # 1. Categorical (Weight: 0.55/0.60)
    cat_cols = ['location', 'instrument_type', 'teaching_language', 'skill_level']
    cat_matrix = encoder.transform(learner_row[cat_cols])
    cat_matrix = normalize(cat_matrix, axis=1, norm='l2') * config.WEIGHT_CAT
    
    # 2. Numerical (Weight: 0.30)
    # Learners have dummy 0s for rates, but we must process them to match shape
    num_cols = ['hourly_rate', 'rating', 'years_experience']
    num_matrix = scaler.transform(learner_row[num_cols])
    num_matrix = normalize(num_matrix, axis=1, norm='l2') * config.WEIGHT_NUM
    
    # 3. Text Embeddings (Weight: 0.15)
    text_matrix = bert.encode(learner_row['bio_keywords'].tolist())
    text_matrix = normalize(text_matrix, axis=1, norm='l2') * config.WEIGHT_TXT
    
    # 4. Stack
    query_vec = np.hstack([cat_matrix, num_matrix, text_matrix])
    
    # --- INFERENCE ---
    
    distances, indices = model.kneighbors(query_vec, n_neighbors=5)
    
    print("\n--- 🎯 TOP 5 SEMANTIC MATCHES ---")
    matches = instructors_df.iloc[indices[0]].copy()
    matches['similarity_score'] = 1 - distances[0] 
    
    cols_to_show = ['name', 'location', 'instrument_type', 'hourly_rate', 'similarity_score']
    print(matches[cols_to_show].sort_values('similarity_score', ascending=False).to_string(index=False))

if __name__ == "__main__":
    get_recommendations()
