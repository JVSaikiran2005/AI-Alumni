from __future__ import annotations
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    ALUMNI = "alumni"
    ADMIN = "admin"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.STUDENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    graduation_year: Optional[int] = None
    company: Optional[str] = None
    position: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    bio: Optional[str]
    profile_image: Optional[str]
    graduation_year: Optional[int]
    company: Optional[str]
    position: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

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
    location: Optional[str]
    salary_range: Optional[str]
    job_type: Optional[str]
    posted_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MentorshipRequestCreate(BaseModel):
    mentor_id: str
    student_name: str
    student_email: EmailStr
    message: Optional[str] = None

class MentorshipRequestResponse(BaseModel):
    id: str
    mentor_id: str
    student_name: str
    student_email: str
    message: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

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
    difficulty: Optional[str]
    result: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
