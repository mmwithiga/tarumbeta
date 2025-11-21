"""
API Routes Package
"""
# This file makes the routes directory a Python package


"""
API Routes Package
Exposes all route blueprints for easier imports
"""
from app.routes.auth import bp as auth_bp
from app.routes.instruments import bp as instruments_bp
from app.routes.rentals import bp as rentals_bp
from app.routes.instructors import bp as instructors_bp
from app.routes.lessons import bp as lessons_bp
from app.routes.matching import bp as matching_bp
from app.routes.reviews import bp as reviews_bp

all = [
    'auth_bp',
    'instruments_bp', 
    'rentals_bp',
    'instructors_bp',
    'lessons_bp',
    'matching_bp',
    'reviews_bp'
]
