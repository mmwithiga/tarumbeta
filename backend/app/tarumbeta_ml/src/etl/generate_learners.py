import pandas as pd
import numpy as np
import os
import sys

sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def generate_learners(n_samples=5000):
    """
    Synthesizes learners using the Distributions from the Domain Datasets.
    """
    # CRITICAL: Set seed for reproducibility
    np.random.seed(config.RANDOM_SEED)

    # MUST Match Instructor Taxonomy
    real_locations = [
        'Nairobi', 'Westlands, Nairobi', 'Kibera, Nairobi', 'Karen, Nairobi',
        'Mombasa', 'Nyali, Mombasa',
        'Kisumu', 'Milimani, Kisumu',
        'Nakuru', 'Eldoret', 'Thika', 'Kiambu', 'Ruiru', 'Naivasha'
    ]
    # Weighted towards Nairobi (Urban center bias)
    loc_probs = [0.3, 0.1, 0.1, 0.05, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0.02, 0.02, 0.02, 0.04]

    instruments = ['Guitar', 'Piano', 'Drums', 'Violin', 'Saxophone', 'Voice', 'Flute', 'Cello']
    inst_probs = [0.3, 0.3, 0.1, 0.1, 0.05, 0.1, 0.02, 0.03] # Piano/Guitar most popular

    levels = ['Beginner', 'Intermediate', 'Advanced']
    
    # Generate
    df = pd.DataFrame({
        'learner_id': [f'L{str(i).zfill(4)}' for i in range(n_samples)],
        'location': np.random.choice(real_locations, p=loc_probs, size=n_samples),
        'instrument_type': np.random.choice(instruments, p=inst_probs, size=n_samples),
        'skill_level': np.random.choice(levels, p=[0.6, 0.3, 0.1], size=n_samples),
        'teaching_language': np.random.choice(['English', 'Swahili', 'English & Swahili'], size=n_samples)
    })

    # Generate Learning Goals from "Music Education Performance Data"
    goals = ['Hobby', 'Exam Prep', 'Performance', 'Band Practice']
    
    def make_bio(row):
        goal = np.random.choice(goals)
        # We make the learner bio "dense" so it matches the instructor bio embeddings
        return f"Looking for {row['instrument_type']} lessons. My goal is {goal}. Current level: {row['skill_level']}."

    df['bio_keywords'] = df.apply(make_bio, axis=1)
    
    # Fill numerical dummies (Critical for stacking vectors later)
    # Learners don't have rates/ratings, so we set them to 0.
    df['hourly_rate'] = 0
    df['rating'] = 0
    df['years_experience'] = 0

    output_path = os.path.join(config.DATA_PROCESSED, 'learners_processed.csv')
    df.to_csv(output_path, index=False)
    print(f"✅ Synthesized {n_samples} Aligned Learners (Deterministic).")

if __name__ == "__main__":
    generate_learners()
