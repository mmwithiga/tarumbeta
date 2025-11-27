import sys
import os
from dotenv import load_dotenv

# Add backend to path so imports work
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
load_dotenv()

from app.utils.supabase_client import supabase

def get_master_details():
    email = "master@tarumbeta.com"
    print(f"Fetching details for {email}...")
    
    # Get user and instructor profile
    response = supabase.table('instructor_profiles').select(
        'id, is_verified, users!inner(id, email, full_name, avatar_url)'
    ).eq('users.email', email).execute()
    
    if response.data:
        inst = response.data[0]
        print(f"✅ Found Master Instructor:")
        print(f"    Name: {inst['users']['full_name']}")
        print(f"    User ID: {inst['users']['id']}")
        print(f"    Profile ID: {inst['id']}")
        print(f"    Verified: {inst['is_verified']}")
        
        if not inst['is_verified']:
            print("⚠️ Account is NOT verified. Verifying now...")
            supabase.table('instructor_profiles').update({'is_verified': True}).eq('id', inst['id']).execute()
            print("✅ Account verified.")
            
    else:
        print("❌ Instructor profile not found. Checking public.users...")
        # Check public.users
        user_res = supabase.table('users').select('id, full_name, email').eq('email', email).execute()
        
        if user_res.data:
            user = user_res.data[0]
            print(f"✅ Found User: {user['full_name']} ({user['id']})")
            print("Creating instructor profile...")
            
            new_profile = {
                'user_id': user['id'],
                'instrument': 'Piano', # Default
                'experience_years': 10,
                'hourly_rate': 2000,
                'is_verified': True,
                'bio': 'Master Instructor for Tarumbeta AI Matches'
            }
            
            try:
                ins_res = supabase.table('instructor_profiles').insert(new_profile).execute()
                if ins_res.data:
                    print(f"✅ Created Instructor Profile: {ins_res.data[0]['id']}")
            except Exception as e:
                print(f"Failed to create profile: {e}")
        else:
            print("❌ User not found in public.users either. Did you sign up?")

if __name__ == "__main__":
    get_master_details()
