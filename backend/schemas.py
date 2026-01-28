from __future__ import annotations

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


# ================== ENUMS ==================

class UserRole(str, Enum):
    STUDENT = "student"
    ALUMNI = "alumni"
    ADMIN = "admin"


# ================== AUTH SCHEMAS ==================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.STUDENT


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ================== USER SCHEMAS ==================

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    graduation_year: Optional[int] = None
    company: Optional[str] = None
    position: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    graduation_year: Optional[int] = None
    company: Optional[str] = None
    position: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ================== TOKEN SCHEMA ==================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ================== JOB SCHEMAS ==================

class JobPostingCreate(BaseModel):
    title: str
    description: str
    company: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None


class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None


class JobPostingResponse(BaseModel):
    id: str
    title: str
    description: str
    company: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    posted_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ================== MENTORSHIP SCHEMAS ==================

class MentorshipRequestCreate(BaseModel):
    mentor_id: str
    student_name: str
    student_email: EmailStr
    message: Optional[str] = None


class MentorshipRequestResponse(BaseModel):
    id: str
    mentor_id: str
    student_name: str
    student_email: EmailStr
    message: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ================== INTERVIEW EXPERIENCE SCHEMAS ==================

class InterviewExperienceCreate(BaseModel):
    company: str
    position: str
    experience: str
    difficulty: Optional[str] = None
    result: Optional[str] = None


class InterviewExperienceResponse(BaseModel):
    id: str
    user_id: str
    company: str
    position: str
    experience: str
    difficulty: Optional[str] = None
    result: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
