import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to get auth token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export interface Rental {
  id: string;
  instrument_id: string;
  renter_id: string;
  rental_period: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'active' | 'pending_return' | 'completed' | 'rejected' | 'cancelled';
  created_at: string;
  instrument_listings?: any;
}

// Helper function to calculate price
const calculateTotalPrice = (
  instrument: any,
  rentalPeriod: string,
  startDate: string,
  endDate: string
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  switch (rentalPeriod) {
    case 'daily':
      return instrument.price_per_day * days;
    case 'weekly':
      const weeks = Math.ceil(days / 7);
      return (instrument.price_per_week || instrument.price_per_day * 7) * weeks;
    case 'monthly':
      const months = Math.ceil(days / 30);
      return (instrument.price_per_month || instrument.price_per_day * 30) * months;
    default:
      return instrument.price_per_day * days;
  }
};

export const rentalsService = {
  // ═══════════════════════════════════════════════════════════════
  // CREATE RENTAL (New version with auto price calculation)
  // ═══════════════════════════════════════════════════════════════
  
  create: async (data: {
    instrument_id: string;
    rental_period: string;
    start_date: string;
    end_date: string;
  }) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Get instrument details from Supabase directly (to calculate price)
      const { data: instrument, error: instrumentError } = await supabase
        .from('instrument_listings')
        .select('*')
        .eq('id', data.instrument_id)
        .single();

      if (instrumentError) throw instrumentError;
      if (!instrument) throw new Error('Instrument not found');
      if (!instrument.is_available) throw new Error('Instrument not available');

      // Calculate total price
      const totalPrice = calculateTotalPrice(
        instrument,
        data.rental_period,
        data.start_date,
        data.end_date
      );
      
      // FIXED: Include rental_period field (required by backend)
      const response = await fetch(`${API_URL}/api/rentals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          instrument_id: data.instrument_id,
          rental_period: data.rental_period,  // ADDED: Required field
          start_date: data.start_date,
          end_date: data.end_date,
          total_price: totalPrice
        })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create rental' }));
        throw new Error(error.error || 'Failed to create rental');
      }
      
      const rental = await response.json();
      console.log('✅ Rental created successfully');
      return rental;
      
    } catch (error: any) {
      console.error('❌ Create rental error:', error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // GET RENTAL BY ID
  // ═══════════════════════════════════════════════════════════════
  
  getById: async (id: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/rentals/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Rental not found' }));
        throw new Error(error.error || 'Rental not found');
      }
      
      const rental = await response.json();
      return rental;
      
    } catch (error: any) {
      console.error('❌ Get rental error:', error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // GET USER RENTALS (as renter)
  // ═══════════════════════════════════════════════════════════════
  
  getUserRentals: async (userId: string, status?: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const queryParams = new URLSearchParams();
      if (status) {
        queryParams.append('status', status);
      }
      
      const response = await fetch(`${API_URL}/api/rentals/my-rentals?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch rentals' }));
        throw new Error(error.error || 'Failed to fetch rentals');
      }
      
      const rentals = await response.json();
      return rentals || [];
      
    } catch (error: any) {
      console.error('❌ Get user rentals error:', error);
      return [];
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // UPDATE RENTAL STATUS (generic)
  // ═══════════════════════════════════════════════════════════════
  
  updateStatus: async (id: string, status: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Note: This is a generic update - specific state transitions have their own endpoints
      const response = await fetch(`${API_URL}/api/rentals/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update rental status' }));
        throw new Error(error.error || 'Failed to update rental status');
      }
      
      const rental = await response.json();
      console.log('✅ Rental status updated successfully');
      return rental;
      
    } catch (error: any) {
      console.error('❌ Update rental status error:', error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // STATE TRANSITION FUNCTIONS (Option 3 - Full Lifecycle)
  // ═══════════════════════════════════════════════════════════════

  // OWNER: Approve rental request (pending → confirmed)
  approveRental: async (rentalId: string) => {
    try {
      console.log('🎯 Approving rental:', rentalId);
      
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/rentals/${rentalId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to approve rental' }));
        throw new Error(error.error || 'Failed to approve rental');
      }
      
      const rental = await response.json();
      console.log('✅ Rental approved');
      return rental;
      
    } catch (error: any) {
      console.error('❌ Error approving rental:', error);
      throw error;
    }
  },

  // OWNER: Reject rental request (pending → rejected)
  rejectRental: async (rentalId: string) => {
    try {
      console.log('❌ Rejecting rental:', rentalId);
      
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/rentals/${rentalId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'No reason provided' })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to reject rental' }));
        throw new Error(error.error || 'Failed to reject rental');
      }
      
      const rental = await response.json();
      console.log('✅ Rental rejected');
      return rental;
      
    } catch (error: any) {
      console.error('❌ Error rejecting rental:', error);
      throw error;
    }
  },

  // OWNER: Mark as picked up (confirmed → active)
  markPickedUp: async (rentalId: string) => {
    try {
      console.log('📦 Marking rental as picked up:', rentalId);
      
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/rentals/${rentalId}/pickup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to mark pickup' }));
        throw new Error(error.error || 'Failed to mark pickup');
      }
      
      const rental = await response.json();
      console.log('✅ Rental marked as active (picked up)');
      return rental;
      
    } catch (error: any) {
      console.error('❌ Error marking rental as picked up:', error);
      throw error;
    }
  },

  // LEARNER: Mark as returned (active → pending_return)
  markReturned: async (rentalId: string) => {
    try {
      console.log('🔄 Learner marking rental as returned:', rentalId);
      
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/rentals/${rentalId}/mark-returned`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to mark return' }));
        throw new Error(error.error || 'Failed to mark return');
      }
      
      const rental = await response.json();
      console.log('✅ Rental marked as pending return');
      return rental;
      
    } catch (error: any) {
      console.error('❌ Error marking rental as returned:', error);
      throw error;
    }
  },

  // OWNER: Confirm return (pending_return → completed)
  confirmReturn: async (rentalId: string) => {
    try {
      console.log('✅ Owner confirming return:', rentalId);
      
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/rentals/${rentalId}/confirm-return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to confirm return' }));
        throw new Error(error.error || 'Failed to confirm return');
      }
      
      const rental = await response.json();
      console.log('✅ Return confirmed, rental completed');
      return rental;
      
    } catch (error: any) {
      console.error('❌ Error confirming return:', error);
      throw error;
    }
  },

  // LEARNER: Cancel rental (pending/confirmed → cancelled)
  cancelRental: async (rentalId: string) => {
    try {
      console.log('🚫 Learner cancelling rental:', rentalId);
      
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/rentals/${rentalId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to cancel rental' }));
        throw new Error(error.error || 'Failed to cancel rental');
      }
      
      const rental = await response.json();
      console.log('✅ Rental cancelled');
      return rental;
      
    } catch (error: any) {
      console.error('❌ Error cancelling rental:', error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // GET RENTALS FOR INSTRUMENT OWNER
  // ═══════════════════════════════════════════════════════════════
  
  getOwnerRentals: async (ownerId: string, status?: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const queryParams = new URLSearchParams();
      if (status) {
        queryParams.append('status', status);
      }
      
      const response = await fetch(`${API_URL}/api/rentals/my-listings?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch owner rentals' }));
        console.error('Error fetching owner rentals:', error);
        return [];
      }
      
      const rentals = await response.json();
      return rentals || [];
      
    } catch (error: any) {
      console.error('Error fetching owner rentals:', error);
      return [];
    }
  },
};