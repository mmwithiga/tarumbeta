"""
Supabase Client Configuration
"""
import os
from supabase import create_client, Client

# Get credentials from environment
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables")

# Create Supabase client with service role key (full access)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print(f"✅ Supabase client initialized: {SUPABASE_URL}")
