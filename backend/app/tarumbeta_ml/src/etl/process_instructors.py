import pandas as pd
import numpy as np
import os
import sys
import random

# Setup path to import config
sys.path.append('/content/tarumbeta-ml')
from src.utils import config

def extract_name_from_title(title):
    """ Tries to extract a name from the course title, or generates a Kenyan placeholder. """
    title = str(title)
    if ' with ' in title:
        return title.split(' with ')[-1].split(' - ')[0].split(' | ')[0].title()
    # Fallback: Generate realistic Kenyan names if title doesn't have "with [Name]"
    first = random.choice(['John','Mary','David','Sarah','Joseph','Grace','Peter','Ann','Michael','Jane','Paul','Esther'])
    last  = random.choice(['Kamau','Ochieng','Wanjiku','Otieno','Achieng','Kiprop','Chebet','Mutai','Njoroge','Mwangi'])
    return f"{first} {last}"

def get_instrument(text):
    """ Maps title text to the 8 Core Instruments. """
    text = str(text).lower()
    # Priority order matters (e.g. 'Bass Guitar' should hit 'Guitar' or 'Bass')
    # We stick to your 8 core instruments
    mapping = {
        'guitar': 'Guitar', 'piano': 'Piano', 'drum': 'Drums', 
        'violin': 'Violin', 'saxophone': 'Saxophone', 'flute': 'Flute', 
        'cello': 'Cello', 'voice': 'Voice', 'singing': 'Voice', 'vocal': 'Voice'
    }
    for key, val in mapping.items():
        if key in text:
            return val
    return 'Piano' # Default fallback if unclear

def run_instructor_etl():
    print("⚙️  Starting Instructor ETL (Udemy Source)...")
    
    # 1. Load Raw Data
    raw_path = os.path.join(config.DATA_RAW, 'udemy_courses.csv')
    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"❌ Missing {raw_path}. Did you upload it?")
    
    df = pd.read_csv(raw_path)
    print(f"   Loaded {len(df)} raw courses.")
    
    # 2. Filter for Music
    # The dataset has a 'subject' column. We only want 'Musical Instruments'
    if 'subject' in df.columns:
        df = df[df['subject'] == 'Musical Instruments'].copy()
    print(f"   Filtered to {len(df)} music courses.")

    # 3. Feature Engineering
    # A. Name & Instrument
    df['name'] = df['course_title'].apply(extract_name_from_title)
    df['instrument_type'] = df['course_title'].apply(get_instrument)
    
    # B. Kenyan Context (The Injection)
    # We force these real courses to be located in Kenya for your platform demo
    cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika']
    probs  = [0.5, 0.15, 0.10, 0.10, 0.10, 0.05] # Weighted to Nairobi
    
    df['location'] = np.random.choice(cities, size=len(df), p=probs)
    df['teaching_language'] = np.random.choice(['English', 'Swahili'], size=len(df), p=[0.85, 0.15])
    
    # C. Standardize Numericals
    # Map Udemy 'price' -> hourly_rate
    # Map Udemy 'level' -> skill_level
    df['hourly_rate'] = df['price'].replace(0, 20) # Treat free courses as cheap lessons
    df['skill_level'] = df['level'].map({
        'All Levels': 'Intermediate', 
        'Beginner Level': 'Beginner', 
        'Intermediate Level': 'Intermediate', 
        'Expert Level': 'Advanced'
    }).fillna('Intermediate')
    
    # D. Rating Normalization (0-5 scale)
    # Udemy has 'num_reviews'. We use this as a proxy for "Verified Rating"
    # We normalize log-scale because reviews vary wildly
    df['rating'] = np.log1p(df['num_reviews']) 
    df['rating'] = (df['rating'] / df['rating'].max()) * 5.0 # Scale to 0-5
    df['rating'] = df['rating'].round(1)
    
    # E. The "Semantic" Field
    # We use the Course Title as the 'Bio'. It contains rich keywords.
    df['bio_keywords'] = df['course_title']
    
    # 4. Final Cleanup
    # Keep only the columns the model needs
    cols = ['name', 'location', 'instrument_type', 'skill_level', 'teaching_language', 
            'hourly_rate', 'rating', 'bio_keywords']
    
    final_df = df[cols].reset_index(drop=True)
    
    # 5. Save
    out_path = os.path.join(config.DATA_PROCESSED, 'instructors_processed.csv')
    final_df.to_csv(out_path, index=False)
    print(f"✅ Saved {len(final_df)} Processed Instructors to {out_path}")

if __name__ == "__main__":
    np.random.seed(config.RANDOM_SEED)
    run_instructor_etl()
