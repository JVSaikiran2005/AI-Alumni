import os
from datetime import timedelta

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://alumniconnect:alumni_password@localhost:5432/alumniconnect_db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:3000', '*']
    DEBUG = os.getenv('FLASK_ENV') == 'development'
