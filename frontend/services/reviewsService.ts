import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export interface Review {
  id: string;
  reviewer_id: string;
  target_type: 'instructor' | 'instrument';
  target_id: string;
  rating: number;
  comment: string;
  created_at: string;
  users?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const reviewsService = {
  /**
   * Get all reviews for a target (instructor or instrument)
   */
  getByTarget: async (targetType: 'instructor' | 'instrument', targetId: string) => {
    try {
      const token = await getAuthToken();
      
      let endpoint = '';
      if (targetType === 'instructor') {
        endpoint = `/api/reviews/instructor/${targetId}`;
      } else {
        endpoint = `/api/reviews/user/${targetId}`;
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch reviews' }));
        throw new Error(error.error || 'Failed to fetch reviews');
      }
      
      const reviews = await response.json();
      return reviews || [];
      
    } catch (error: any) {
      console.error('❌ Get reviews by target error:', error);
      return [];
    }
  },

  /**
   * Get ALL reviews by user for a specific target (allows multiple reviews)
   * NOW USES FLASK API! ✅
   */
  getUserReviewsForTarget: async (
    userId: string, 
    targetType: 'instructor' | 'instrument', 
    targetId: string
  ) => {
    try {
      const token = await getAuthToken();
      
      const queryParams = new URLSearchParams();
      queryParams.append('target_type', targetType);
      
      const response = await fetch(`${API_URL}/api/reviews/by-user/${userId}/target/${targetId}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch reviews' }));
        console.log('ℹ️  No reviews found');
        return [];
      }

      const reviews = await response.json();
      return reviews || [];
      
    } catch (error: any) {
      console.error('❌ Get user reviews for target error:', error);
      return [];
    }
  },

  /**
   * Create a new review
   */
  create: async (reviewData: {
    reviewer_id: string;
    target_type: 'instructor' | 'instrument';
    target_id: string;
    rating: number;
    comment: string;
  }) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // FIXED: Use correct schema field names
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target_id: reviewData.target_id,      // FIXED: was reviewed_id
          target_type: reviewData.target_type,  // FIXED: was review_type
          rating: reviewData.rating,
          comment: reviewData.comment
        })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create review' }));
        throw new Error(error.error || 'Failed to create review');
      }
      
      const review = await response.json();
      console.log('✅ Review created successfully');
      return review;
      
    } catch (error: any) {
      console.error('❌ Create review error:', error);
      throw error;
    }
  },

  /**
   * Update an existing review
   */
  update: async (reviewId: string, updates: {
    rating?: number;
    comment?: string;
  }) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update review' }));
        throw new Error(error.error || 'Failed to update review');
      }
      
      const review = await response.json();
      console.log('✅ Review updated successfully');
      return review;
      
    } catch (error: any) {
      console.error('❌ Update review error:', error);
      throw error;
    }
  },

  /**
   * Delete a review
   */
  delete: async (reviewId: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete review' }));
        throw new Error(error.error || 'Failed to delete review');
      }
      
      console.log('✅ Review deleted successfully');
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Delete review error:', error);
      throw error;
    }
  },

  /**
   * Update average rating for instructor or instrument
   * NOTE: This is handled automatically by the backend
   * Keeping this function for compatibility but it does nothing
   */
  updateTargetRating: async (targetType: 'instructor' | 'instrument', targetId: string) => {
    // Backend handles this automatically when reviews are created/updated/deleted
    console.log('ℹ️ Rating update is handled automatically by Flask backend');
    return;
  },

  /**
   * Get all reviews by a specific user
   */
  getByUser: async (userId: string) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_URL}/api/reviews/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch user reviews' }));
        throw new Error(error.error || 'Failed to fetch user reviews');
      }
      
      const reviews = await response.json();
      return reviews || [];
      
    } catch (error: any) {
      console.error('❌ Get user reviews error:', error);
      return [];
    }
  },

  /**
   * Get average rating for a target
   * NOW USES FLASK API! ✅
   */
  getAverageRating: async (targetType: 'instructor' | 'instrument', targetId: string) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_URL}/api/reviews/average/${targetType}/${targetId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })}
      });

      if (!response.ok) {
        console.log('ℹ️  No rating data found');
        return { average: 0, count: 0 };
      }

      const data = await response.json();
      return data;
      
    } catch (error: any) {
      console.error('❌ Get average rating error:', error);
      return { average: 0, count: 0 };
    }
  },
};