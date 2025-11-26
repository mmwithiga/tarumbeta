import pickle
import os
import sys
import numpy as np
import faiss

# Setup path
sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def train_faiss_model():
    print("🚀 Building FAISS Index (High-Performance Engine)...")
    
    # 1. Load the Weighted Vectors (from Step 5)
    vec_path = os.path.join(config.SEMANTIC_MODELS, 'instructors_vec.pkl')
    if not os.path.exists(vec_path):
        raise FileNotFoundError(f"❌ Missing {vec_path}. Did you run Step 5?")
        
    with open(vec_path, 'rb') as f:
        vectors = pickle.load(f)
    
    print(f"   Loaded {vectors.shape[0]} vectors of dimension {vectors.shape[1]}.")
    
    # 2. Normalize for Cosine Similarity
    # FAISS 'IndexFlatIP' calculates Dot Product.
    # Dot Product of normalized vectors == Cosine Similarity.
    # This is CRITICAL. Without this, scores can go above 1.0 (The Model 2 bug).
    faiss.normalize_L2(vectors)
    print("   ✅ Vectors L2 Normalized (Fixes Model 2 Bug).")
    
    # 3. Build the Index
    dimension = vectors.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(vectors)
    
    # 4. Save the Index
    # We save it as a binary file optimized for FAISS
    index_path = os.path.join(config.SEMANTIC_MODELS, 'faiss_index.bin')
    faiss.write_index(index, index_path)
    
    print(f"✅ FAISS Index saved to {index_path}")
    print("   The Tarumbeta V3 Engine is ready for queries.")

if __name__ == "__main__":
    train_faiss_model()
