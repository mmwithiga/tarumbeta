"""
Lesson Scheduling Routes
FIXED: Uses correct schema (scheduled_time, duration_minutes, session_type, instructor_profiles)
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from app.utils.supabase_client import supabase
from app.utils.auth_helpers import require_auth, get_current_user_id

bp = Blueprint('lessons', __name__)

@bp.route('', methods=['POST'])
@require_auth
def schedule_lesson():
    """
    Schedule a new lesson
    Body: { instructor_id, scheduled_time, duration_minutes, session_type, rental_id,
            instrument, skill_level, price }
    """
    try:
        user_id = get_current_user_id()
        data = request.json
        
        # Validate required fields
        required = ['instructor_id', 'scheduled_time']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create lesson using correct schema field names
        lesson_data = {
            'instructor_id': data['instructor_id'],
            'learner_id': user_id,
            'scheduled_time': data['scheduled_time'],  # FIXED: was scheduled_at
            'duration_minutes': data.get('duration_minutes', 60),  # FIXED: was duration
            'session_type': data.get('session_type', 'online'),  # FIXED: was lesson_type
            'rental_id': data.get('rental_id'),
            'instrument': data.get('instrument'),
            'skill_level': data.get('skill_level'),
            'price': data.get('price'),
            'status': 'scheduled'
        }
        
        # MOCK: Handle synthetic IDs (which start with 'I') to prevent UUID errors
        if str(data['instructor_id']).startswith('I'):
            print(f"⚠️ Mocking lesson scheduling for synthetic instructor: {data['instructor_id']}")
            import uuid
            mock_response = lesson_data.copy()
            mock_response['id'] = str(uuid.uuid4())
            mock_response['created_at'] = datetime.now().isoformat()
            return jsonify(mock_response), 201
        
        response = supabase.table('lessons').insert(lesson_data).execute()
        
        return jsonify(response.data[0]), 201
        
    except Exception as e:
        print(f"Schedule lesson error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/my-lessons', methods=['GET'])
@require_auth
def get_my_lessons():
    """
    Get current user's lessons (as learner or instructor)
    """
    try:
        user_id = get_current_user_id()
        
        # Get lessons where user is learner - uses instructor_profiles table
        learner_lessons = supabase.table('lessons').select(
            '*, instructor_profiles(*, users!instructor_profiles_user_id_fkey(full_name, email, avatar_url))'
        ).eq('learner_id', user_id).order('scheduled_time', desc=True).execute()
        
        # Enrich learner lessons with synthetic names
        learner_data = []
        if learner_lessons.data:
            learner_data = [enrich_lesson_with_synthetic_name(l) for l in learner_lessons.data]
        
        # Get instructor profile for this user
        instructor_profile = supabase.table('instructor_profiles').select('id').eq('user_id', user_id).execute()
        
        instructor_lessons_data = []
        if instructor_profile.data and len(instructor_profile.data) > 0:
            instructor_id = instructor_profile.data[0]['id']
            # Get lessons where user is instructor
            instructor_lessons = supabase.table('lessons').select(
                '*, users!lessons_learner_id_fkey(full_name, email, avatar_url)'
            ).eq('instructor_id', instructor_id).order('scheduled_time', desc=True).execute()
            
            # Also enrich instructor lessons (though less critical as they see the learner)
            if instructor_lessons.data:
                instructor_lessons_data = [enrich_lesson_with_synthetic_name(l) for l in instructor_lessons.data]
        
        return jsonify({
            'as_learner': learner_data,
            'as_instructor': instructor_lessons_data
        }), 200
        
    except Exception as e:
        print(f"Get my lessons error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<lesson_id>', methods=['GET'])
@require_auth
def get_lesson(lesson_id):
    """
    Get single lesson by ID
    """
    try:
        user_id = get_current_user_id()
        
        response = supabase.table('lessons').select(
            '*, instructor_profiles(*, users!instructor_profiles_user_id_fkey(*)), users!lessons_learner_id_fkey(*)'
        ).eq('id', lesson_id).single().execute()
        
        if not response.data:
            return jsonify({'error': 'Lesson not found'}), 404
        
        # Check access (must be learner or instructor)
        if response.data['learner_id'] != user_id and response.data['instructor_profiles']['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Enrich with synthetic name
        lesson = enrich_lesson_with_synthetic_name(response.data)
        
        return jsonify(lesson), 200
        
    except Exception as e:
        print(f"Get lesson error: {str(e)}")
        return jsonify({'error': 'Lesson not found'}), 404

def enrich_lesson_with_synthetic_name(lesson):
    """
    Helper to extract synthetic instructor name from instrument field
    Format: "Instrument::SyntheticName"
    """
    if not lesson:
        return lesson
        
    instrument_field = lesson.get('instrument', '')
    if instrument_field and '::' in instrument_field:
        parts = instrument_field.split('::')
        real_instrument = parts[0]
        synthetic_name = parts[1]
        
        # Update instrument to be clean
        lesson['instrument'] = real_instrument
        
        # Override instructor name if present
        if 'instructor_profiles' in lesson and lesson['instructor_profiles']:
            # Handle list or dict
            if isinstance(lesson['instructor_profiles'], list):
                for ip in lesson['instructor_profiles']:
                    if 'users' in ip:
                        ip['users']['full_name'] = synthetic_name
            elif 'users' in lesson['instructor_profiles']:
                lesson['instructor_profiles']['users']['full_name'] = synthetic_name
                
    return lesson

@bp.route('/<lesson_id>/cancel', methods=['PUT'])
@require_auth
def cancel_lesson(lesson_id):
    """
    Cancel a lesson
    """
    try:
        user_id = get_current_user_id()
        
        # Get lesson
        lesson = supabase.table('lessons').select(
            '*, instructor_profiles(user_id)'
        ).eq('id', lesson_id).single().execute()
        
        if not lesson.data:
            return jsonify({'error': 'Lesson not found'}), 404
        
        # Check access (must be learner or instructor)
        is_learner = lesson.data['learner_id'] == user_id
        is_instructor = lesson.data['instructor_profiles']['user_id'] == user_id
        
        if not (is_learner or is_instructor):
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check status
        if lesson.data['status'] != 'scheduled':
            return jsonify({'error': f'Cannot cancel lesson with status: {lesson.data["status"]}'}), 400
        
        # Update status (only status field exists in schema)
        response = supabase.table('lessons').update({
            'status': 'cancelled'
        }).eq('id', lesson_id).execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Cancel lesson error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<lesson_id>/complete', methods=['PUT'])
@require_auth
def complete_lesson(lesson_id):
    """
    Mark lesson as completed (instructor only)
    """
    try:
        user_id = get_current_user_id()
        
        # Get lesson
        lesson = supabase.table('lessons').select(
            '*, instructor_profiles(user_id)'
        ).eq('id', lesson_id).single().execute()
        
        if not lesson.data:
            return jsonify({'error': 'Lesson not found'}), 404
        
        # Check instructor
        if lesson.data['instructor_profiles']['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized - only instructor can mark complete'}), 403
        
        # Check status
        if lesson.data['status'] != 'scheduled':
            return jsonify({'error': f'Cannot complete lesson with status: {lesson.data["status"]}'}), 400
        
        # Update status (only status field exists in schema)
        response = supabase.table('lessons').update({
            'status': 'completed'
        }).eq('id', lesson_id).execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Complete lesson error: {str(e)}")
        return jsonify({'error': str(e)}), 500