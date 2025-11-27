import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export interface Instructor {
  id: string;
  user_id: string;
  instrument: string;
  skill_level: string;
  experience_years: number;
  hourly_rate: number;
  genre?: string;
  bio?: string;
  rating: number;
  total_reviews: number;
  total_students: number;
  is_verified: boolean;
  availability?: any;
  profile_image_url?: string;
  users?: {
    full_name: string;
    location?: string;
    avatar_url?: string;
    email?: string;
    phone?: string;
  };
  // ML API flat fields
  instructor_name?: string;
  instructor_avatar?: string;
  match_score?: number;
  match_reasons?: string[];
  recommendation_strength?: string;
  languages?: string[];
}

export const instructorsService = {
  /**
   * Get all instructors with optional filters and pagination
   */
  getAll: async (params?: {
    instrument?: string;
    verified?: boolean;
    min_rating?: number;
    skill_level?: string;
    page?: number;
    page_size?: number;
  }) => {
    try {
      console.log('📡 Fetching instructors from Flask API...');

      const token = await getAuthToken();

      const queryParams = new URLSearchParams();
      if (params?.instrument) queryParams.append('instrument', params.instrument);
      if (params?.verified !== undefined) queryParams.append('verified', params.verified.toString());
      if (params?.min_rating) queryParams.append('min_rating', params.min_rating.toString());
      if (params?.skill_level) queryParams.append('skill_level', params.skill_level);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const response = await fetch(`${API_URL}/api/instructors?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch instructors' }));
        throw new Error(error.error || 'Failed to fetch instructors');
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data?.length || 0} instructors`);

      return { instructors: data || [] };

    } catch (error: any) {
      console.error('❌ Get instructors error:', error);
      return { instructors: [] };
    }
  },

  /**
   * Get single instructor by ID
   */
  getById: async (id: string) => {
    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/api/instructors/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Instructor not found' }));
        throw new Error(error.error || 'Instructor not found');
      }

      const instructor = await response.json();
      return instructor;

    } catch (error: any) {
      console.error('❌ Get instructor error:', error);
      throw error;
    }
  },

  /**
   * Create instructor profile
   */
  create: async (data: Partial<Instructor>) => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/instructors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create instructor profile' }));
        throw new Error(error.error || 'Failed to create instructor profile');
      }

      const instructor = await response.json();
      console.log('✅ Instructor profile created successfully');
      return instructor;

    } catch (error: any) {
      console.error('❌ Create instructor error:', error);
      throw error;
    }
  },

  /**
   * Update instructor profile
   */
  update: async (id: string, data: Partial<Instructor>) => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/instructors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update instructor profile' }));
        throw new Error(error.error || 'Failed to update instructor profile');
      }

      const instructor = await response.json();
      console.log('✅ Instructor profile updated successfully');
      return instructor;

    } catch (error: any) {
      console.error('❌ Update instructor error:', error);
      throw error;
    }
  },

  /**
   * Get instructor by user ID
   * NOW USES FLASK API! ✅
   */
  getByUserId: async (userId: string) => {
    try {
      console.log('📡 Fetching instructor by user ID from Flask...');

      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/api/instructors/by-user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch instructor' }));
        console.log('ℹ️  Instructor not found for user:', userId);
        return null;
      }

      const instructor = await response.json();
      return instructor;

    } catch (error) {
      console.error('❌ Get instructor by user ID error:', error);
      return null;
    }
  },

  /**
   * Find matching instructors using ML model
   */
  findMatches: async (profile: any) => {
    try {
      console.log('📡 Finding matches using ML model...');

      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/api/matching/find-instructors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to find matches' }));
        throw new Error(error.error || 'Failed to find matches');
      }

      const data = await response.json();
      console.log(`✅ Found ${data.matches?.length || 0} matches`);

      // Map backend response to Instructor interface
      // The backend returns 'instructor_id', but frontend expects 'id'
      const mappedMatches = (data.matches || []).map((m: any) => ({
        ...m,
        id: m.instructor_id || m.id, // Ensure 'id' is present
      }));

      return mappedMatches;

    } catch (error: any) {
      console.error('❌ Find matches error:', error);
      throw error;
    }
  }
};