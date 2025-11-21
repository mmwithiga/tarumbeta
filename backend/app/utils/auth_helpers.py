"""
Authentication Helper Functions
"""
from functools import wraps
from flask import request, jsonify
from app.utils.supabase_client import supabase

def require_auth(f):
    """
    Decorator to require authentication for routes
    Validates JWT token from Authorization header
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        # Extract token
        try:
            token = auth_header.split(' ')[1]  # Format: "Bearer <token>"
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        # Validate token with Supabase
        try:
            response = supabase.auth.get_user(token)
            user = response.user
            
            if not user:
                return jsonify({'error': 'Invalid token'}), 401
            
            # Add user to request context
            request.user = user
            request.user_id = user.id
            
        except Exception as e:
            print(f"Auth error: {str(e)}")
            return jsonify({'error': 'Authentication failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """
    Get the current authenticated user from request context
    Only works within a route decorated with @require_auth
    """
    if hasattr(request, 'user'):
        return request.user
    return None

def get_current_user_id():
    """
    Get the current authenticated user ID from request context
    Only works within a route decorated with @require_auth
    """
    if hasattr(request, 'user_id'):
        return request.user_id
    return None
