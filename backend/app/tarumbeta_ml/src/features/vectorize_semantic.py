import pandas as pd
import numpy as np
import pickle
import os
import sys
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.preprocessing import normalize
from sentence_transformers import SentenceTransformer

sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def run_semantic_vectorization():
    print("⚙️  Initializing Semantic Vectorization Pipeline...")
    
    # 1. Load Data
    df_inst = pd.read_csv(os.path.join(config.DATA_PROCESSED, 'instructors_processed.csv'))
    df_learn = pd.read_csv(os.path.join(config.DATA_PROCESSED, 'learners_processed.csv'))
    
    # Add a flag to track source after merge
    df_inst['is_instructor'] = 1
    df_learn['is_instructor'] = 0
    
    # Combine for consistent One-Hot Encoding
    combined = pd.concat([df_inst, df_learn], axis=0, ignore_index=True).fillna('')
    
    # --- BLOCK 1: CATEGORICAL (The Heavy Hitters) ---
    # Supervisor Rule: "Categorical features × ~0.55–0.60"
    print(f"   🔹 Processing Categorical Features (Weight: {config.WEIGHT_CAT})...")
    cat_cols = ['location', 'instrument_type', 'teaching_language', 'skill_level']
    
    encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    cat_matrix = encoder.fit_transform(combined[cat_cols])
    
    # Critical: Normalize row-wise so one row doesn't overpower another, then apply weight
    cat_matrix = normalize(cat_matrix, axis=1, norm='l2') * config.WEIGHT_CAT

    # --- BLOCK 2: NUMERICAL (The Qualifiers) ---
    # Supervisor Rule: "Numerical features × ~0.30"
    print(f"   🔹 Processing Numerical Features (Weight: {config.WEIGHT_NUM})...")
    num_cols = ['hourly_rate', 'rating', 'years_experience']
    
    scaler = MinMaxScaler()
    num_matrix = scaler.fit_transform(combined[num_cols])
    
    # Normalize & Weight
    num_matrix = normalize(num_matrix, axis=1, norm='l2') * config.WEIGHT_NUM

    # --- BLOCK 3: TEXT (The Semantic Context) ---
    # Supervisor Rule: "No TF-IDF... replace with word vectors... Weight ~0.15"
    print(f"   🔹 Processing Text Embeddings (Weight: {config.WEIGHT_TXT})...")
    
    # Using 'all-MiniLM-L6-v2' (Fast & Powerful)
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Encode bios (This generates dense vectors, not sparse TF-IDF)
    text_matrix = model.encode(combined['bio_keywords'].tolist())
    
    # Normalize & Weight
    text_matrix = normalize(text_matrix, axis=1, norm='l2') * config.WEIGHT_TXT

    # --- BLOCK 4: THE UNIFIED VECTOR (np.hstack) ---
    # Supervisor Rule: "Single stacked + weighted vector"
    print("   🔗 Concatenating Blocks (np.hstack)...")
    final_vectors = np.hstack([cat_matrix, num_matrix, text_matrix])
    
    print(f"   ✅ Final Vector Shape: {final_vectors.shape} (Rows, Dimensions)")

    # Split back into Instructors and Learners
    mask_inst = combined['is_instructor'] == 1
    inst_vectors = final_vectors[mask_inst]
    
    # --- SAVE ARTIFACTS ---
    # We save to the new 'semantic_models' folder
    os.makedirs(config.SEMANTIC_MODELS, exist_ok=True)
    
    # Save the Processors (Needed for the API later)
    with open(os.path.join(config.SEMANTIC_MODELS, 'encoder.pkl'), 'wb') as f:
        pickle.dump(encoder, f)
    with open(os.path.join(config.SEMANTIC_MODELS, 'scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)
        
    # Save the Vectors (The 'Database' for our recommender)
    with open(os.path.join(config.SEMANTIC_MODELS, 'instructors_vec.pkl'), 'wb') as f:
        pickle.dump(inst_vectors, f)
        
    print(f"   💾 Artifacts saved to {config.SEMANTIC_MODELS}")

if __name__ == "__main__":
    run_semantic_vectorization()
