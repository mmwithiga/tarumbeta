import sys
import os
# Add backend to path so imports work
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

try:
    from app.tarumbeta_ml.src.api.inference_semantic import get_matches
except ImportError:
    # Try adding parent dir if running from backend dir
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from app.tarumbeta_ml.src.api.inference_semantic import get_matches

def test_integration():
    print("Testing ML Model integration (Direct)...")
    
    learner = {
        'instrument_type': 'Guitar',
        'experience_level': 'beginner',
        'learning_goals': ['chords'],
        'location': 'Nairobi',
        'learning_style': 'flexible',
        'budget': 1000
    }

    print("Predicting matches...")
    matches = get_matches(learner, top_k=5)
    print(f"Found {len(matches)} matches")
    for m in matches:
        print(f"- {m['name']} ({m['instructor_id']}): {m['match_score']}")
        print(f"  Rate: {m['hourly_rate']}, Rating: {m['rating']}")
        print(f"  Bio: {m['bio_short']}")

if __name__ == "__main__":
    test_integration()
