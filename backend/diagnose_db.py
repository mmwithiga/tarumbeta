import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env vars
load_dotenv()

print(f"📂 Current Working Directory: {os.getcwd()}")
print(f"📄 .env file exists: {os.path.exists('.env')}")

# Initialize Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("❌ Error: SUPABASE_URL or SUPABASE_KEY not found in environment.")
    sys.exit(1)

supabase: Client = create_client(url, key)

def diagnose():
    print("🔍 Diagnosing Instructor Database...")
    
    # 1. Fetch all instructors
    try:
        response = supabase.from_('instructor_profiles') \
            .select('*, users!instructor_profiles_user_id_fkey(full_name, email, location)') \
            .execute()
        
        instructors = response.data
        
        print(f"📊 Total Instructors Found: {len(instructors)}")
        
        if not instructors:
            print("⚠️ Database is empty! No instructors to match against.")
            return

        print("\n📋 Instructor List:")
        for inst in instructors:
            user = inst.get('users', {})
            print(f"  - ID: {inst['id']}")
            print(f"    Name: {user.get('full_name', 'Unknown')}")
            print(f"    Instrument: {inst.get('instrument')}")
            print(f"    Location: {user.get('location')}")
            print(f"    Verified: {inst.get('is_verified')}")
            print("    ---")
            
        # 2. Check Verified Count
        verified = [i for i in instructors if i.get('is_verified')]
        print(f"\n✅ Verified Instructors: {len(verified)}")
        
        if not verified:
            print("⚠️ No VERIFIED instructors. The app only matches verified instructors.")
            
    except Exception as e:
        print(f"❌ Error querying Supabase: {str(e)}")

if __name__ == "__main__":
    diagnose()
