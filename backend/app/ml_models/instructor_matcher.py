"""
ML Instructor Matching Model

This is a template for integrating your trained ML model.
Replace the logic with your actual model loading and prediction code.
"""
import os
import pickle
import numpy as np
from typing import List, Dict, Any

class InstructorMatcher:
    """
    Machine Learning model for matching learners with instructors
    """
    
    def __init__(self):
        """
        Initialize the model
        Load the new SemanticRecommender
        """
        try:
            try:
                from app.tarumbeta_ml.src.api.inference_semantic import recommender
            except ImportError:
                from backend.app.tarumbeta_ml.src.api.inference_semantic import recommender
            
            self.model = recommender
            print(f"✅ Semantic ML Model loaded successfully")
        except Exception as e:
            print(f"⚠️  Warning: Error loading Semantic ML model: {str(e)}")
            print("    Using rule-based matching instead")
            self.model = None
    
    def predict_matches(self, learner_profile: Dict[str, Any], instructors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Predict best instructor matches for a learner
        """
        if self.model:
            return self._ml_prediction(learner_profile, instructors)
        else:
            return self._rule_based_matching(learner_profile, instructors)
    
    def _ml_prediction(self, learner_profile: Dict[str, Any], instructors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Use SemanticRecommender for prediction
        """
        # 1. Map learner profile to model input format
        model_input = {
            'location': learner_profile.get('location', ''),
            'instrument_type': learner_profile.get('instrument_type', ''),
            'skill_level': learner_profile.get('experience_level', 'Beginner').title(),
            'teaching_language': 'English', # Default
            'bio_keywords': " ".join(learner_profile.get('learning_goals', [])) + " " + learner_profile.get('learning_style', '')
        }
        
        # 2. Get recommendations from the model
        # We request more candidates (top_k=50) to maximize overlap with the provided instructors list
        try:
            recommendations = self.model.recommend(model_input, top_k=50)
        except Exception as e:
            print(f"Error during ML inference: {e}")
            return self._rule_based_matching(learner_profile, instructors)
            
        matches = []
        
        # 3. Match model results with database instructors
        # Create a map for fast lookup. Keying by name as a fallback since model doesn't return DB IDs.
        # Ideally, we should ensure the model index has DB IDs.
        instructor_map = {inst['users']['full_name']: inst for inst in instructors if inst.get('users', {}).get('full_name')}
        
        for rec in recommendations:
            name = rec['name']
            if name in instructor_map:
                inst = instructor_map[name]
                score = rec['match_score']
                
                # Generate reasons
                reasons = self._generate_match_reasons(learner_profile, inst, score)
                
                matches.append({
                    'instructor_id': inst['id'],
                    'instructor_name': inst['users']['full_name'],
                    'instructor_email': inst['users']['email'],
                    'instructor_avatar': inst['users'].get('avatar_url'),
                    'hourly_rate': inst['hourly_rate'],
                    'years_experience': inst['years_experience'],
                    'rating': inst['rating'],
                    'bio': inst['bio'],
                    'match_score': round(score, 2),
                    'match_reasons': reasons,
                    'recommendation_strength': self._get_recommendation_strength(score)
                })
        
        # If no matches found in the intersection, fallback to rule based
        if not matches:
            return self._rule_based_matching(learner_profile, instructors)
            
        # Sort by score (descending)
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return matches
    
    def _extract_features(self, learner_profile: Dict[str, Any], instructor: Dict[str, Any]) -> np.ndarray:
        """
        Extract features for ML model prediction
        
        CUSTOMIZE THIS based on your model's expected input features
        """
        features = []
        
        # Example features:
        # 1. Budget compatibility (normalized)
        budget_ratio = learner_profile['budget'] / instructor['hourly_rate'] if instructor['hourly_rate'] > 0 else 0
        features.append(min(budget_ratio, 2.0))  # Cap at 2x
        
        # 2. Experience level match (one-hot encoded)
        experience_levels = ['beginner', 'intermediate', 'advanced']
        features.extend([1 if learner_profile['experience_level'] == level else 0 for level in experience_levels])
        
        # 3. Instructor experience (years normalized)
        features.append(instructor['years_experience'] / 20.0)  # Normalize to 0-1
        
        # 4. Instructor rating (already 0-5, normalize to 0-1)
        features.append(instructor['rating'] / 5.0)
        
        # 5. Student count (normalized)
        features.append(min(instructor['total_students'] / 50.0, 1.0))
        
        # 6. Teaching style match (binary)
        features.append(1 if learner_profile.get('learning_style') == instructor.get('teaching_style') else 0)
        
        # 7. Location match (binary)
        location_match = 0
        if learner_profile.get('location') and instructor['users'].get('location'):
            if learner_profile['location'].lower() in instructor['users']['location'].lower():
                location_match = 1
        features.append(location_match)
        
        return np.array(features)
    
    def _calculate_compatibility_score(self, learner_profile: Dict[str, Any], instructor: Dict[str, Any]) -> float:
        """
        Calculate compatibility score using weighted criteria
        This is used as fallback or can be used with ML score
        """
        score = 0.0
        weights = {
            'instrument': 0.30,
            'experience': 0.20,
            'budget': 0.15,
            'location': 0.12,
            'schedule': 0.10,
            'goals': 0.08,
            'style': 0.05
        }
        
        # 1. Instrument match (30%)
        if instructor['instrument'] == learner_profile['instrument_type']:
            score += weights['instrument']
        
        # 2. Experience compatibility (20%)
        experience_match = self._check_experience_match(learner_profile['experience_level'], instructor)
        score += experience_match * weights['experience']
        
        # 3. Budget fit (15%)
        budget_fit = self._check_budget_fit(learner_profile['budget'], instructor['hourly_rate'])
        score += budget_fit * weights['budget']
        
        # 4. Location proximity (12%)
        location_fit = self._check_location_match(learner_profile.get('location'), instructor['users'].get('location'))
        score += location_fit * weights['location']
        
        # 5. Schedule alignment (10%)
        schedule_fit = self._check_schedule_match(learner_profile.get('preferred_schedule'), instructor)
        score += schedule_fit * weights['schedule']
        
        # 6. Learning goals alignment (8%)
        # This would compare learner goals with instructor specializations
        score += 0.08  # Placeholder
        
        # 7. Teaching style match (5%)
        if learner_profile.get('learning_style') == instructor.get('teaching_style'):
            score += weights['style']
        
        # Bonus: Quality metrics (up to +10%)
        if instructor['rating'] >= 4.5:
            score += 0.05
        if instructor['total_students'] > 20:
            score += 0.03
        if instructor['years_experience'] > 5:
            score += 0.02
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _check_experience_match(self, learner_level: str, instructor: Dict) -> float:
        """Check if instructor teaches the learner's level"""
        # Simplified: assume instructors can teach all levels
        # In real implementation, check instructor's specializations
        return 1.0
    
    def _check_budget_fit(self, learner_budget: float, instructor_rate: float) -> float:
        """Calculate budget compatibility"""
        if instructor_rate <= learner_budget:
            return 1.0
        elif instructor_rate <= learner_budget * 1.2:  # Within 20% over
            return 0.7
        elif instructor_rate <= learner_budget * 1.5:  # Within 50% over
            return 0.3
        else:
            return 0.1
    
    def _check_location_match(self, learner_location: str, instructor_location: str) -> float:
        """Check location compatibility"""
        if not learner_location or not instructor_location:
            return 0.5  # Neutral if location not specified
        
        if learner_location.lower() in instructor_location.lower():
            return 1.0
        
        return 0.3  # Different location but still possible
    
    def _check_schedule_match(self, learner_schedule: Dict, instructor: Dict) -> float:
        """Check schedule compatibility"""
        if not learner_schedule:
            return 0.5  # Neutral if not specified
        
        # Check day overlap
        learner_days = set(learner_schedule.get('days', []))
        instructor_days = set(instructor.get('available_days', []))
        
        if learner_days and instructor_days:
            overlap = len(learner_days & instructor_days)
            return overlap / len(learner_days) if learner_days else 0.5
        
        return 0.5
    
    def _generate_match_reasons(self, learner_profile: Dict, instructor: Dict, score: float) -> List[str]:
        """Generate human-readable reasons for the match"""
        reasons = []
        
        # Budget
        if instructor['hourly_rate'] <= learner_profile['budget']:
            reasons.append(f"Within budget (KES {instructor['hourly_rate']}/hour)")
        
        # Experience
        if instructor['years_experience'] >= 5:
            reasons.append(f"{instructor['years_experience']} years of teaching experience")
        
        # Rating
        if instructor['rating'] >= 4.5:
            reasons.append(f"Highly rated ({instructor['rating']}⭐)")
        
        # Teaching style
        if learner_profile.get('learning_style') == instructor.get('teaching_style'):
            reasons.append(f"{instructor['teaching_style'].title()} teaching style matches your preference")
        
        # Location
        if learner_profile.get('location') and instructor['users'].get('location'):
            if learner_profile['location'].lower() in instructor['users']['location'].lower():
                reasons.append("Local instructor in your area")
        
        # Student base
        if instructor['total_students'] > 10:
            reasons.append(f"Experienced with {instructor['total_students']} students")
        
        # Specialization (if available)
        if score >= 0.90:
            reasons.append("Perfect match for your learning goals")
        
        return reasons
    
    def _get_recommendation_strength(self, score: float) -> str:
        """Convert numeric score to recommendation strength"""
        if score >= 0.90:
            return "Excellent Match"
        elif score >= 0.80:
            return "Great Match"
        elif score >= 0.70:
            return "Good Match"
        elif score >= 0.60:
            return "Fair Match"
        else:
            return "Possible Match"
    
    def _rule_based_matching(self, learner_profile: Dict[str, Any], instructors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rule-based matching fallback when ML model is not available
        Uses the same logic as _ml_prediction but without ML model
        """
        return self._ml_prediction(learner_profile, instructors)


# Example usage for testing
if __name__ == "__main__":
    # Test the matcher
    matcher = InstructorMatcher()
    
    # Example learner profile
    learner = {
        'instrument_type': 'Guitar',
        'experience_level': 'beginner',
        'learning_goals': ['chords', 'fingerpicking'],
        'budget': 1200,
        'location': 'Nairobi',
        'preferred_schedule': {'days': ['weekdays', 'weekends'], 'times': ['afternoon']},
        'learning_style': 'flexible'
    }
    
    # Example instructors
    instructors = [
        {
            'id': '1',
            'instrument': 'Guitar',
            'hourly_rate': 1000,
            'years_experience': 8,
            'rating': 4.9,
            'teaching_style': 'flexible',
            'total_students': 47,
            'bio': 'Professional guitar instructor',
            'available_days': ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
            'users': {
                'full_name': 'Mary Wanjiru',
                'email': 'mary@example.com',
                'location': 'Westlands, Nairobi'
            }
        }
    ]
    
    # Get matches
    matches = matcher.predict_matches(learner, instructors)
    
    print("\n🎯 Matching Results:")
    for i, match in enumerate(matches, 1):
        print(f"\n{i}. {match['instructor_name']} ({match['match_score']*100:.0f}% match)")
        print(f"   {match['recommendation_strength']}")
        for reason in match['match_reasons']:
            print(f"   ✓ {reason}")
