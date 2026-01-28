from sqlalchemy import Column, String, Integer, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ALUMNI = "alumni"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    bio = Column(Text)
    profile_image = Column(String)
    graduation_year = Column(Integer)
    company = Column(String)
    position = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job_postings = relationship("JobPosting", back_populates="poster")
    mentorship_requests = relationship("MentorshipRequest", back_populates="mentor")
    interview_experiences = relationship("InterviewExperience", back_populates="user")

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    salary_range = Column(String)
    job_type = Column(String)
    posted_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    poster = relationship("User", back_populates="job_postings")

class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"

    id = Column(String, primary_key=True, index=True)
    mentor_id = Column(String, ForeignKey("users.id"), nullable=False)
    student_name = Column(String, nullable=False)
    student_email = Column(String, nullable=False)
    message = Column(Text)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    mentor = relationship("User", back_populates="mentorship_requests")

class InterviewExperience(Base):
    __tablename__ = "interview_experiences"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    position = Column(String, nullable=False)
    experience = Column(Text, nullable=False)
    difficulty = Column(String)
    result = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="interview_experiences")
