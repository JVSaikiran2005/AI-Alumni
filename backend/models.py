from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Table, Text, JSON, Enum, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
import uuid

Base = declarative_base()

class UserRole(enum.Enum):
    STUDENT = 'student'
    ALUMNI = 'alumni'
    ADMIN = 'admin'

class VerificationStatus(enum.Enum):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'

class SessionStatus(enum.Enum):
    REQUESTED = 'requested'
    ACCEPTED = 'accepted'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'

class ReferralStatus(enum.Enum):
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'

user_skills_table = Table(
    'user_skills',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('profiles.id'), primary_key=True),
    Column('skill_id', String(36), ForeignKey('skills.id'), primary_key=True),
    Column('proficiency_level', Integer, default=1),
    Column('created_at', DateTime, default=datetime.utcnow)
)

class Profile(Base):
    __tablename__ = 'profiles'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    user_role = Column(Enum(UserRole), default=UserRole.STUDENT)
    avatar_url = Column(String(500))
    bio = Column(Text)
    is_verified = Column(Boolean, default=False)
    verification_badge = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_details = relationship('UserDetails', back_populates='profile', uselist=False, cascade='all, delete-orphan')
    skills = relationship('Skill', secondary=user_skills_table, backref='users')
    interests = relationship('Interest', back_populates='user', cascade='all, delete-orphan')
    matches_as_student = relationship('AIMatch', foreign_keys='AIMatch.student_id', back_populates='student')
    matches_as_alumni = relationship('AIMatch', foreign_keys='AIMatch.alumni_id', back_populates='alumni')
    sessions_as_student = relationship('MentorshipSession', foreign_keys='MentorshipSession.student_id', back_populates='student')
    sessions_as_alumni = relationship('MentorshipSession', foreign_keys='MentorshipSession.alumni_id', back_populates='alumni')
    job_postings = relationship('JobPosting', back_populates='posted_by')
    referral_requests = relationship('ReferralRequest', back_populates='student')

class UserDetails(Base):
    __tablename__ = 'user_details'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('profiles.id'), nullable=False, unique=True)
    institute = Column(String(255))
    degree = Column(String(255))
    major = Column(String(255))
    graduation_year = Column(Integer)
    current_company = Column(String(255))
    job_title = Column(String(255))
    experience_years = Column(Integer)
    location = Column(String(255))
    linkedin_url = Column(String(500))
    github_url = Column(String(500))
    portfolio_url = Column(String(500))
    available_for_mentorship = Column(Boolean, default=False)
    can_provide_referrals = Column(Boolean, default=False)
    achievements = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship('Profile', back_populates='user_details')

class Skill(Base):
    __tablename__ = 'skills'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), unique=True, nullable=False)
    category = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

class Interest(Base):
    __tablename__ = 'interests'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    domain = Column(String(255), nullable=False)
    sub_domain = Column(String(255))
    priority = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('Profile', back_populates='interests')

class AIMatch(Base):
    __tablename__ = 'ai_matches'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    alumni_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    match_score = Column(Float)
    match_reasons = Column(JSON, default=[])
    matched_skills = Column(ARRAY(String), default=[])
    matched_interests = Column(ARRAY(String), default=[])
    is_active = Column(Boolean, default=True)
    student_viewed = Column(Boolean, default=False)
    alumni_viewed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship('Profile', foreign_keys=[student_id], back_populates='matches_as_student')
    alumni = relationship('Profile', foreign_keys=[alumni_id], back_populates='matches_as_alumni')

class MentorshipSession(Base):
    __tablename__ = 'mentorship_sessions'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    alumni_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(SessionStatus), default=SessionStatus.REQUESTED)
    scheduled_at = Column(DateTime)
    duration_minutes = Column(Integer, default=30)
    meeting_link = Column(String(500))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship('Profile', foreign_keys=[student_id], back_populates='sessions_as_student')
    alumni = relationship('Profile', foreign_keys=[alumni_id], back_populates='sessions_as_alumni')

class VerificationRequest(Base):
    __tablename__ = 'verification_requests'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    institute_email = Column(String(255))
    document_url = Column(String(500))
    proof_type = Column(String(255), nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    admin_notes = Column(Text)
    reviewed_by = Column(String(36), ForeignKey('profiles.id'))
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class JobPosting(Base):
    __tablename__ = 'job_postings'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    posted_by = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    company = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    job_type = Column(String(100), nullable=False)
    location = Column(String(255))
    salary_range = Column(String(255))
    required_skills = Column(ARRAY(String), default=[])
    experience_required = Column(String(255))
    application_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    posted_by_user = relationship('Profile', back_populates='job_postings')

class ReferralRequest(Base):
    __tablename__ = 'referral_requests'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    job_posting_id = Column(String(36), ForeignKey('job_postings.id'))
    alumni_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    message = Column(Text, nullable=False)
    resume_url = Column(String(500))
    status = Column(Enum(ReferralStatus), default=ReferralStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship('Profile', foreign_keys=[student_id], back_populates='referral_requests')

class InterviewExperience(Base):
    __tablename__ = 'interview_experiences'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    author_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    company = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    interview_date = Column(DateTime)
    difficulty_level = Column(String(100))
    content = Column(Text, nullable=False)
    rounds = Column(JSON, default=[])
    questions_asked = Column(ARRAY(String), default=[])
    tips = Column(ARRAY(String), default=[])
    outcome = Column(String(100))
    upvotes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Message(Base):
    __tablename__ = 'messages'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    receiver_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    related_to = Column(String(100))
    related_id = Column(String(36))
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('profiles.id'), nullable=False)
    notification_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(500))
    is_read = Column(Boolean, default=False)
    data = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

class CareerTrend(Base):
    __tablename__ = 'career_trends'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    skill_name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=False)
    demand_score = Column(Float)
    avg_salary = Column(Integer)
    growth_rate = Column(Float)
    top_companies = Column(ARRAY(String), default=[])
    job_count = Column(Integer, default=0)
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
