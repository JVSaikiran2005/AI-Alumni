import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from database import SessionLocal
from models import Profile, UserRole, UserDetails
from sqlalchemy.exc import IntegrityError

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hash.encode('utf-8'))

def create_access_token(user_id: str, expires_delta: timedelta = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(days=30)

    expire = datetime.utcnow() + expires_delta
    payload = {
        'user_id': user_id,
        'exp': expire,
        'iat': datetime.utcnow()
    }

    token = jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    return token

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        payload = verify_token(token)
        if payload is None:
            return jsonify({'message': 'Invalid or expired token'}), 401

        db = SessionLocal()
        user = db.query(Profile).filter(Profile.id == payload['user_id']).first()
        db.close()

        if not user:
            return jsonify({'message': 'User not found'}), 404

        return f(current_user=user, *args, **kwargs)

    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        payload = verify_token(token)
        if payload is None:
            return jsonify({'message': 'Invalid or expired token'}), 401

        db = SessionLocal()
        user = db.query(Profile).filter(Profile.id == payload['user_id']).first()

        if not user or user.user_role != UserRole.ADMIN:
            db.close()
            return jsonify({'message': 'Admin access required'}), 403

        db.close()
        return f(current_user=user, *args, **kwargs)

    return decorated

def register_user(email: str, password: str, full_name: str, role: str) -> dict:
    db = SessionLocal()
    try:
        existing_user = db.query(Profile).filter(Profile.email == email).first()
        if existing_user:
            return {'error': 'Email already registered'}

        password_hash = hash_password(password)

        user = Profile(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            user_role=UserRole[role.upper()] if role.upper() in UserRole.__members__ else UserRole.STUDENT
        )

        db.add(user)
        db.flush()

        user_details = UserDetails(
            user_id=user.id,
            available_for_mentorship=(user.user_role == UserRole.ALUMNI),
            can_provide_referrals=(user.user_role == UserRole.ALUMNI)
        )

        db.add(user_details)
        db.commit()

        token = create_access_token(user.id)

        return {
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'user_role': user.user_role.value
            },
            'token': token
        }
    except Exception as e:
        db.rollback()
        return {'error': str(e)}
    finally:
        db.close()

def login_user(email: str, password: str) -> dict:
    db = SessionLocal()
    try:
        user = db.query(Profile).filter(Profile.email == email).first()

        if not user or not verify_password(password, user.password_hash):
            return {'error': 'Invalid credentials'}

        token = create_access_token(user.id)

        return {
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'user_role': user.user_role.value,
                'is_verified': user.is_verified
            },
            'token': token
        }
    except Exception as e:
        return {'error': str(e)}
    finally:
        db.close()

def get_user_profile(user_id: str) -> dict:
    db = SessionLocal()
    try:
        user = db.query(Profile).filter(Profile.id == user_id).first()

        if not user:
            return {'error': 'User not found'}

        user_details = db.query(UserDetails).filter(UserDetails.user_id == user_id).first()

        return {
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'user_role': user.user_role.value,
            'avatar_url': user.avatar_url,
            'bio': user.bio,
            'is_verified': user.is_verified,
            'verification_badge': user.verification_badge,
            'user_details': {
                'institute': user_details.institute if user_details else None,
                'degree': user_details.degree if user_details else None,
                'major': user_details.major if user_details else None,
                'graduation_year': user_details.graduation_year if user_details else None,
                'current_company': user_details.current_company if user_details else None,
                'job_title': user_details.job_title if user_details else None,
                'experience_years': user_details.experience_years if user_details else None,
                'location': user_details.location if user_details else None,
                'linkedin_url': user_details.linkedin_url if user_details else None,
                'github_url': user_details.github_url if user_details else None,
                'portfolio_url': user_details.portfolio_url if user_details else None,
                'available_for_mentorship': user_details.available_for_mentorship if user_details else False,
                'can_provide_referrals': user_details.can_provide_referrals if user_details else False,
            } if user_details else {}
        }
    except Exception as e:
        return {'error': str(e)}
    finally:
        db.close()
