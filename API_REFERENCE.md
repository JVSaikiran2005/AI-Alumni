# AlumniConnect AI - API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "role": "student"  // "student" | "alumni" | "admin"
}
```

**Response**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_role": "student"
  },
  "token": "jwt_token"
}
```

**Status Codes**
- `201` - User created successfully
- `400` - Invalid input or email already exists

---

### Login User
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_role": "student",
    "is_verified": false
  },
  "token": "jwt_token"
}
```

**Status Codes**
- `200` - Login successful
- `401` - Invalid credentials

---

### Get Profile
**GET** `/auth/profile`

Get current user's profile.

**Headers**
```
Authorization: Bearer <jwt_token>
```

**Response**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "user_role": "student",
  "bio": "Software engineer",
  "user_details": {
    "institute": "MIT",
    "degree": "B.S. Computer Science",
    "current_company": "Tech Corp",
    "job_title": "Software Engineer",
    "location": "San Francisco"
  }
}
```

**Status Codes**
- `200` - Profile retrieved
- `404` - User not found

---

### Update Profile
**PUT** `/auth/profile`

Update current user's profile.

**Request Body**
```json
{
  "full_name": "John Doe",
  "bio": "Updated bio",
  "avatar_url": "https://...",
  "institute": "MIT",
  "degree": "B.S.",
  "major": "Computer Science",
  "graduation_year": 2024,
  "current_company": "Tech Corp",
  "job_title": "Senior Engineer",
  "experience_years": 5,
  "location": "San Francisco",
  "linkedin_url": "https://linkedin.com/...",
  "github_url": "https://github.com/...",
  "available_for_mentorship": true,
  "can_provide_referrals": true
}
```

**Response**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  // ... updated fields
}
```

**Status Codes**
- `200` - Profile updated
- `500` - Update failed

---

## Skills Endpoints

### Get All Skills
**GET** `/skills`

Get list of available skills.

**Response**
```json
{
  "success": true,
  "skills": [
    {
      "id": "uuid",
      "name": "Python",
      "category": "Programming Language"
    },
    {
      "id": "uuid",
      "name": "React",
      "category": "Framework"
    }
  ]
}
```

---

### Add Skill to Profile
**POST** `/skills`

Add a skill to user's profile.

**Request Body**
```json
{
  "name": "Python",
  "category": "Programming Language"
}
```

**Response**
```json
{
  "success": true,
  "skill": {
    "id": "uuid",
    "name": "Python"
  }
}
```

**Status Codes**
- `201` - Skill added
- `500` - Error adding skill

---

## AI Endpoints

### Generate AI Matches
**POST** `/ai/generate-matches`

Generate AI-powered alumni matches for a student.

**Request**
```bash
POST /api/ai/generate-matches
Authorization: Bearer <token>
```

**Response**
```json
{
  "success": true,
  "matches_generated": 10,
  "matches": [
    {
      "alumni_id": "uuid",
      "alumni_name": "Jane Smith",
      "company": "Google",
      "job_title": "Senior Engineer",
      "score": 0.92,
      "matched_skills": ["Python", "System Design"],
      "matched_interests": ["Backend Development"],
      "reasons": ["2 matching skills", "Works at Google"]
    }
  ]
}
```

**Status Codes**
- `200` - Matches generated
- `400` - User not found or invalid role

---

### Get User Matches
**GET** `/ai/matches`

Get previously generated AI matches.

**Response**
```json
{
  "success": true,
  "matches": [
    {
      "id": "uuid",
      "alumni_id": "uuid",
      "alumni_name": "Jane Smith",
      "job_title": "Senior Engineer",
      "company": "Google",
      "score": 0.92,
      "matched_skills": ["Python"],
      "matched_interests": ["Backend"],
      "reasons": ["Skills match"]
    }
  ]
}
```

---

### Get Career Insights
**GET** `/ai/career-insights`

Get AI-generated career intelligence and market trends.

**Response**
```json
{
  "success": true,
  "market_summary": {
    "total_active_jobs": 150,
    "most_in_demand": "Python",
    "avg_growth_rate": "15.3%",
    "total_alumni": 250
  },
  "trending_skills": [
    {
      "skill": "Python",
      "demand": 45,
      "growth_rate": 22.5
    }
  ],
  "top_companies": [
    {
      "company": "Google",
      "positions": 15,
      "alumni_count": 12
    }
  ],
  "career_paths": [
    {
      "path": "Software Engineer",
      "avg_salary": 110000,
      "demand": "Very High",
      "time_to_proficiency": "2-3 years",
      "skills_needed": ["Python", "System Design"]
    }
  ]
}
```

---

## Mentorship Endpoints

### Request Mentorship Session
**POST** `/mentorship`

Request a mentorship session with an alumni.

**Request Body**
```json
{
  "alumni_id": "uuid",
  "title": "Career Guidance Session",
  "description": "Discuss career transitions",
  "duration_minutes": 30
}
```

**Response**
```json
{
  "success": true,
  "session_id": "uuid"
}
```

**Status Codes**
- `201` - Session created
- `500` - Error creating session

---

## Job Endpoints

### Get All Jobs
**GET** `/jobs`

Get all active job postings.

**Response**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "uuid",
      "company": "Tech Corp",
      "title": "Software Engineer",
      "description": "We are hiring...",
      "job_type": "Full-time",
      "location": "San Francisco",
      "salary_range": "$120k - $160k",
      "required_skills": ["Python", "React"],
      "posted_by": "uuid"
    }
  ]
}
```

---

### Post Job (Alumni Only)
**POST** `/jobs`

Post a new job opportunity.

**Request Body**
```json
{
  "company": "Tech Corp",
  "title": "Software Engineer",
  "description": "Join our engineering team...",
  "job_type": "Full-time",
  "location": "San Francisco",
  "salary_range": "$120k - $160k",
  "required_skills": ["Python", "React"],
  "experience_required": "3+ years",
  "application_url": "https://careers.techcorp.com"
}
```

**Response**
```json
{
  "success": true,
  "job_id": "uuid"
}
```

**Status Codes**
- `201` - Job posted
- `403` - Only alumni can post jobs
- `500` - Error posting job

---

## Admin Endpoints

### Get Pending Verifications
**GET** `/admin/verifications`

Get list of pending alumni verifications.

**Headers**
```
Authorization: Bearer <admin_token>
```

**Response**
```json
{
  "success": true,
  "verifications": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_email": "alumni@example.com",
      "proof_type": "institute_email",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Approve/Reject Verification
**PUT** `/admin/verifications/<verification_id>`

Approve or reject an alumni verification request.

**Request Body**
```json
{
  "action": "approve",  // "approve" | "reject"
  "notes": "Verified via alumni email"
}
```

**Response**
```json
{
  "success": true,
  "message": "Verification approved successfully"
}
```

**Status Codes**
- `200` - Action completed
- `403` - Admin access required
- `404` - Verification not found

---

### Get Admin Statistics
**GET** `/admin/stats`

Get platform statistics.

**Response**
```json
{
  "success": true,
  "stats": {
    "total_users": 1250,
    "students": 800,
    "alumni": 400,
    "pending_verifications": 15,
    "active_sessions": 45
  }
}
```

---

## Error Responses

### Common Error Format
```json
{
  "error": "Error message describing what went wrong"
}
```

### Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, implement:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

---

## CORS

CORS is enabled for local development on:
- `http://localhost:5173`
- `http://localhost:3000`
- `*` (all origins in development)

---

## Pagination

List endpoints support optional pagination:
```
GET /jobs?page=1&limit=20
```

---

## Sorting

List endpoints support optional sorting:
```
GET /jobs?sort=created_at&order=desc
```

---

## Examples

### Register and Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

### Generate Matches
```bash
curl -X POST http://localhost:5000/api/ai/generate-matches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Post a Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Tech Corp",
    "title": "Software Engineer",
    "description": "Join our team",
    "job_type": "Full-time",
    "required_skills": ["Python", "React"]
  }'
```

---

## Webhooks (Future Enhancement)

Planned webhook events:
- `match.created` - When a new match is generated
- `session.requested` - When mentorship session requested
- `job.posted` - When new job is posted
- `user.verified` - When user gets verified

---

## WebSocket Events (Future Enhancement)

Planned real-time events:
- `match_notification` - Real-time match notifications
- `message_new` - New message received
- `session_update` - Session status changes
- `notification_new` - New notification

---

For more information, see:
- **QUICK_START.md** - Getting started guide
- **README.md** - General documentation
- **SETUP_LOCAL.md** - Detailed setup instructions
