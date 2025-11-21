import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export interface Lesson {
  id: string;
  instructor_id: string;
  learner_id: string;
  rental_id?: string;
  instrument: string;
  skill_level?: string;
  session_type: 'online' | 'in-person';
  scheduled_time: string;
  duration_minutes: number;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  instructor_profiles?: any;
}

export const lessonsService = {
  /**
   * Create lesson
   */
  create: async (data: {
    instructor_id: string;
    rental_id?: string;
    instrument: string;
    skill_level?: string;
    session_type: string;
    scheduled_time: string;
    duration_minutes: number;
    price: number;
  }) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // FIXED: Use correct schema field names
      const response = await fetch(`${API_URL}/api/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          instructor_id: data.instructor_id,
          scheduled_time: data.scheduled_time,      // FIXED: was scheduled_at
          duration_minutes: data.duration_minutes,  // FIXED: was duration
          session_type: data.session_type,          // FIXED: was lesson_type
          rental_id: data.rental_id,
          instrument: data.instrument,
          skill_level: data.skill_level,
          price: data.price
          // REMOVED: notes field (doesn't exist in schema)
        })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to book lesson' }));
        throw new Error(error.error || 'Failed to book lesson');
      }
      
      const lesson = await response.json();
      console.log('✅ Lesson booked successfully');
      return lesson;
      
    } catch (error: any) {
      console.error('❌ Book lesson error:', error);
      throw error;
    }
  },

  /**
   * Get lesson by ID
   */
  getById: async (id: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/lessons/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Lesson not found' }));
        throw new Error(error.error || 'Lesson not found');
      }
      
      const lesson = await response.json();
      return lesson;
      
    } catch (error: any) {
      console.error('❌ Get lesson error:', error);
      throw error;
    }
  },

  /**
   * Get learner lessons
   */
  getLearnerLessons: async (learnerId: string, status?: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/lessons/my-lessons`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch lessons' }));
        throw new Error(error.error || 'Failed to fetch lessons');
      }
      
      const data = await response.json();
      let lessons = data.as_learner || [];
      
      // Filter by status if specified
      if (status) {
        lessons = lessons.filter((l: any) => l.status === status);
      }
      
      return lessons;
      
    } catch (error: any) {
      console.error('❌ Get learner lessons error:', error);
      return [];
    }
  },

  /**
   * Get instructor lessons
   */
  getInstructorLessons: async (instructorId: string, status?: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/lessons/my-lessons`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch lessons' }));
        throw new Error(error.error || 'Failed to fetch lessons');
      }
      
      const data = await response.json();
      let lessons = data.as_instructor || [];
      
      // Filter by status if specified
      if (status) {
        lessons = lessons.filter((l: any) => l.status === status);
      }
      
      return lessons;
      
    } catch (error: any) {
      console.error('❌ Get instructor lessons error:', error);
      return [];
    }
  },

  /**
   * Update lesson status
   */
  updateStatus: async (id: string, status: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Use appropriate endpoint based on status
      let endpoint = '';
      let method = 'PUT';
      
      if (status === 'cancelled') {
        endpoint = `/api/lessons/${id}/cancel`;
      } else if (status === 'completed') {
        endpoint = `/api/lessons/${id}/complete`;
      } else {
        // Generic status update (fallback)
        endpoint = `/api/lessons/${id}`;
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update lesson status' }));
        throw new Error(error.error || 'Failed to update lesson status');
      }
      
      const lesson = await response.json();
      console.log('✅ Lesson status updated successfully');
      return lesson;
      
    } catch (error: any) {
      console.error('❌ Update lesson status error:', error);
      throw error;
    }
  },
};