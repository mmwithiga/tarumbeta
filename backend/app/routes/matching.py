"""
ML Instructor Matching Routes
FIXED: Uses correct schema (instructor_profiles, experience_years, status='suggested')
"""
from flask import Blueprint, request, jsonify
from app.utils.supabase_client import supabase
from app.utils.auth_helpers import require_auth, get_current_user_id

bp = Blueprint('matching', __name__)

@bp.route('/find-instructors', methods=['POST'])
@require_auth
def find_instructors():
    """
    Find matching instructors using ML model
    Body: { instrument_type, experience_level, learning_goals, budget, 
            location, location_coords, preferred_schedule, learning_style, lesson_format }
    """
    try:
        user_id = get_current_user_id()
        learner_profile = request.json
        
        # Validate required fields
        required = ['instrument_type', 'experience_level', 'budget']
        for field in required:
            if field not in learner_profile:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Get all available instructors for the instrument - uses instructor_profiles table
        instructors_response = supabase.table('instructor_profiles').select(
            '*, users!instructor_profiles_user_id_fkey(full_name, email, location, avatar_url)'
        ).eq('instrument', learner_profile['instrument_type']).execute()
        
        instructors = instructors_response.data
        
        if not instructors:
            return jsonify({
                'matches': [],
                'message': f'No instructors found for {learner_profile["instrument_type"]}'
            }), 200
        
        # Import and use ML model
        try:
            from app.ml_models.instructor_matcher import InstructorMatcher
            matcher = InstructorMatcher()
            matches = matcher.predict_matches(learner_profile, instructors)
        except Exception as ml_error:
            print(f"ML model error: {str(ml_error)}")
            # Fallback: simple rule-based matching
            matches = simple_matching(learner_profile, instructors)
        
        # Save top matches to database
        for match in matches[:5]:  # Save top 5
            try:
                supabase.table('instructor_matches').insert({
                    'learner_id': user_id,
                    'instructor_id': match['instructor_id'],
                    'match_score': int(match['match_score'] * 100),  # Convert to 0-100 INT
                    'status': 'suggested'  # FIXED: was 'pending', schema uses 'suggested'
                }).execute()
            except:
                pass  # Ignore duplicates
        
        return jsonify({
            'matches': matches[:5],  # Return top 5
            'total_found': len(matches)
        }), 200
        
    except Exception as e:
        print(f"Find instructors error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def simple_matching(learner_profile, instructors):
    """
    Simple rule-based matching as fallback when ML model not available
    """
    matches = []
    
    for instructor in instructors:
        score = 0.0
        reasons = []
        
        # Budget compatibility (30%)
        if instructor['hourly_rate'] <= learner_profile['budget']:
            score += 0.30
            reasons.append(f"Within budget ({instructor['hourly_rate']}/hour)")
        elif instructor['hourly_rate'] <= learner_profile['budget'] * 1.2:
            score += 0.15
            reasons.append(f"Slightly above budget ({instructor['hourly_rate']}/hour)")
        
        # Experience (20%) - FIXED: uses experience_years
        if instructor['experience_years'] >= 5:
            score += 0.20
            reasons.append(f"{instructor['experience_years']} years of experience")
        elif instructor['experience_years'] >= 2:
            score += 0.10
        
        # Rating (20%)
        if instructor['rating'] >= 4.5:
            score += 0.20
            reasons.append(f"Highly rated ({instructor['rating']}⭐)")
        elif instructor['rating'] >= 3.5:
            score += 0.10
        
        # Skill level match (15%)
        if learner_profile.get('experience_level') == instructor.get('skill_level'):
            score += 0.15
            reasons.append(f"{instructor['skill_level'].title()} level matches")
        
        # Student base (10%)
        if instructor['total_students'] > 10:
            score += 0.10
            reasons.append(f"Experienced with {instructor['total_students']} students")
        
        # Location (5%)
        if learner_profile.get('location') and instructor['users'].get('location'):
            if learner_profile['location'].lower() in instructor['users']['location'].lower():
                score += 0.05
                reasons.append("Local instructor")
        
        # Determine recommendation strength
        if score >= 0.80:
            strength = "Excellent Match"
        elif score >= 0.70:
            strength = "Great Match"
        elif score >= 0.60:
            strength = "Good Match"
        else:
            strength = "Fair Match"
        
        matches.append({
            'instructor_id': instructor['id'],
            'instructor_name': instructor['users']['full_name'],
            'instructor_email': instructor['users']['email'],
            'instructor_avatar': instructor['users'].get('avatar_url'),
            'hourly_rate': instructor['hourly_rate'],
            'experience_years': instructor['experience_years'],  # FIXED: was years_experience
            'rating': instructor['rating'],
            'bio': instructor['bio'],
            'match_score': round(score, 2),
            'match_reasons': reasons,
            'recommendation_strength': strength
        })
    
    # Sort by score (descending)
    matches.sort(key=lambda x: x['match_score'], reverse=True)
    
    return matches

@bp.route('/history', methods=['GET'])
@require_auth
def get_match_history():
    """
    Get user's matching history
    """
    try:
        user_id = get_current_user_id()
        
        response = supabase.table('instructor_matches').select(
            '*, instructor_profiles(*, users!instructor_profiles_user_id_fkey(full_name, email, avatar_url))'
        ).eq('learner_id', user_id).order('created_at', desc=True).execute()
        
        return jsonify(response.data), 200
        
    except Exception as e:
        print(f"Get match history error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/accept/<match_id>', methods=['PUT'])
@require_auth
def accept_match(match_id):
    """
    Accept an instructor match
    """
    try:
        user_id = get_current_user_id()
        
        # Verify ownership
        match = supabase.table('instructor_matches').select('learner_id').eq('id', match_id).single().execute()
        
        if not match.data or match.data['learner_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update status
        response = supabase.table('instructor_matches').update({
            'status': 'accepted'
        }).eq('id', match_id).execute()
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Accept match error: {str(e)}")
        return jsonify({'error': str(e)}), 500