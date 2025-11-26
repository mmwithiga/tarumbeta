import os

# 1. Define Project Paths
# This ensures all scripts know where to find data and save models
import os
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
DATA_RAW = os.path.join(BASE_DIR, "datasets/raw")
DATA_PROCESSED = os.path.join(BASE_DIR, "datasets/processed")
OUTPUTS = os.path.join(BASE_DIR, "outputs")
SEMANTIC_MODELS = os.path.join(OUTPUTS, "semantic_models")

# 2. Define The "Brute Force" Weights (The Supervisor's Core Requirement)
# -----------------------------------------------------------------------
# Categorical (Location, Instrument, Language, Level) -> 80% impact
# This guarantees that a user in 'Nairobi' rarely sees a 'Mombasa' teacher.
WEIGHT_CAT = 0.80

# Numerical (Price, Rating) -> 10% impact
# This helps rank 'Better Rated' or 'Cheaper' teachers higher among valid matches.
WEIGHT_NUM = 0.10

# Text (Bio/Title Semantics) -> 10% impact
# This allows 'Rockstar' to match 'Guitar', but won't break the location constraint.
WEIGHT_TXT = 0.10

# 3. Reproducibility
RANDOM_SEED = 42
