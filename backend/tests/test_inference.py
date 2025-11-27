import sys
import os
import logging

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.tarumbeta_ml.src.api.inference_semantic import get_matches

def test_inference():
    print("🧪 Testing ML Inference...")
    
    # Sample profile
    profile = {
        'location': 'Nairobi',
        'instrument_type': 'Guitar',
        'skill_level': 'Beginner',
        'teaching_language': 'English',
        'bio_keywords': 'I want to learn acoustic guitar and play pop songs',
        'budget': 1500
    }
    
    # Mock candidates (Real instructors from DB)
    candidates = [
        {
            'id': 'real-inst-1',
            'instrument': 'Guitar',
            'skill_level': 'Beginner',
            'hourly_rate': 1500,
            'rating': 4.8,
            'experience_years': 5,
            'bio': 'I teach acoustic guitar for beginners.',
            'genre': 'Pop',
            'users': {'location': 'Nairobi'}
        },
        {
            'id': 'real-inst-2',
            'instrument': 'Piano',
            'skill_level': 'Advanced',
            'hourly_rate': 3000,
            'rating': 5.0,
            'experience_years': 10,
            'bio': 'Classical piano expert.',
            'genre': 'Classical',
            'users': {'location': 'Mombasa'}
        }
    ]

    try:
        print(f"🧪 Testing with {len(candidates)} candidates...")
        matches = get_matches(profile, candidates=candidates)
        print(f"✅ Success! Got {len(matches)} matches.")
        
        for i, match in enumerate(matches, 1):
            print(f"\nMatch {i}:")
            print(f"  ID: {match['instructor_id']}")
            print(f"  Score: {match['match_score']}")
            print(f"  Bio: {match['bio_short']}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_inference()
