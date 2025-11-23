"""
Tarumbeta Flask Application Factory
"""
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

def create_app():
    """Create and configure Flask application"""
    
    # Load environment variables
    load_dotenv()
    
    # Initialize Flask app
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # CORS Configuration
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Register blueprints
    from app.routes import auth, instruments, rentals, instructors, lessons, matching, reviews
    
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(instruments.bp, url_prefix='/api/instruments')
    app.register_blueprint(rentals.bp, url_prefix='/api/rentals')
    app.register_blueprint(instructors.bp, url_prefix='/api/instructors')
    app.register_blueprint(lessons.bp, url_prefix='/api/lessons')
    app.register_blueprint(matching.bp, url_prefix='/api/matching')
    app.register_blueprint(reviews.bp, url_prefix='/api/reviews')
    
    # Health check endpoint
    @app.route('/health')
    def health():
        return {
            'status': 'healthy',
            'service': 'Tarumbeta API',
            'version': '1.0.0'
        }, 200
    
    # Root endpoint
    @app.route('/')
    def root():
        return {
            'message': 'Tarumbeta API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'instruments': '/api/instruments',
                'rentals': '/api/rentals',
                'instructors': '/api/instructors',
                'lessons': '/api/lessons',
                'matching': '/api/matching',
                'reviews': '/api/reviews'
            }
        }, 200
    
    return app
