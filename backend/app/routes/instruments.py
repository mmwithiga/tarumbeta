"""
Instrument Listing Routes
"""
from flask import Blueprint, request, jsonify
from app.utils.supabase_client import supabase
from app.utils.auth_helpers import require_auth, get_current_user_id

bp = Blueprint('instruments', __name__)

@bp.route('', methods=['GET'])
def get_instruments():
    """
    Get all available instruments
    Query params: instrument_type, location, max_price, page, page_size
    """
    try:
        # Get query parameters
        instrument_type = request.args.get('instrument_type')
        location = request.args.get('location')
        max_price = request.args.get('max_price', type=float)
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        
        # Build query
        query = supabase.table('instrument_listings').select(
            '*, users!instrument_listings_owner_id_fkey(full_name, email, avatar_url)'
        ).eq('is_available', True).order('created_at', desc=True)
        
        # Apply filters
        if instrument_type:
            query = query.eq('instrument_type', instrument_type)
        
        if location:
            query = query.ilike('location', f'%{location}%')
        
        if max_price:
            query = query.lte('price_per_day', max_price)
        
        # Pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        # Execute query
        response = query.execute()
        
        return jsonify({
            'instruments': response.data,
            'page': page,
            'page_size': page_size,
            'total': len(response.data)
        }), 200
        
    except Exception as e:
        print(f"Get instruments error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<instrument_id>', methods=['GET'])
def get_instrument(instrument_id):
    """
    Get single instrument by ID
    """
    try:
        response = supabase.table('instrument_listings').select(
            '*, users!instrument_listings_owner_id_fkey(id, full_name, email, location, phone, avatar_url)'
        ).eq('id', instrument_id).single().execute()
        
        if not response.data:
            return jsonify({'error': 'Instrument not found'}), 404
        
        return jsonify(response.data), 200
        
    except Exception as e:
        print(f"Get instrument error: {str(e)}")
        return jsonify({'error': 'Instrument not found'}), 404

@bp.route('', methods=['POST'])
@require_auth
def create_instrument():
    """
    Create new instrument listing
    Requires auth. Body: { name, instrument_type, description, condition, 
                           price_per_day, price_per_week, price_per_month, 
                           location, image_url }
    """
    try:
        user_id = get_current_user_id()
        data = request.json
        
        # Required fields
        required = ['name', 'instrument_type', 'condition', 'price_per_day', 'location']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create listing
        listing_data = {
            'owner_id': user_id,
            'name': data['name'],
            'instrument_type': data['instrument_type'],
            'category': data.get('category'),
            'description': data.get('description'),
            'condition': data['condition'],
            'price_per_day': data['price_per_day'],
            'price_per_week': data.get('price_per_week'),
            'price_per_month': data.get('price_per_month'),
            'location': data['location'],
            'image_url': data.get('image_url'),
            'is_available': True
        }
        
        response = supabase.table('instrument_listings').insert(listing_data).execute()
        
        return jsonify(response.data[0]), 201
        
    except Exception as e:
        print(f"Create instrument error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<instrument_id>', methods=['PUT'])
@require_auth
def update_instrument(instrument_id):
    """
    Update instrument listing
    Requires auth and ownership
    """
    try:
        user_id = get_current_user_id()
        
        # Check ownership
        instrument = supabase.table('instrument_listings').select('owner_id').eq('id', instrument_id).single().execute()
        
        if not instrument.data or instrument.data['owner_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update
        data = request.json
        response = supabase.table('instrument_listings').update(data).eq('id', instrument_id).execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Update instrument error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<instrument_id>', methods=['DELETE'])
@require_auth
def delete_instrument(instrument_id):
    """
    Delete instrument listing
    Requires auth and ownership
    """
    try:
        user_id = get_current_user_id()
        
        # Check ownership
        instrument = supabase.table('instrument_listings').select('owner_id').eq('id', instrument_id).single().execute()
        
        if not instrument.data or instrument.data['owner_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete
        supabase.table('instrument_listings').delete().eq('id', instrument_id).execute()
        
        return jsonify({'message': 'Instrument deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete instrument error: {str(e)}")
        return jsonify({'error': str(e)}), 500