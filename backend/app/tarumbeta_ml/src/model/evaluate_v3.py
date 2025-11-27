import pandas as pd
import numpy as np
import pickle
import os
import sys
import faiss
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize

# Setup
sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def load_artifacts():
    print("⏳ Loading V3 Artifacts (FAISS + Real Data)...")
    
    # 1. Load FAISS Index
    index_path = os.path.join(config.SEMANTIC_MODELS, 'faiss_index.bin')
    index = faiss.read_index(index_path)
    
    # 2. Load Processors
    with open(os.path.join(config.SEMANTIC_MODELS, 'encoder.pkl'), 'rb') as f:
        encoder = pickle.load(f)
    with open(os.path.join(config.SEMANTIC_MODELS, 'scaler.pkl'), 'rb') as f:
        scaler = pickle.load(f)
        
    bert = SentenceTransformer('all-MiniLM-L6-v2')
    
    # 3. Load Datasets
    inst_df = pd.read_csv(os.path.join(config.DATA_PROCESSED, 'instructors_processed.csv'))
    learn_df = pd.read_csv(os.path.join(config.DATA_PROCESSED, 'learners_processed.csv'))
    
    return index, encoder, scaler, bert, inst_df, learn_df

def construct_vectors(df, encoder, scaler, bert):
    # Replicate V3 Logic EXACTLY
    
    # A. Categorical (0.80)
    cat_cols = ['location', 'instrument_type', 'teaching_language', 'skill_level']
    cat = normalize(encoder.transform(df[cat_cols]), axis=1) * config.WEIGHT_CAT
    
    # B. Numerical (0.10)
    # Handle missing cols for learners
    if 'hourly_rate' not in df: df['hourly_rate'] = 0
    if 'rating' not in df: df['rating'] = 0
    num_cols = ['hourly_rate', 'rating']
    num = normalize(scaler.transform(df[num_cols]), axis=1) * config.WEIGHT_NUM
    
    # C. Text (0.10)
    txt = normalize(bert.encode(df['bio_keywords'].tolist()), axis=1) * config.WEIGHT_TXT
    
    # D. Stack & Normalize
    vecs = np.hstack([cat, num, txt]).astype('float32')
    faiss.normalize_L2(vecs) # <--- Critical V3 Step
    
    return vecs

def evaluate(n_samples=500):
    index, encoder, scaler, bert, inst_df, learn_df = load_artifacts()
    
    # Sample Test Learners
    test_set = learn_df.sample(n_samples, random_state=42)
    print(f"\n🧪 Evaluating on {n_samples} random learners...")
    
    # Vectorize
    query_vecs = construct_vectors(test_set, encoder, scaler, bert)
    
    # Search
    distances, indices = index.search(query_vecs, k=5)
    
    # Calculate Metrics
    precision_scores = []
    top1_hits = 0
    
    print("\n📝 Checking Constraints (Location + Instrument)...")
    
    for i in range(n_samples):
        learner = test_set.iloc[i]
        l_loc = learner['location']
        l_inst = learner['instrument_type']
        
        # Check Top 5
        matches = inst_df.iloc[indices[i]]
        # A "Hit" is exact Location match AND exact Instrument match
        hits = (matches['location'] == l_loc) & (matches['instrument_type'] == l_inst)
        
        precision_scores.append(hits.sum() / 5.0)
        
        # Check Top 1
        if hits.iloc[0]:
            top1_hits += 1
            
    avg_precision = np.mean(precision_scores)
    top1_acc = top1_hits / n_samples
    
    print("-" * 40)
    print(f"📊 TARUMBETA V3 PERFORMANCE REPORT")
    print("-" * 40)
    print(f"✅ Top-1 Accuracy: {top1_acc:.2%}")
    print(f"   (Probability the first recommendation is perfect)")
    print(f"✅ Precision@5:    {avg_precision:.2%}")
    print(f"   (Average % of the top 5 that are perfect matches)")
    print("-" * 40)
    
    if top1_acc > 0.90:
        print("🚀 VERDICT: PRODUCTION READY")
    elif top1_acc > 0.75:
        print("⚠️ VERDICT: GOOD, BUT DATA LIMITED (Cold Start Issues)")
    else:
        print("❌ VERDICT: NEEDS TUNING")

if __name__ == "__main__":
    evaluate()
