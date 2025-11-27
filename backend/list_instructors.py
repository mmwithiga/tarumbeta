import sys
import os
# Add backend to path so imports work
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.utils.supabase_client import supabase

def list_instructors():
    print("Fetching instructors...")
    # Get users who are instructors
    response = supabase.table('instructor_profiles').select(
        'id, is_verified, users!inner(email, full_name, role)'
    ).execute()
    
    if response.data:
        print(f"Found {len(response.data)} instructors:")
        for i, inst in enumerate(response.data):
            print(f"[{i}] Name: {inst['users']['full_name']}")
            print(f"    Email: {inst['users']['email']}")
            print(f"    Verified: {inst['is_verified']}")
            print(f"    Profile ID: {inst['id']}")
            print("-" * 30)
    else:
        print("No instructors found.")

if __name__ == "__main__":
    list_instructors()
