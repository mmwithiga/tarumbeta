import pickle
import os
import sys
from sklearn.neighbors import NearestNeighbors

# Add project root to path
sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def train_model():
    print("🧠 Starting SEMANTIC Model Training (Supervisor Config)...")
    
    # 1. Load Data from the NEW Semantic folder
    # Note: We look for 'instructors_vec.pkl' in 'semantic_models'
    vec_path = os.path.join(config.SEMANTIC_MODELS, 'instructors_vec.pkl')
    
    if not os.path.exists(vec_path):
        raise FileNotFoundError(f"❌ Vectors not found at {vec_path}. Did you run Step 5 (vectorize_semantic.py)?")
        
    with open(vec_path, 'rb') as f:
        instructor_vectors = pickle.load(f)
        
    print(f"   🔹 Loaded Dense Vectors: {instructor_vectors.shape}")
    
    # 2. Initialize KNN Model
    # metric='cosine': Required by Supervisor
    # algorithm='brute': Required for exact calculation on dense vectors
    model = NearestNeighbors(n_neighbors=20, metric='cosine', algorithm='brute')
    
    # 3. Fit the Model
    print("   Fitting KNN model on Dense Vectors...")
    model.fit(instructor_vectors)
    
    # 4. Save the Model to the Semantic Folder
    model_path = os.path.join(config.SEMANTIC_MODELS, 'knn_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"✅ Model Trained & Saved.")
    print(f"📂 Location: {model_path}")

if __name__ == "__main__":
    train_model()
