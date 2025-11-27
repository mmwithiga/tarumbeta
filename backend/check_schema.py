import sys
import os
from dotenv import load_dotenv

# Add backend to path so imports work
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
load_dotenv()

from app.utils.supabase_client import supabase

def check_schema():
    print("Checking 'lessons' table...")
    try:
        # Try to select * limit 1 to see keys
        res = supabase.table('lessons').select('*').limit(1).execute()
        if res.data:
            print("Keys:", res.data[0].keys())
        else:
            print("Table empty, cannot infer keys easily via select.")
    except Exception as e:
        print(f"Error: {e}")

    print("\nChecking 'instructor_matches' table...")
    try:
        res = supabase.table('instructor_matches').select('*').limit(1).execute()
        if res.data:
            print("Keys:", res.data[0].keys())
        else:
            print("Table empty.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
