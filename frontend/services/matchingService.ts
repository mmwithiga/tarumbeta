import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export interface InstructorMatch {
  id?: string;
  instructor_id: string;
  match_score: number;
  status: 'suggested' | 'viewed' | 'contacted' | 'accepted' | 'declined' | 'pending';
  instructor_data: {
    name: string;
    instrument: string;
    hourly_rate: number;
    rating: number;
    experience_years: number;
    bio: string;
    profile_image_url?: string;
    location?: string;
  };
  match_reasons?: string[];
}

export const matchingService = {
  /**
   * Generate matches using ML model via Flask
   * THIS IS THE MAIN ML INTEGRATION POINT!
   */
  generateMatches: async (learnerId: string, rentalId?: string, topN = 10) => {
    try {
      console.log('🤖 Generating instructor matches via Flask ML API...');
      
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Get instrument type from rental if provided
      let instrumentFilter = 'Guitar'; // Default
      if (rentalId) {
        const { data: rental } = await supabase
          .from('rentals')
          .select('instrument_listings(instrument_type)')
          .eq('id', rentalId)
          .single();

        if (rental?.instrument_listings) {
          instrumentFilter = (rental.instrument_listings as any).instrument_type;
        }
      }
      
      // Prepare learner profile for ML model
      const learnerProfile = {
        instrument_type: instrumentFilter,
        experience_level: 'beginner', // Could be pulled from user profile
        budget: 1000, // Default budget
        location: 'Nairobi',
        learning_goals: ['Learn basics', 'Improve technique'],
        learning_style: 'flexible',
        lesson_format: 'in-person'
      };
      
      const response = await fetch(`${API_URL}/api/matching/find-instructors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(learnerProfile)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to generate matches' }));
        throw new Error(error.error || 'Failed to generate matches');
      }
      
      const data = await response.json();
      
      // Transform Flask response to match frontend format
      const matches = (data.matches || []).map((match: any) => ({
        instructor_id: match.instructor_id,
        learner_id: learnerId,
        rental_id: rentalId,
        match_score: match.match_score,
        status: 'suggested' as const,
        features: {
          rating: match.rating || 0,
          experience_years: match.experience_years || 0,  // FIXED: was years_experience
          hourly_rate: match.hourly_rate || 0,
        },
        instructor_data: {
          name: match.instructor_name || 'Unknown',
          instrument: instrumentFilter,
          hourly_rate: match.hourly_rate || 0,
          rating: match.rating || 0,
          experience_years: match.experience_years || 0,  // FIXED: was years_experience
          bio: match.bio || '',
          profile_image_url: match.instructor_avatar,
          location: 'Nairobi', // Could be from match data
        },
        match_reasons: match.match_reasons || []
      }));
      
      console.log(`✅ Generated ${matches.length} ML-powered matches`);
      return matches as InstructorMatch[];
      
    } catch (error: any) {
      console.error('❌ Generate matches error:', error);
      
      // Fallback: Return empty array instead of crashing
      return [];
    }
  },

  /**
   * Get learner's match history
   */
  getLearnerMatches: async (learnerId: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/matching/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch match history' }));
        throw new Error(error.error || 'Failed to fetch match history');
      }
      
      const data = await response.json();
      
      // Transform to match frontend format
      const matches = (data || []).map((match: any) => ({
        id: match.id,
        instructor_id: match.instructor_id,
        match_score: match.match_score,
        status: match.status,
        instructor_data: {
          name: match.instructor_profiles?.users?.full_name || 'Unknown',  // FIXED: instructors -> instructor_profiles
          instrument: match.instructor_profiles?.instrument || '',
          hourly_rate: match.instructor_profiles?.hourly_rate || 0,
          rating: match.instructor_profiles?.rating || 0,
          experience_years: match.instructor_profiles?.experience_years || 0,  // FIXED: was years_experience
          bio: match.instructor_profiles?.bio || '',
          profile_image_url: match.instructor_profiles?.users?.avatar_url,
          location: match.instructor_profiles?.users?.location,
        },
      }));
      
      return matches as InstructorMatch[];
      
    } catch (error: any) {
      console.error('❌ Get learner matches error:', error);
      return [];
    }
  },

  /**
   * Update match status
   */
  updateStatus: async (matchId: string, status: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/matching/accept/${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update match status' }));
        throw new Error(error.error || 'Failed to update match status');
      }
      
      const match = await response.json();
      console.log('✅ Match status updated successfully');
      return match;
      
    } catch (error: any) {
      console.error('❌ Update match status error:', error);
      throw error;
    }
  },

  /**
   * Get model info (for ML transparency)
   */
  getModelInfo: async () => {
    return {
      model_version: 'ml_v1',
      model_type: 'Flask ML Integration',
      description: 'Machine learning model running on Flask backend for instructor matching',
      features: [
        'instructor_rating',
        'experience_years',
        'hourly_rate',
        'location_proximity',
        'teaching_style_match',
        'student_success_rate',
      ],
    };
  },
};