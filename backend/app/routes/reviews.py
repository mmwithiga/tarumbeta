"""
Review System Routes
FIXED: Uses correct schema column names (target_id, target_type)
"""
from flask import Blueprint, request, jsonify
from app.utils.supabase_client import supabase
from app.utils.auth_helpers import require_auth, get_current_user_id

bp = Blueprint('reviews', __name__)

@bp.route('', methods=['POST'])
@require_auth
def create_review():
    """
    Create a new review
    Body: { target_id, target_type, rating, comment }
    target_type: 'instructor' or 'instrument'
    """
    try:
        user_id = get_current_user_id()
        data = request.json
        
        # Accept both old and new field names for compatibility
        target_id = data.get('target_id') or data.get('reviewed_id')
        target_type = data.get('target_type') or data.get('review_type')
        rating = data.get('rating')
        
        if not target_id:
            return jsonify({'error': 'target_id is required'}), 400
        if not target_type:
            return jsonify({'error': 'target_type is required'}), 400
        if not rating:
            return jsonify({'error': 'rating is required'}), 400
        
        # Validate rating
        if not 1 <= rating <= 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Create review using correct schema column names
        review_data = {
            'reviewer_id': user_id,
            'target_id': target_id,
            'target_type': target_type,
            'rating': rating,
            'comment': data.get('comment', '')
        }
        
        response = supabase.table('reviews').insert(review_data).execute()
        
        # Update average rating for instructors
        if target_type == 'instructor':
            update_instructor_rating(target_id)
        
        return jsonify(response.data[0]), 201
        
    except Exception as e:
        print(f"Create review error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/user/<user_id>', methods=['GET'])
def get_user_reviews(user_id):
    """
    Get all reviews for a user
    """
    try:
        response = supabase.table('reviews').select(
            '*, users!reviews_reviewer_id_fkey(full_name, avatar_url)'
        ).eq('target_id', user_id).order('created_at', desc=True).execute()
        
        return jsonify(response.data), 200
        
    except Exception as e:
        print(f"Get user reviews error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/instructor/<instructor_id>', methods=['GET'])
def get_instructor_reviews(instructor_id):
    """
    Get all reviews for an instructor
    """
    try:
        # Get instructor's user_id
        instructor = supabase.table('instructor_profiles').select('user_id').eq('id', instructor_id).single().execute()
        
        if not instructor.data:
            return jsonify({'error': 'Instructor not found'}), 404
        
        user_id = instructor.data['user_id']
        
        response = supabase.table('reviews').select(
            '*, users!reviews_reviewer_id_fkey(full_name, avatar_url)'
        ).eq('target_id', user_id).eq('target_type', 'instructor').order('created_at', desc=True).execute()
        
        return jsonify(response.data), 200
        
    except Exception as e:
        print(f"Get instructor reviews error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<review_id>', methods=['PUT'])
@require_auth
def update_review(review_id):
    """
    Update a review (only by reviewer)
    """
    try:
        user_id = get_current_user_id()
        
        # Check ownership
        review = supabase.table('reviews').select('reviewer_id, target_id, target_type').eq('id', review_id).single().execute()
        
        if not review.data or review.data['reviewer_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update
        data = request.json
        
        # Validate rating if provided
        if 'rating' in data and not 1 <= data['rating'] <= 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        response = supabase.table('reviews').update(data).eq('id', review_id).execute()
        
        # Update average rating if rating changed
        if 'rating' in data and review.data['target_type'] == 'instructor':
            update_instructor_rating(review.data['target_id'])
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Update review error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<review_id>', methods=['DELETE'])
@require_auth
def delete_review(review_id):
    """
    Delete a review (only by reviewer)
    """
    try:
        user_id = get_current_user_id()
        
        # Check ownership
        review = supabase.table('reviews').select('reviewer_id, target_id, target_type').eq('id', review_id).single().execute()
        
        if not review.data or review.data['reviewer_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete
        supabase.table('reviews').delete().eq('id', review_id).execute()
        
        # Update average rating
        if review.data['target_type'] == 'instructor':
            update_instructor_rating(review.data['target_id'])
        
        return jsonify({'message': 'Review deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete review error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def update_instructor_rating(user_id):
    """
    Recalculate and update instructor's average rating
    """
    try:
        # Get all instructor reviews for this user
        reviews = supabase.table('reviews').select('rating').eq('target_id', user_id).eq('target_type', 'instructor').execute()
        
        if reviews.data:
            ratings = [r['rating'] for r in reviews.data]
            avg_rating = sum(ratings) / len(ratings)
            
            # Update instructor_profiles record
            supabase.table('instructor_profiles').update({
                'rating': round(avg_rating, 2),
                'total_reviews': len(ratings)
            }).eq('user_id', user_id).execute()
    except Exception as e:
        print(f"Update instructor rating error: {str(e)}")

@bp.route('/by-user/<user_id>/target/<target_id>', methods=['GET'])
def get_user_reviews_for_target(user_id, target_id):
    """
    Get all reviews by a specific user for a specific target
    Query param: target_type (instructor or instrument)
    """
    try:
        target_type = request.args.get('target_type', 'instructor')
        
        response = supabase.table('reviews').select(
            '*, users!reviews_reviewer_id_fkey(full_name, avatar_url)'
        ).eq('reviewer_id', user_id).eq('target_id', target_id).eq('target_type', target_type).order('created_at', desc=True).execute()
        
        return jsonify(response.data or []), 200
        
    except Exception as e:
        print(f"Get user reviews for target error: {str(e)}")
        return jsonify([]), 200

@bp.route('/average/<target_type>/<target_id>', methods=['GET'])
def get_average_rating(target_type, target_id):
    """
    Get average rating for a target (instructor or instrument)
    """
    try:
        response = supabase.table('reviews').select('rating').eq('target_id', target_id).eq('target_type', target_type).execute()
        
        if not response.data or len(response.data) == 0:
            return jsonify({'average': 0, 'count': 0}), 200
        
        ratings = [r['rating'] for r in response.data]
        avg_rating = sum(ratings) / len(ratings)
        
        return jsonify({
            'average': round(avg_rating, 2),
            'count': len(ratings)
        }), 200
        
    except Exception as e:
        print(f"Get average rating error: {str(e)}")
        return jsonify({'average': 0, 'count': 0}), 200