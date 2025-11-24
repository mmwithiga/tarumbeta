import pandas as pd
import numpy as np
import pickle
import os
import sys
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize
from sklearn.metrics import top_k_accuracy_score

# Add project root to path
sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def load_artifacts():
    print("⏳ Loading Artifacts for Evaluation...")
    with open(os.path.join(config.SEMANTIC_MODELS, 'knn_model.pkl'), 'rb') as f:
        model = pickle.load(f)
    with open(os.path.join(config.SEMANTIC_MODELS, 'encoder.pkl'), 'rb') as f:
        encoder = pickle.load(f)
    with open(os.path.join(config.SEMANTIC_MODELS, 'scaler.pkl'), 'rb') as f:
        scaler = pickle.load(f)
    
    # Load the BERT model for text
    bert = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Load Data
    instructors_df = pd.read_csv(os.path.join(config.DATA_PROCESSED, 'instructors_processed.csv'))
    learners_df = pd.read_csv(os.path.join(config.DATA_PROCESSED, 'learners_processed.csv'))
    
    return model, encoder, scaler, bert, instructors_df, learners_df

def construct_vectors(df, encoder, scaler, bert):
    # Replicate the exact vectorization logic from Step 5
    # 1. Categorical
    cat_cols = ['location', 'instrument_type', 'teaching_language', 'skill_level']
    cat_matrix = encoder.transform(df[cat_cols])
    cat_matrix = normalize(cat_matrix, axis=1, norm='l2') * config.WEIGHT_CAT
    
    # 2. Numerical
    num_cols = ['hourly_rate', 'rating', 'years_experience']
    num_matrix = scaler.transform(df[num_cols])
    num_matrix = normalize(num_matrix, axis=1, norm='l2') * config.WEIGHT_NUM
    
    # 3. Text
    text_matrix = bert.encode(df['bio_keywords'].tolist())
    text_matrix = normalize(text_matrix, axis=1, norm='l2') * config.WEIGHT_TXT
    
    # 4. Stack
    return np.hstack([cat_matrix, num_matrix, text_matrix])

def evaluate(n_samples=100):
    model, encoder, scaler, bert, instructors_df, learners_df = load_artifacts()
    
    # Sample Test Set (100 random learners)
    test_set = learners_df.sample(n_samples, random_state=42)
    print(f"\n🧪 Evaluating on {n_samples} random learners...")
    
    # Vectorize Test Set
    query_vectors = construct_vectors(test_set, encoder, scaler, bert)
    
    # Get Top 5 Matches
    distances, indices = model.kneighbors(query_vectors, n_neighbors=5)
    
    precision_scores = []
    perfect_match_count = 0
    
    print("\n📝 Checking Constraints (Location + Instrument)...")
    
    for i in range(n_samples):
        learner = test_set.iloc[i]
        learner_loc = learner['location']
        learner_inst = learner['instrument_type']
        
        # Get matches for this learner
        match_indices = indices[i]
        matches = instructors_df.iloc[match_indices]
        
        # A "Hit" is if the instructor shares BOTH Location and Instrument
        hits = (matches['location'] == learner_loc) & (matches['instrument_type'] == learner_inst)
        
        # Precision@5 for this user
        precision_scores.append(hits.sum() / 5.0)
        
        # Check if the #1 match is perfect
        if hits.iloc[0]:
            perfect_match_count += 1
            
    avg_precision = np.mean(precision_scores)
    top1_accuracy = perfect_match_count / n_samples
    
    print("-" * 40)
    print(f"📊 MODEL PERFORMANCE REPORT")
    print("-" * 40)
    print(f"✅ Precision@5 (Constraint Satisfaction): {avg_precision:.2%}")
    print(f"   (Avg % of top 5 results that match Location & Instrument exactly)")
    print(f"✅ Top-1 Accuracy: {top1_accuracy:.2%}")
    print(f"   (% of time the very first result is a perfect match)")
    print("-" * 40)

if __name__ == "__main__":
    evaluate()
