import sys
import os
import json
# Add backend to path so imports work
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

try:
    from app.tarumbeta_ml.src.api.inference_semantic import get_matches
except ImportError:
    # Try adding parent dir if running from backend dir
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from app.tarumbeta_ml.src.api.inference_semantic import get_matches

def debug_matches():
    print("Debugging ML Model matches...")
    
    learner = {
        'instrument_type': 'Piano',
        'experience_level': 'beginner',
        'learning_goals': ['chords'],
        'location': 'Nairobi',
        'learning_style': 'flexible',
        'budget': 2000
    }

    print("1. Calling get_matches...")
    matches = get_matches(learner, top_k=12)
    
    print(f"2. Raw matches count: {len(matches)}")
    print("3. Raw names:")
    for i, m in enumerate(matches):
        print(f"   [{i}] '{m['name']}' (len={len(m['name'])})")
        # Print hex to see hidden characters
        print(f"       Hex: {m['name'].encode('utf-8').hex()}")

    print("\n4. Testing Deduplication Logic...")
    seen_names = set()
    final_matches = []
    
    for m in matches:
        raw_name = m['name']
        normalized_name = raw_name.strip().lower()
        
        if normalized_name in seen_names:
            print(f"   ❌ Duplicate found: '{raw_name}' -> '{normalized_name}'")
            continue
        
        print(f"   ✅ Keeping: '{raw_name}' -> '{normalized_name}'")
        seen_names.add(normalized_name)
        final_matches.append(m)
        
    print(f"\n5. Final unique count: {len(final_matches)}")

if __name__ == "__main__":
    debug_matches()
