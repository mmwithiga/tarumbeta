import os

# Base Paths
# Base Paths
# Dynamically find the tarumbeta_ml directory (2 levels up from utils/config.py)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_RAW = os.path.join(BASE_DIR, "datasets/raw")
DATA_PROCESSED = os.path.join(BASE_DIR, "datasets/processed")
OUTPUTS = os.path.join(BASE_DIR, "outputs")
SEMANTIC_MODELS = os.path.join(OUTPUTS, "semantic_models")

# --- SUPERVISOR WEIGHTING ARCHITECTURE ---
# These are applied to the normalized blocks BEFORE concatenation (np.hstack).
# Requirement: 
# 1. Categorical (Instrument/Location) must dominate (0.80)
# 2. Numerical (Price/Rating) is secondary (0.10)
# 3. Text (Bio) is supporting (0.10)

WEIGHT_CAT = 0.80  # The "Hard Constraints"
WEIGHT_NUM = 0.10  # The "Qualifiers"
WEIGHT_TXT = 0.10  # The "Vibes" (Semantic Search)

# Random Seeds
RANDOM_SEED = 42
