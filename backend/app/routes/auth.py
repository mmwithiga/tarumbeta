"""
Authentication Routes
"""
from flask import Blueprint, request, jsonify
from app.utils.supabase_client import supabase
from app.utils.auth_helpers import require_auth, get_current_user_id

bp = Blueprint('auth', __name__)

@bp.route('/signup', methods=['POST'])
def signup():
    """
    Create new user account
    Body: { email, password, fullName, role }
    """
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('fullName')
        role = data.get('role', 'learner')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Create user with Supabase Auth
        response = supabase.auth.sign_up({
            'email': email,
            'password': password,
            'options': {
                'data': {
                    'full_name': full_name,
                    'role': role
                }
            }
        })
        
        if response.user:
            # Update users table with additional info
            supabase.table('users').upsert({
                'id': response.user.id,
                'email': email,
                'full_name': full_name,
                'role': role
            }).execute()
            
            return jsonify({
                'user': {
                    'id': response.user.id,
                    'email': response.user.email,
                    'full_name': full_name,
                    'role': role
                },
                'session': {
                    'access_token': response.session.access_token if response.session else None
                }
            }), 201
        else:
            return jsonify({'error': 'Signup failed'}), 400
            
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/signin', methods=['POST'])
def signin():
    """
    Sign in existing user
    Body: { email, password }
    """
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Sign in with Supabase Auth
        response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })
        
        if response.user and response.session:
            # Get user profile from users table
            user_data = supabase.table('users').select('*').eq('id', response.user.id).single().execute()
            
            return jsonify({
                'user': user_data.data,
                'session': {
                    'access_token': response.session.access_token
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        print(f"Signin error: {str(e)}")
        return jsonify({'error': 'Invalid credentials'}), 401

@bp.route('/signout', methods=['POST'])
@require_auth
def signout():
    """
    Sign out current user
    Requires: Authorization header with Bearer token
    """
    try:
        supabase.auth.sign_out()
        return jsonify({'message': 'Signed out successfully'}), 200
    except Exception as e:
        print(f"Signout error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/me', methods=['GET'])
@require_auth
def get_current_user_route():
    """
    Get current authenticated user
    Requires: Authorization header with Bearer token
    """
    try:
        user_id = get_current_user_id()
        
        # Get user profile
        user_data = supabase.table('users').select('*').eq('id', user_id).single().execute()
        
        return jsonify(user_data.data), 200
        
    except Exception as e:
        print(f"Get user error: {str(e)}")
        return jsonify({'error': str(e)}), 500
