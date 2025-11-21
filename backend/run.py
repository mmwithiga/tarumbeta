"""
Tarumbeta Flask Backend - Entry Point
"""
import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    print(f"""
    🎵 Tarumbeta API Server Starting...
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Environment: {os.getenv('FLASK_ENV', 'development')}
    Port: {port}
    Debug Mode: {debug}
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    """)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
