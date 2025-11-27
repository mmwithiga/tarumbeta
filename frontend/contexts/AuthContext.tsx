import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ success: boolean } | void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'learner' | 'instructor' | 'owner' | 'admin';
  location?: string;
  profile?: any;
  avatar_url?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Safety timeout to prevent infinite loading
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth check timed out, forcing app load');
        setLoading(false);
      }
    }, 8000); // 8 seconds max wait

    console.log('🔐 AuthProvider: Checking session...');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error('❌ Error getting session:', error);
        setLoading(false);
        return;
      }

      console.log('🔐 Session check complete. User:', session?.user?.email || 'None');
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      if (!mounted) return;
      console.error('❌ Session fetch exception:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        console.log('🔐 Auth state changed:', _event);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, retries = 3) => {
    try {
      console.log(`👤 Fetching profile for ${userId}...`);

      // Create a promise that rejects after 5 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timed out')), 5000)
      );

      // Fetch user profile directly from Supabase
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Race the fetch against the timeout
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        // If profile not found and we have retries left, wait and try again
        if (error.code === 'PGRST116' && retries > 0) {
          console.log(`⚠️ User profile not found, retrying in 1s... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchUserProfile(userId, retries - 1);
        }
        console.error('❌ Error fetching user profile:', error);
        setLoading(false);
        return;
      }

      console.log('✅ User profile loaded:', data.full_name);
      setUserProfile(data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Exception fetching user profile:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = 'learner') => {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) return { error: authError };

      // Create user profile in our database
      if (authData.user) {
        // Wait a moment for auth to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data, error } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            role,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile:', error);
          // Don't return error, profile will be fetched on next login
        } else {
          // Set user profile immediately
          setUserProfile(data);
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 Signing out...");

      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }

      // Clear all state
      setUser(null);
      setSession(null);
      setUserProfile(null);

      // Clear localStorage
      localStorage.removeItem('supabase.auth.token');

      console.log("✅ Signed out successfully");

      // Return success without reload
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Even if server sign out fails, we must clear local state
      setUser(null);
      setSession(null);
      setUserProfile(null);
      localStorage.removeItem('supabase.auth.token');
      // Force reload to clear any other state
      window.location.href = '/';
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    userProfile,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}