def test_deduplication():
    matches = [
        {'name': 'John Doe', 'score': 0.9},
        {'name': 'John Doe ', 'score': 0.9}, # Trailing space
        {'name': 'john doe', 'score': 0.9},  # Lowercase
        {'name': 'Jane Smith', 'score': 0.8}
    ]
    
    seen_names = set()
    final_matches = []
    
    print("Input matches:", [m['name'] for m in matches])
    
    for m in matches:
        raw_name = m['name']
        normalized_name = raw_name.strip().lower()
        
        if normalized_name in seen_names:
            print(f"Skipping duplicate: '{raw_name}' (normalized: '{normalized_name}')")
            continue
        seen_names.add(normalized_name)
        final_matches.append(m)
        
    print("Final matches:", [m['name'] for m in final_matches])
    
    assert len(final_matches) == 2
    assert final_matches[0]['name'] == 'John Doe'
    assert final_matches[1]['name'] == 'Jane Smith'
    print("✅ Deduplication test passed!")

if __name__ == "__main__":
    test_deduplication()
