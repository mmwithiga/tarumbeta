import os

# Base Paths
BASE_DIR = "/content/tarumbeta-ml"
DATA_RAW = os.path.join(BASE_DIR, "datasets/raw")
DATA_PROCESSED = os.path.join(BASE_DIR, "datasets/processed")
OUTPUTS = os.path.join(BASE_DIR, "outputs")
SEMANTIC_MODELS = os.path.join(OUTPUTS, "semantic_models")

# --- SUPERVISOR BRUTE FORCE CONFIG ---
WEIGHT_CAT = 0.80  # Hard Constraint
WEIGHT_NUM = 0.10
WEIGHT_TXT = 0.10

RANDOM_SEED = 42
