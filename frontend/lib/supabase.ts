import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnylabzcycqzjongwbgy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRueWxhYnpjeWNxempvbmd3Ymd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzYzODgsImV4cCI6MjA3ODUxMjM4OH0.45i2Kj6OlFspSx2jfL68bXdoFORk-JGj1xiMvCmYNJ4';

console.log('🔧 Initializing Supabase client...');
console.log('📍 URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

console.log('✅ Supabase client created');