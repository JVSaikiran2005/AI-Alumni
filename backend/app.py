from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from config import Config
from database import init_db, SessionLocal, close_db
from models import Profile, UserDetails, Skill, Interest, MentorshipSession, JobPosting, VerificationRequest, VerificationStatus, SessionStatus
from auth_service import (
    register_user, login_user, get_user_profile, token_required, admin_required, verify_password, hash_password
)
from ai_service import generate_ai_matches, generate_career_insights, get_user_matches

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

app.teardown_appcontext(close_db)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'AlumniConnect AI Backend is running'})

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not all(k in data for k in ['email', 'password', 'full_name', 'role']):
        return jsonify({'error': 'Missing required fields'}), 400

    result = register_user(
        email=data['email'],
        password=data['password'],
        full_name=data['full_name'],
        role=data['role']
    )

    if 'error' in result:
        return jsonify(result), 400

    return jsonify(result), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not all(k in data for k in ['email', 'password']):
        return jsonify({'error': 'Missing email or password'}), 400

    result = login_user(data['email'], data['password'])

    if 'error' in result:
        return jsonify(result), 401

    return jsonify(result), 200

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    profile_data = get_user_profile(current_user.id)

    if 'error' in profile_data:
        return jsonify(profile_data), 404

    return jsonify(profile_data), 200

@app.route('/api/auth/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    db = SessionLocal()

    try:
        user = db.query(Profile).filter(Profile.id == current_user.id).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'bio' in data:
            user.bio = data['bio']
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']

        user_details = db.query(UserDetails).filter(
            UserDetails.user_id == current_user.id
        ).first()

        if not user_details:
            user_details = UserDetails(user_id=current_user.id)
            db.add(user_details)

        if 'institute' in data:
            user_details.institute = data['institute']
        if 'degree' in data:
            user_details.degree = data['degree']
        if 'major' in data:
            user_details.major = data['major']
        if 'graduation_year' in data:
            user_details.graduation_year = data['graduation_year']
        if 'current_company' in data:
            user_details.current_company = data['current_company']
        if 'job_title' in data:
            user_details.job_title = data['job_title']
        if 'experience_years' in data:
            user_details.experience_years = data['experience_years']
        if 'location' in data:
            user_details.location = data['location']
        if 'linkedin_url' in data:
            user_details.linkedin_url = data['linkedin_url']
        if 'github_url' in data:
            user_details.github_url = data['github_url']
        if 'portfolio_url' in data:
            user_details.portfolio_url = data['portfolio_url']
        if 'available_for_mentorship' in data:
            user_details.available_for_mentorship = data['available_for_mentorship']
        if 'can_provide_referrals' in data:
            user_details.can_provide_referrals = data['can_provide_referrals']

        db.commit()

        return jsonify(get_user_profile(current_user.id)), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/skills', methods=['GET'])
@token_required
def get_skills(current_user):
    db = SessionLocal()
    try:
        skills = db.query(Skill).all()
        return jsonify({
            'success': True,
            'skills': [{'id': s.id, 'name': s.name, 'category': s.category} for s in skills]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/skills', methods=['POST'])
@token_required
def add_skill(current_user):
    data = request.get_json()
    db = SessionLocal()

    try:
        user = db.query(Profile).filter(Profile.id == current_user.id).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        existing_skill = db.query(Skill).filter(Skill.name == data['name']).first()

        if not existing_skill:
            skill = Skill(name=data['name'], category=data.get('category'))
            db.add(skill)
            db.flush()
        else:
            skill = existing_skill

        if skill not in user.skills:
            user.skills.append(skill)

        db.commit()

        return jsonify({
            'success': True,
            'skill': {'id': skill.id, 'name': skill.name}
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/ai/matches', methods=['GET'])
@token_required
def get_matches(current_user):
    result = get_user_matches(current_user.id)
    if 'error' in result:
        return jsonify(result), 400
    return jsonify(result), 200

@app.route('/api/ai/generate-matches', methods=['POST'])
@token_required
def generate_matches(current_user):
    result = generate_ai_matches(current_user.id)

    if 'error' in result:
        return jsonify(result), 400

    return jsonify(result), 200

@app.route('/api/ai/career-insights', methods=['GET'])
@token_required
def career_insights(current_user):
    result = generate_career_insights()

    if 'error' in result:
        return jsonify(result), 400

    return jsonify(result), 200

@app.route('/api/mentorship', methods=['POST'])
@token_required
def request_mentorship(current_user):
    data = request.get_json()
    db = SessionLocal()

    try:
        session = MentorshipSession(
            student_id=current_user.id,
            alumni_id=data['alumni_id'],
            title=data.get('title', 'Mentorship Session'),
            description=data.get('description', ''),
            duration_minutes=data.get('duration_minutes', 30)
        )

        db.add(session)
        db.commit()

        return jsonify({
            'success': True,
            'session_id': session.id
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/jobs', methods=['GET'])
@token_required
def get_jobs(current_user):
    db = SessionLocal()
    try:
        jobs = db.query(JobPosting).filter(JobPosting.is_active == True).all()

        jobs_data = [{
            'id': j.id,
            'company': j.company,
            'title': j.title,
            'description': j.description,
            'job_type': j.job_type,
            'location': j.location,
            'salary_range': j.salary_range,
            'required_skills': j.required_skills,
            'posted_by': j.posted_by
        } for j in jobs]

        return jsonify({
            'success': True,
            'jobs': jobs_data
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/jobs', methods=['POST'])
@token_required
def post_job(current_user):
    from models import UserRole

    if current_user.user_role not in [UserRole.ALUMNI, UserRole.ADMIN]:
        return jsonify({'error': 'Only alumni can post jobs'}), 403

    data = request.get_json()
    db = SessionLocal()

    try:
        job = JobPosting(
            posted_by=current_user.id,
            company=data['company'],
            title=data['title'],
            description=data['description'],
            job_type=data['job_type'],
            location=data.get('location'),
            salary_range=data.get('salary_range'),
            required_skills=data.get('required_skills', []),
            experience_required=data.get('experience_required'),
            application_url=data.get('application_url'),
            is_active=True
        )

        db.add(job)
        db.commit()

        return jsonify({
            'success': True,
            'job_id': job.id
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/admin/verifications', methods=['GET'])
@admin_required
def get_verifications(current_user):
    db = SessionLocal()
    try:
        verifications = db.query(VerificationRequest).filter(
            VerificationRequest.status == VerificationStatus.PENDING
        ).all()

        verifications_data = [{
            'id': v.id,
            'user_id': v.user_id,
            'user_email': db.query(Profile).filter(Profile.id == v.user_id).first().email,
            'proof_type': v.proof_type,
            'status': v.status.value,
            'created_at': v.created_at.isoformat()
        } for v in verifications]

        return jsonify({
            'success': True,
            'verifications': verifications_data
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/admin/verifications/<verification_id>', methods=['PUT'])
@admin_required
def approve_verification(current_user, verification_id):
    data = request.get_json()
    db = SessionLocal()

    try:
        verification = db.query(VerificationRequest).filter(
            VerificationRequest.id == verification_id
        ).first()

        if not verification:
            return jsonify({'error': 'Verification not found'}), 404

        action = data.get('action', 'approve')

        if action == 'approve':
            verification.status = VerificationStatus.APPROVED
            verification.reviewed_by = current_user.id

            user = db.query(Profile).filter(Profile.id == verification.user_id).first()
            user.is_verified = True
            user.verification_badge = True

        else:
            verification.status = VerificationStatus.REJECTED
            verification.reviewed_by = current_user.id
            verification.admin_notes = data.get('notes', '')

        db.commit()

        return jsonify({
            'success': True,
            'message': f'Verification {action}ed successfully'
        }), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats(current_user):
    from models import UserRole

    db = SessionLocal()
    try:
        total_users = db.query(Profile).count()
        students = db.query(Profile).filter(Profile.user_role == UserRole.STUDENT).count()
        alumni = db.query(Profile).filter(Profile.user_role == UserRole.ALUMNI).count()
        pending_verifications = db.query(VerificationRequest).filter(
            VerificationRequest.status == VerificationStatus.PENDING
        ).count()
        active_sessions = db.query(MentorshipSession).filter(
            MentorshipSession.status == SessionStatus.ACCEPTED
        ).count()

        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'students': students,
                'alumni': alumni,
                'pending_verifications': pending_verifications,
                'active_sessions': active_sessions
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

if __name__ == '__main__':
    print("Initializing database...")
    init_db()
    print("Starting AlumniConnect AI Backend...")
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5000)
