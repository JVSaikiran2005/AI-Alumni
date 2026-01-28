# AlumniConnect AI - Quick Start Guide

## 🚀 Fastest Way to Get Started

### Using Docker (Recommended - 3 Steps)

```bash
# 1. Copy environment file
cp .env.example .env.local

# 2. Start all services
docker-compose up --build

# 3. Open http://localhost:5173 in your browser
```

That's it! Everything will be running automatically.

---

## 🛠️ Manual Setup (5 Steps)

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend (in separate terminal)
cd backend
python -m venv venv
# Activate: source venv/bin/activate (macOS/Linux) or venv\Scripts\activate (Windows)
pip install -r requirements.txt
```

### 2. Setup PostgreSQL

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
psql -U postgres -c "CREATE USER alumniconnect WITH PASSWORD 'alumni_password';"
psql -U postgres -c "CREATE DATABASE alumniconnect_db OWNER alumniconnect;"
```

### 3. Start Backend

```bash
cd backend
python app.py
# Backend runs on http://localhost:5000
```

### 4. Start Frontend (New Terminal)

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### 5. Create Test Accounts

1. Go to http://localhost:5173
2. Register as Student: `student@test.com` / `password123`
3. Register as Alumni: `alumni@test.com` / `password123`

---

## 📋 Project Structure

```
project/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/               # Reusable components
│   ├── pages/                    # Dashboard pages
│   ├── contexts/                 # Auth context
│   └── lib/                      # API client
│
├── backend/                      # Python Flask API
│   ├── app.py                    # Main Flask app
│   ├── models.py                 # Database models
│   ├── auth_service.py           # Authentication
│   ├── ai_service.py             # AI matching & insights
│   ├── database.py               # Database setup
│   ├── config.py                 # Configuration
│   └── requirements.txt          # Python dependencies
│
├── docker-compose.yml            # Docker orchestration
├── .env.local                    # Environment variables
├── SETUP_LOCAL.md                # Detailed setup guide
└── README.md                     # Documentation
```

---

## 🎯 Key Features Ready to Use

✅ **User Authentication**
- Register & login with role selection
- JWT token-based auth
- Password hashing with bcrypt

✅ **AI-Powered Matching**
- Intelligent student-alumni matching
- Skill overlap scoring
- Interest alignment

✅ **Mentorship System**
- 1-on-1 session requests
- Session tracking
- Feedback system

✅ **Career Intelligence**
- Trending skills analysis
- Job market insights
- Career path recommendations

✅ **Admin Dashboard**
- Alumni verification approval
- Platform analytics
- User management

---

## 🔐 Test Accounts

### Student Account
- **Email**: `student@example.com`
- **Password**: `password123`
- **Role**: Student
- **Permissions**: View matches, request mentorship, request referrals

### Alumni Account
- **Email**: `alumni@example.com`
- **Password**: `password123`
- **Role**: Alumni
- **Permissions**: Post jobs, provide referrals, be mentor

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `password123`
- **Role**: Admin
- **Permissions**: Approve verifications, view analytics

---

## 📚 API Examples

### Generate AI Matches (Student)
```bash
curl -X POST http://localhost:5000/api/ai/generate-matches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Career Insights
```bash
curl -X GET http://localhost:5000/api/ai/career-insights \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Post a Job (Alumni)
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Tech Corp",
    "title": "Software Engineer",
    "description": "Join our team...",
    "job_type": "Full-time",
    "required_skills": ["Python", "React"]
  }'
```

---

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Find process
lsof -i :5000  # Backend
lsof -i :5173  # Frontend

# Kill process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Verify connection
psql -U alumniconnect -d alumniconnect_db
```

### CORS Error
```bash
# Make sure VITE_API_URL is set correctly
# In .env.local: VITE_API_URL=http://localhost:5000
```

### Token Issues
```bash
# Clear browser storage
# Delete localStorage in DevTools (F12)
# Logout and login again
```

---

## 📱 Frontend URLs

| Page | URL | Access |
|------|-----|--------|
| Landing | http://localhost:5173 | Public |
| Student Dashboard | http://localhost:5173 | Student |
| Alumni Dashboard | http://localhost:5173 | Alumni |
| Admin Dashboard | http://localhost:5173 | Admin |

---

## 🔄 Development Workflow

### Making Code Changes

**Frontend** (Auto-reload on save)
```bash
# Edit src/ files
# Changes reload instantly
```

**Backend** (Manual restart)
```bash
# Edit backend/ files
# Restart: Ctrl+C then python app.py
```

**Database Schema** (Reinitialize)
```bash
# Edit backend/models.py
# Restart backend
# Database initializes on startup
```

---

## 📊 Database

### Connection String
```
postgresql://alumniconnect:alumni_password@localhost:5432/alumniconnect_db
```

### Connect via psql
```bash
psql -U alumniconnect -d alumniconnect_db
```

### Key Tables
- `profiles` - User accounts
- `user_details` - Profile information
- `ai_matches` - AI-generated matches
- `mentorship_sessions` - Mentorship bookings
- `job_postings` - Job opportunities
- `interview_experiences` - Interview prep

---

## 🚀 Production Deployment

### Build Frontend
```bash
npm run build
# Output: dist/
```

### Deploy Frontend
- Deploy `dist/` to Vercel, Netlify, or any static host

### Deploy Backend
- Deploy Flask app to Heroku, Railway, AWS, etc.
- Update environment variables
- Use production database

### Update Configuration
```bash
# Production .env
DATABASE_URL=<production-db-url>
VITE_API_URL=<production-api-url>
JWT_SECRET_KEY=<secure-random-key>
FLASK_ENV=production
```

---

## 📞 Support

Need help? Check:
1. **SETUP_LOCAL.md** - Detailed setup instructions
2. **ARCHITECTURE.md** - System design and structure
3. **README.md** - Full documentation
4. **Backend logs** - Error messages in terminal
5. **Frontend console** - Browser DevTools (F12)

---

## 🎓 Learning Resources

### Understanding the Architecture
- Frontend calls REST API at `localhost:5000`
- Backend uses SQLAlchemy ORM with PostgreSQL
- JWT tokens for authentication
- CORS enabled for local development

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Flask, SQLAlchemy, PostgreSQL
- **AI**: Python-based matching algorithm
- **Database**: PostgreSQL with ARRAY support

---

**Happy developing! 🎉**

Start with Docker for fastest setup, or follow manual steps for more control.
Questions? Check the detailed guides linked above.
