"""
Rental Management Routes
Complete rental lifecycle with 7 statuses
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from app.utils.supabase_client import supabase
from app.utils.auth_helpers import require_auth, get_current_user_id

bp = Blueprint('rentals', __name__)

@bp.route('', methods=['POST'])
@require_auth
def create_rental():
    """
    Create new rental request (status: pending)
    Body: { instrument_id, start_date, end_date, rental_period, total_price, with_instructor }
    """
    try:
        user_id = get_current_user_id()
        data = request.json
        
        # Validate required fields
        required = ['instrument_id', 'start_date', 'end_date', 'rental_period', 'total_price']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate rental_period
        valid_periods = ['daily', 'weekly', 'monthly']
        if data['rental_period'] not in valid_periods:
            return jsonify({'error': f'rental_period must be one of: {", ".join(valid_periods)}'}), 400
        
        # Create rental
        rental_data = {
            'instrument_id': data['instrument_id'],
            'renter_id': user_id,
            'rental_period': data['rental_period'],  # ADDED: Required field
            'start_date': data['start_date'],
            'end_date': data['end_date'],
            'total_price': data['total_price'],
            'with_instructor': data.get('with_instructor', False),
            'status': 'pending'
        }
        
        response = supabase.table('rentals').insert(rental_data).execute()
        
        return jsonify(response.data[0]), 201
        
    except Exception as e:
        print(f"Create rental error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/my-rentals', methods=['GET'])
@require_auth
def get_my_rentals():
    """
    Get current user's rentals (as renter)
    """
    try:
        user_id = get_current_user_id()
        
        response = supabase.table('rentals').select(
            '*, instrument_listings(*), users!rentals_renter_id_fkey(full_name, email)'
        ).eq('renter_id', user_id).order('created_at', desc=True).execute()
        
        return jsonify(response.data), 200
        
    except Exception as e:
        print(f"Get my rentals error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/my-listings', methods=['GET'])
@require_auth
def get_owner_rentals():
    """
    Get rentals for current user's instruments (as owner)
    """
    try:
        user_id = get_current_user_id()
        
        # Get user's instruments
        instruments = supabase.table('instrument_listings').select('id').eq('owner_id', user_id).execute()
        instrument_ids = [i['id'] for i in instruments.data]
        
        if not instrument_ids:
            return jsonify([]), 200
        
        # Get rentals for these instruments
        response = supabase.table('rentals').select(
            '*, instrument_listings(*), users!rentals_renter_id_fkey(full_name, email, avatar_url)'
        ).in_('instrument_id', instrument_ids).order('created_at', desc=True).execute()
        
        return jsonify(response.data), 200
        
    except Exception as e:
        print(f"Get owner rentals error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<rental_id>/approve', methods=['PUT'])
@require_auth
def approve_rental(rental_id):
    """
    Owner approves rental (pending → confirmed)
    """
    try:
        user_id = get_current_user_id()
        
        # Get rental with instrument info
        rental = supabase.table('rentals').select(
            '*, instrument_listings(owner_id)'
        ).eq('id', rental_id).single().execute()
        
        if not rental.data:
            return jsonify({'error': 'Rental not found'}), 404
        
        # Check ownership
        if rental.data['instrument_listings']['owner_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check status
        if rental.data['status'] != 'pending':
            return jsonify({'error': f'Cannot approve rental with status: {rental.data["status"]}'}), 400
        
        # Update status
        response = supabase.table('rentals').update({
            'status': 'confirmed'
        }).eq('id', rental_id).execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Approve rental error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<rental_id>/reject', methods=['PUT'])
@require_auth
def reject_rental(rental_id):
    """
    Owner rejects rental (pending → rejected)
    Body: { reason }
    """
    try:
        user_id = get_current_user_id()
        data = request.json
        
        # Get rental with instrument info
        rental = supabase.table('rentals').select(
            '*, instrument_listings(owner_id)'
        ).eq('id', rental_id).single().execute()
        
        if not rental.data:
            return jsonify({'error': 'Rental not found'}), 404
        
        # Check ownership
        if rental.data['instrument_listings']['owner_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check status
        if rental.data['status'] != 'pending':
            return jsonify({'error': f'Cannot reject rental with status: {rental.data["status"]}'}), 400
        
        # Update status
        response = supabase.table('rentals').update({
            'status': 'rejected',
            'rejection_reason': data.get('reason', 'No reason provided')
        }).eq('id', rental_id).execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Reject rental error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<rental_id>/pickup', methods=['PUT'])
@require_auth
def mark_picked_up(rental_id):
    """
    Owner marks instrument as picked up (confirmed → active)
    """
    try:
        user_id = get_current_user_id()
        
        # Get rental with instrument info
        rental = supabase.table('rentals').select(
            '*, instrument_listings(owner_id)'
        ).eq('id', rental_id).single().execute()
        
        if not rental.data:
            return jsonify({'error': 'Rental not found'}), 404
        
        # Check ownership
        if rental.data['instrument_listings']['owner_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check status
        if rental.data['status'] != 'confirmed':
            return jsonify({'error': f'Cannot mark pickup for rental with status: {rental.data["status"]}'}), 400
        
        # Update status
        response = supabase.table('rentals').update({
            'status': 'active',
            'actual_start_date': datetime.utcnow().isoformat()
        }).eq('id', rental_id).execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Mark pickup error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<rental_id>/mark-returned', methods=['PUT'])
@require_auth
def mark_returned(rental_id):
    """
    Renter marks instrument as returned (active → pending_return)
    """
    try:
        user_id = get_current_user_id()
        
        # Get rental
        rental = supabase.table('rentals').select('*').eq('id', rental_id).single().execute()
        
        if not rental.data:
            return jsonify({'error': 'Rental not found'}), 404
        
        # Check renter
        if rental.data['renter_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check status
        if rental.data['status'] != 'active':
            return jsonify({'error': f'Cannot mark return for rental with status: {rental.data["status"]}'}), 400
        
        # Update status
        response = supabase.table('rentals').update({
            'status': 'pending_return',
            'renter_marked_returned_at': datetime.utcnow().isoformat()
        }).eq('id', rental_id).execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Mark returned error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<rental_id>/confirm-return', methods=['PUT'])
@require_auth
def confirm_return(rental_id):
    """
    Owner confirms instrument return (pending_return → completed)
    """
    try:
        user_id = get_current_user_id()
        
        # Get rental with instrument info
        rental = supabase.table('rentals').select(
            '*, instrument_listings(owner_id)'
        ).eq('id', rental_id).single().execute()
        
        if not rental.data:
            return jsonify({'error': 'Rental not found'}), 404
        
        # Check ownership
        if rental.data['instrument_listings']['owner_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check status
        if rental.data['status'] != 'pending_return':
            return jsonify({'error': f'Cannot confirm return for rental with status: {rental.data["status"]}'}), 400
        
        # Update status
        response = supabase.table('rentals').update({
            'status': 'completed',
            'actual_end_date': datetime.utcnow().isoformat(),
            'completed_at': datetime.utcnow().isoformat()
        }).eq('id', rental_id).execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Confirm return error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<rental_id>/cancel', methods=['PUT'])
@require_auth
def cancel_rental(rental_id):
    """
    Renter cancels rental (pending or confirmed → cancelled)
    """
    try:
        user_id = get_current_user_id()
        
        # Get rental
        rental = supabase.table('rentals').select('*').eq('id', rental_id).single().execute()
        
        if not rental.data:
            return jsonify({'error': 'Rental not found'}), 404
        
        # Check renter
        if rental.data['renter_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check status (can only cancel pending or confirmed)
        if rental.data['status'] not in ['pending', 'confirmed']:
            return jsonify({'error': f'Cannot cancel rental with status: {rental.data["status"]}'}), 400
        
        # Update status
        response = supabase.table('rentals').update({
            'status': 'cancelled',
            'cancelled_at': datetime.utcnow().isoformat()
        }).eq('id', rental_id).execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Cancel rental error: {str(e)}")
        return jsonify({'error': str(e)}), 500