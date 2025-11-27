import pandas as pd
import numpy as np
import pickle
import os
import sys
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder, normalize
from sentence_transformers import SentenceTransformer

# Setup path
sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def run_vectorization():
    print("🧠 Starting Vectorization (Applying Brute Force Weights)...")
    
    # 1. Load Data
    inst_path = os.path.join(config.DATA_PROCESSED, 'instructors_processed.csv')
    learn_path = os.path.join(config.DATA_PROCESSED, 'learners_processed.csv')
    
    df_inst = pd.read_csv(inst_path)
    df_learn = pd.read_csv(learn_path)
    
    # Add flags to track them after merging
    df_inst['is_instructor'] = 1
    df_learn['is_instructor'] = 0
    
    # Align Columns (Drop 'years_experience' if it exists in learners but not instructors)
    common_cols = ['location', 'instrument_type', 'teaching_language', 'skill_level', 
                   'hourly_rate', 'rating', 'bio_keywords', 'is_instructor']
    
    combined = pd.concat([df_inst[common_cols], df_learn[common_cols]], axis=0, ignore_index=True)
    
    # 2. Initialize Processors
    encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    scaler = MinMaxScaler()
    bert = SentenceTransformer('all-MiniLM-L6-v2')
    
    # 3. Process Block A: CATEGORICAL (The Hard Constraints)
    # Weight: 0.80
    print(f"   🔹 Processing Categorical Block (Weight: {config.WEIGHT_CAT})...")
    cat_cols = ['location', 'instrument_type', 'teaching_language', 'skill_level']
    
    # Fit on ALL data (so we know all cities/instruments)
    cat_matrix = encoder.fit_transform(combined[cat_cols])
    
    # Normalize Row-wise -> Multiply by Weight
    cat_matrix = normalize(cat_matrix, axis=1, norm='l2') * config.WEIGHT_CAT
    
    # 4. Process Block B: NUMERICAL (The Tie-Breakers)
    # Weight: 0.10
    print(f"   🔹 Processing Numerical Block (Weight: {config.WEIGHT_NUM})...")
    num_cols = ['hourly_rate', 'rating']
    
    # Fit only on Instructors to set the scale (Learners are dummy 0s anyway)
    scaler.fit(df_inst[num_cols])
    num_matrix = scaler.transform(combined[num_cols])
    
    # Normalize Row-wise -> Multiply by Weight
    num_matrix = normalize(num_matrix, axis=1, norm='l2') * config.WEIGHT_NUM
    
    # 5. Process Block C: TEXT (The Semantic Flavor)
    # Weight: 0.10
    print(f"   🔹 Processing Text Block (Weight: {config.WEIGHT_TXT})...")
    # This takes a few seconds
    text_matrix = bert.encode(combined['bio_keywords'].tolist())
    
    # Normalize Row-wise -> Multiply by Weight
    text_matrix = normalize(text_matrix, axis=1, norm='l2') * config.WEIGHT_TXT
    
    # 6. Stack & Split
    print("   🔗 Stacking Vectors...")
    final_vectors = np.hstack([cat_matrix, num_matrix, text_matrix]).astype('float32')
    
    # Extract just the Instructors to save as the "Database"
    inst_vectors = final_vectors[combined['is_instructor'] == 1]
    
    # 7. Save Artifacts
    # We save EVERYTHING needed to replicate this for a new user query
    os.makedirs(config.SEMANTIC_MODELS, exist_ok=True)
    
    with open(os.path.join(config.SEMANTIC_MODELS, 'encoder.pkl'), 'wb') as f:
        pickle.dump(encoder, f)
        
    with open(os.path.join(config.SEMANTIC_MODELS, 'scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)
        
    with open(os.path.join(config.SEMANTIC_MODELS, 'instructors_vec.pkl'), 'wb') as f:
        pickle.dump(inst_vectors, f)
        
    print(f"✅ Vectorization Complete. Saved {len(inst_vectors)} vectors to {config.SEMANTIC_MODELS}")

if __name__ == "__main__":
    run_vectorization()
