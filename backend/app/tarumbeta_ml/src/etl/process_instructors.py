import pandas as pd
import numpy as np
import os
import sys

# Ensure we can find the config no matter where we run this
sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def load_simulation_data():
    """
    Simulates loading the 3 specific datasets identified in the Discovery Report.
    """
    # CRITICAL: Set the seed for reproducibility
    np.random.seed(config.RANDOM_SEED)

    # 1. Base Structure: Upwork Freelancers
    n_samples = 2000 
    df_base = pd.DataFrame({
        'instructor_id': [f'I{str(i).zfill(4)}' for i in range(n_samples)],
        'name': [f'Instructor_{i}' for i in range(n_samples)],
        'hourly_rate': np.random.lognormal(3, 0.5, n_samples).astype(int), 
        'rating': np.random.beta(8, 2, n_samples), 
        'years_experience': np.random.randint(1, 25, n_samples)
    })

    # 2. Context: Open Schools Kenya (Real Locations)
    real_locations = [
        'Nairobi', 'Westlands, Nairobi', 'Kibera, Nairobi', 'Karen, Nairobi',
        'Mombasa', 'Nyali, Mombasa',
        'Kisumu', 'Milimani, Kisumu',
        'Nakuru', 'Eldoret', 'Thika', 'Kiambu', 'Ruiru', 'Naivasha'
    ]
    df_base['location'] = np.random.choice(real_locations, size=n_samples)

    # 3. Domain: Music Taxonomy
    instruments = ['Guitar', 'Piano', 'Drums', 'Violin', 'Saxophone', 'Voice', 'Flute', 'Cello']
    df_base['instrument_type'] = np.random.choice(instruments, size=n_samples)

    # 4. Skill Level (Required for "Hard Constraint" weighting)
    levels = ['Beginner', 'Intermediate', 'Advanced']
    df_base['skill_level'] = np.random.choice(levels, p=[0.1, 0.4, 0.5], size=n_samples)

    return df_base

def enrich_profiles(df):
    """
    Applies NLP generation to create rich bios for the Semantic Search.
    """
    np.random.seed(config.RANDOM_SEED) # Ensure text gen is also reproducible
    
    genres = ['Classical', 'Jazz', 'Afro-fusion', 'Gospel', 'Pop', 'Rock', 'Reggae', 'Benga']
    langs = ['English', 'Swahili', 'English & Swahili', 'English & Kikuyu']

    df['teaching_language'] = np.random.choice(langs, p=[0.4, 0.2, 0.35, 0.05], size=len(df))
    
    def generate_bio(row):
        # We construct a sentence that is "Dense" with keywords for the embedding model
        my_genres = np.random.choice(genres, size=2, replace=False)
        return f"Professional {row['instrument_type']} teacher specializing in {my_genres[0]} and {my_genres[1]}. {row['years_experience']} years of teaching experience. fluent in {row['teaching_language']}."

    df['bio_keywords'] = df.apply(generate_bio, axis=1)
    
    # Clip outliers for cleaner normalization later
    df['hourly_rate'] = df['hourly_rate'].clip(5, 100) 
    
    return df

def run_etl():
    print("🚀 Starting Synthesis Pipeline (Upwork + Kenya + Music Data)...")
    
    df_base = load_simulation_data()
    df_processed = enrich_profiles(df_base)
    
    os.makedirs(config.DATA_PROCESSED, exist_ok=True)
    output_path = os.path.join(config.DATA_PROCESSED, 'instructors_processed.csv')
    df_processed.to_csv(output_path, index=False)
    
    print(f"✅ Synthesized {len(df_processed)} Realistic Instructor Profiles (Deterministic).")
    return df_processed

if __name__ == "__main__":
    run_etl()
