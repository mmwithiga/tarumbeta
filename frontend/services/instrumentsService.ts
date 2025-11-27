import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export interface Instrument {
  id: string;
  name: string;
  instrument_type: string;
  category?: string;
  description?: string;
  condition: string;
  price_per_day: number;
  price_per_week?: number;
  price_per_month?: number;
  location?: string;
  is_available: boolean;
  image_url?: string;
  owner_id: string;
  created_at: string;
  users?: {
    id?: string;
    full_name: string;
    email: string;
    location?: string;
    phone?: string;
    avatar_url?: string;
  };
}

export const instrumentsService = {
  /**
   * Get all instruments with optional filters and pagination
   */
  getAll: async (params?: {
    instrument_type?: string;
    location?: string;
    max_price?: number;
    page?: number;
    page_size?: number;
  }) => {
    try {
      console.log('📡 Fetching instruments from Flask API...');
      
      const token = await getAuthToken();
      
      const queryParams = new URLSearchParams();
      if (params?.instrument_type) queryParams.append('instrument_type', params.instrument_type);
      if (params?.location) queryParams.append('location', params.location);
      if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      
      const response = await fetch(`${API_URL}/api/instruments?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch instruments' }));
        throw new Error(error.error || 'Failed to fetch instruments');
      }
      
      const data = await response.json();
      console.log(`✅ Fetched ${data.instruments?.length || 0} available instruments`);
      
      return { instruments: data.instruments || [] };
      
    } catch (error: any) {
      console.error('❌ Instruments service error:', error);
      return { instruments: [] };
    }
  },

  /**
   * Get single instrument by ID
   */
  getById: async (id: string) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_URL}/api/instruments/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Instrument not found' }));
        throw new Error(error.error || 'Instrument not found');
      }
      
      const data = await response.json();
      return data;
      
    } catch (error: any) {
      console.error('❌ Get instrument error:', error);
      throw error;
    }
  },

  /**
   * Create new instrument listing
   */
  create: async (data: Partial<Instrument>) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please sign in.');
      }
      
      const response = await fetch(`${API_URL}/api/instruments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create instrument' }));
        throw new Error(error.error || 'Failed to create instrument');
      }
      
      const instrument = await response.json();
      console.log('✅ Instrument created successfully');
      return instrument;
      
    } catch (error: any) {
      console.error('❌ Create instrument error:', error);
      throw error;
    }
  },

  /**
   * Update existing instrument listing
   */
  update: async (id: string, data: Partial<Instrument>) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please sign in.');
      }
      
      const response = await fetch(`${API_URL}/api/instruments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update instrument' }));
        throw new Error(error.error || 'Failed to update instrument');
      }
      
      const instrument = await response.json();
      console.log('✅ Instrument updated successfully');
      return instrument;
      
    } catch (error: any) {
      console.error('❌ Update instrument error:', error);
      throw error;
    }
  },

  /**
   * Delete instrument listing
   */
  delete: async (id: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please sign in.');
      }
      
      const response = await fetch(`${API_URL}/api/instruments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete instrument' }));
        throw new Error(error.error || 'Failed to delete instrument');
      }
      
      console.log('✅ Instrument deleted successfully');
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Delete instrument error:', error);
      throw error;
    }
  },
};
