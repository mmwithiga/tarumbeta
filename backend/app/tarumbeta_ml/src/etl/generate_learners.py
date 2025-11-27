import pandas as pd
import numpy as np
import os
import sys
import random

# Setup path
sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def run_learner_generation():
    print("👥 Generating Synthetic Learners...")
    
    # 1. Define The "Demand" Parameters
    # These must overlap with Instructor "Supply" for matches to happen
    cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika']
    instruments = ['Guitar', 'Piano', 'Drums', 'Violin', 'Saxophone', 'Flute', 'Cello', 'Voice']
    levels = ['Beginner', 'Intermediate', 'Advanced']
    goals = ['Hobby', 'Exam Prep', 'Professional Performance', 'Band Practice', 'Just for Fun']
    
    # 2. Load Genre Data (if available) for Semantic flavor
    genre_path = os.path.join(config.DATA_RAW, 'music_genres.csv')
    if os.path.exists(genre_path):
        try:
            genre_df = pd.read_csv(genre_path)
            # Assuming the csv has a column like 'Genre' or similar. 
            # If not, we fall back to a default list.
            # We'll just grab any text column for variety or hardcode popular Kenyan genres
            genres = ['Afro-fusion', 'Benga', 'Gospel', 'Reggae', 'Hip Hop', 'Jazz', 'Classical', 'Rock', 'Pop']
        except:
            genres = ['Jazz', 'Classical', 'Rock', 'Pop']
    else:
        genres = ['Afro-fusion', 'Benga', 'Gospel', 'Reggae', 'Hip Hop', 'Jazz', 'Classical', 'Rock', 'Pop']

    # 3. Generate 5,000 Learners
    n_learners = 5000
    data = []
    
    for i in range(n_learners):
        inst = np.random.choice(instruments, p=[0.3, 0.3, 0.1, 0.1, 0.05, 0.05, 0.05, 0.05]) # Piano/Guitar popular
        genre = np.random.choice(genres)
        goal = np.random.choice(goals)
        
        # Build a "Semantic Bio" that S-BERT can understand
        # e.g., "I want to learn Jazz Piano for Professional Performance"
        bio = f"I want to learn {genre} {inst} for {goal}. {random.choice(['Looking for a strict teacher.', 'I want to have fun.', 'Need to prepare for ABRSM exams.'])}"
        
        learner = {
            'learner_id': f"L{str(i).zfill(4)}",
            'location': np.random.choice(cities, p=[0.4, 0.2, 0.1, 0.1, 0.1, 0.1]), # Nairobi bias
            'instrument_type': inst,
            'skill_level': np.random.choice(levels, p=[0.6, 0.3, 0.1]), # Mostly beginners
            'teaching_language': np.random.choice(['English', 'Swahili'], p=[0.7, 0.3]),
            'bio_keywords': bio,
            # Dummies for Numerical Fields (Learners don't have rates)
            'hourly_rate': 0, 
            'rating': 0,
            'years_experience': 0 # Added to match instructor schema if needed, though mostly unused for query
        }
        data.append(learner)
        
    # 4. Save
    df = pd.DataFrame(data)
    out_path = os.path.join(config.DATA_PROCESSED, 'learners_processed.csv')
    df.to_csv(out_path, index=False)
    print(f"✅ Generated {len(df)} Learners at {out_path}")
    print(f"   Sample Bio: {df.iloc[0]['bio_keywords']}")

if __name__ == "__main__":
    np.random.seed(config.RANDOM_SEED)
    run_learner_generation()
