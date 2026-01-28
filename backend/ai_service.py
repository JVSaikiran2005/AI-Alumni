from database import SessionLocal
from models import Profile, UserDetails, Skill, Interest, AIMatch, UserRole, JobPosting, CareerTrend
from sqlalchemy import func
from datetime import datetime, timedelta
from collections import Counter

def generate_ai_matches(student_id: str, top_n: int = 10):
    db = SessionLocal()
    try:
        student = db.query(Profile).filter(Profile.id == student_id).first()
        if not student or student.user_role != UserRole.STUDENT:
            return {'error': 'Only students can generate matches'}

        student_skills = db.query(Skill).join(
            Profile.skills
        ).filter(Profile.id == student_id).all()

        student_interests = db.query(Interest).filter(
            Interest.user_id == student_id
        ).all()

        alumni = db.query(Profile).filter(
            (Profile.user_role == UserRole.ALUMNI) &
            (Profile.is_verified == True)
        ).all()

        if not alumni:
            return {
                'success': True,
                'message': 'No verified alumni available',
                'matches': []
            }

        student_skill_names = [s.name for s in student_skills]
        student_domains = [i.domain for i in student_interests]

        matches = []

        for alumni_profile in alumni:
            alumni_skills = db.query(Skill).join(
                Profile.skills
            ).filter(Profile.id == alumni_profile.id).all()

            alumni_skill_names = [s.name for s in alumni_skills]

            matched_skills = [s for s in student_skill_names if s in alumni_skill_names]
            skill_score = len(matched_skills) / max(len(student_skill_names), 1)

            alumni_interests = db.query(Interest).filter(
                Interest.user_id == alumni_profile.id
            ).all()

            alumni_domains = [i.domain for i in alumni_interests]
            matched_interests = [d for d in student_domains if d in alumni_domains]
            interest_score = len(matched_interests) / max(len(student_domains), 1)

            final_score = (skill_score * 0.6) + (interest_score * 0.4)

            if final_score > 0.2:
                reasons = []
                if matched_skills:
                    reasons.append(f"{len(matched_skills)} matching skills")
                if matched_interests:
                    reasons.append(f"{len(matched_interests)} matching interests")

                alumni_details = db.query(UserDetails).filter(
                    UserDetails.user_id == alumni_profile.id
                ).first()

                if alumni_details and alumni_details.current_company:
                    reasons.append(f"Works at {alumni_details.current_company}")

                matches.append({
                    'alumni_id': alumni_profile.id,
                    'score': min(final_score, 1.0),
                    'matched_skills': matched_skills,
                    'matched_interests': matched_interests,
                    'reasons': reasons,
                    'alumni_name': alumni_profile.full_name,
                    'company': alumni_details.current_company if alumni_details else 'N/A',
                    'job_title': alumni_details.job_title if alumni_details else 'N/A'
                })

        matches.sort(key=lambda x: x['score'], reverse=True)
        top_matches = matches[:top_n]

        for match in top_matches:
            existing_match = db.query(AIMatch).filter(
                (AIMatch.student_id == student_id) &
                (AIMatch.alumni_id == match['alumni_id'])
            ).first()

            if existing_match:
                existing_match.match_score = match['score']
                existing_match.matched_skills = match['matched_skills']
                existing_match.matched_interests = match['matched_interests']
                existing_match.match_reasons = match['reasons']
                existing_match.is_active = True
            else:
                new_match = AIMatch(
                    student_id=student_id,
                    alumni_id=match['alumni_id'],
                    match_score=match['score'],
                    matched_skills=match['matched_skills'],
                    matched_interests=match['matched_interests'],
                    match_reasons=match['reasons'],
                    is_active=True
                )
                db.add(new_match)

        db.commit()

        return {
            'success': True,
            'matches_generated': len(top_matches),
            'matches': top_matches
        }
    except Exception as e:
        db.rollback()
        return {'error': str(e)}
    finally:
        db.close()

def generate_career_insights():
    db = SessionLocal()
    try:
        jobs = db.query(JobPosting).filter(JobPosting.is_active == True).all()

        job_count = len(jobs)

        skill_demand = {}
        for job in jobs:
            for skill in job.required_skills or []:
                if skill not in skill_demand:
                    skill_demand[skill] = 0
                skill_demand[skill] += 1

        trending_skills = sorted(
            skill_demand.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]

        company_hiring = {}
        for job in jobs:
            if job.company not in company_hiring:
                company_hiring[job.company] = 0
            company_hiring[job.company] += 1

        top_companies = sorted(
            company_hiring.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        alumni_count = db.query(Profile).filter(
            Profile.user_role == UserRole.ALUMNI
        ).count()

        students = db.query(Profile).filter(
            Profile.user_role == UserRole.STUDENT
        ).all()

        personalized_insights = []

        salary_trends = {
            'Junior Developer': 60000,
            'Senior Developer': 120000,
            'Data Scientist': 100000,
            'Product Manager': 110000,
            'UX Designer': 90000,
            'DevOps Engineer': 115000,
        }

        career_paths = [
            {
                'path': 'Software Engineer',
                'avg_salary': 110000,
                'demand': 'Very High',
                'time_to_proficiency': '2-3 years',
                'skills_needed': ['Python', 'JavaScript', 'System Design', 'Data Structures']
            },
            {
                'path': 'Data Scientist',
                'avg_salary': 120000,
                'demand': 'High',
                'time_to_proficiency': '2-4 years',
                'skills_needed': ['Python', 'Statistics', 'Machine Learning', 'SQL']
            },
            {
                'path': 'Product Manager',
                'avg_salary': 130000,
                'demand': 'High',
                'time_to_proficiency': '3-5 years',
                'skills_needed': ['Analytics', 'Communication', 'Strategy', 'User Research']
            }
        ]

        return {
            'success': True,
            'market_summary': {
                'total_active_jobs': job_count,
                'most_in_demand': trending_skills[0][0] if trending_skills else 'N/A',
                'avg_growth_rate': '15.3%',
                'total_alumni': alumni_count
            },
            'trending_skills': [
                {
                    'skill': skill,
                    'demand': count,
                    'growth_rate': (count / max(job_count, 1)) * 20
                }
                for skill, count in trending_skills
            ],
            'top_companies': [
                {
                    'company': company,
                    'positions': count,
                    'alumni_count': db.query(Profile).join(
                        UserDetails
                    ).filter(
                        (UserDetails.current_company == company) &
                        (Profile.user_role == UserRole.ALUMNI)
                    ).count()
                }
                for company, count in top_companies
            ],
            'career_paths': career_paths,
            'personalized_insights': personalized_insights
        }
    except Exception as e:
        return {'error': str(e)}
    finally:
        db.close()

def get_user_matches(user_id: str):
    db = SessionLocal()
    try:
        matches = db.query(AIMatch).filter(
            AIMatch.student_id == user_id
        ).order_by(AIMatch.match_score.desc()).all()

        matches_data = []
        for match in matches:
            alumni = db.query(Profile).filter(Profile.id == match.alumni_id).first()
            alumni_details = db.query(UserDetails).filter(
                UserDetails.user_id == match.alumni_id
            ).first()

            matches_data.append({
                'id': match.id,
                'alumni_id': match.alumni_id,
                'alumni_name': alumni.full_name if alumni else 'N/A',
                'job_title': alumni_details.job_title if alumni_details else 'N/A',
                'company': alumni_details.current_company if alumni_details else 'N/A',
                'score': match.match_score,
                'matched_skills': match.matched_skills,
                'matched_interests': match.matched_interests,
                'reasons': match.match_reasons
            })

        return {
            'success': True,
            'matches': matches_data
        }
    except Exception as e:
        return {'error': str(e)}
    finally:
        db.close()
