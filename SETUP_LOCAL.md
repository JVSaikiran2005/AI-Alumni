# AlumniConnect AI - Local Development Setup Guide

This guide will help you set up AlumniConnect AI with a local PostgreSQL database and Python Flask backend.

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 12+
- Docker & Docker Compose (optional, for containerized setup)
- Git

## Option 1: Local Setup (Manual)

### Step 1: Install PostgreSQL

#### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
Download installer from https://www.postgresql.org/download/windows/

### Step 2: Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE USER alumniconnect WITH PASSWORD 'alumni_password';
CREATE DATABASE alumniconnect_db OWNER alumniconnect;
GRANT ALL PRIVILEGES ON DATABASE alumniconnect_db TO alumniconnect;

# Exit psql
\q
```

### Step 3: Clone and Setup Frontend

```bash
# Navigate to project directory
cd /path/to/project

# Copy environment file
cp .env.example .env.local

# Install dependencies
npm install

# Update .env.local if needed
# Set: VITE_API_URL=http://localhost:5000
```

### Step 4: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file in backend directory
# DATABASE_URL=postgresql://alumniconnect:alumni_password@localhost:5432/alumniconnect_db
# JWT_SECRET_KEY=your-dev-secret-key

# Initialize database (creates all tables)
python -c "from database import init_db; init_db()"

# Run Flask server
python app.py
```

### Step 5: Run Frontend in New Terminal

```bash
# Navigate to project root
cd /path/to/project

# Start development server
npm run dev

# Frontend will be available at http://localhost:5173
# API is available at http://localhost:5000
```

### Step 6: Verify Setup

1. Open http://localhost:5173 in your browser
2. Register a new account
3. Test AI matching and other features

## Option 2: Docker Setup (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Running with Docker

```bash
# Navigate to project directory
cd /path/to/project

# Copy environment file
cp .env.example .env.local

# Build and start all services
docker-compose up --build

# Services will start:
# - PostgreSQL: localhost:5432
# - Backend API: localhost:5000
# - Frontend: localhost:5173
```

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (delete database)
docker-compose down -v

# Rebuild services
docker-compose up --build

# Run migrations
docker-compose exec backend python -c "from database import init_db; init_db()"
```

## Database Management

### Connect to PostgreSQL (Local Setup)

```bash
# Connect with psql
psql -U alumniconnect -d alumniconnect_db -h localhost

# Common commands
\dt           # List all tables
\d table_name # Describe table
SELECT * FROM profiles;  # Query data
```

### Connect to PostgreSQL (Docker)

```bash
# Connect via Docker
docker-compose exec db psql -U alumniconnect -d alumniconnect_db

# Or use connection string
psql postgresql://alumniconnect:alumni_password@localhost:5432/alumniconnect_db
```

### Backup and Restore Database

```bash
# Backup database
pg_dump -U alumniconnect -d alumniconnect_db > backup.sql

# Restore database
psql -U alumniconnect -d alumniconnect_db < backup.sql

# With Docker
docker-compose exec db pg_dump -U alumniconnect alumniconnect_db > backup.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### AI Features
- `POST /api/ai/generate-matches` - Generate AI matches for student
- `GET /api/ai/matches` - Get user's matches
- `GET /api/ai/career-insights` - Get career intelligence

### Jobs & Opportunities
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Post new job (alumni only)

### Mentorship
- `POST /api/mentorship` - Request mentorship session

### Admin
- `GET /api/admin/verifications` - Get pending verifications
- `PUT /api/admin/verifications/<id>` - Approve/reject verification
- `GET /api/admin/stats` - Get platform statistics

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
# macOS/Linux
lsof -i :5000
lsof -i :5173
lsof -i :5432

# Kill process
kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U alumniconnect -d alumniconnect_db -h localhost

# Check if service is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Verify DATABASE_URL format:
# postgresql://username:password@host:port/database
```

### CORS Errors
Ensure `VITE_API_URL=http://localhost:5000` is set in frontend `.env.local`

### Flask Not Starting
```bash
# Check Python version
python --version  # Should be 3.11+

# Verify dependencies
pip list | grep Flask

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Frontend Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

## Development Workflow

### Starting Development

1. **Start PostgreSQL** (if not using Docker)
   ```bash
   # macOS
   brew services start postgresql@15
   ```

2. **Start Backend Server** (in Terminal 1)
   ```bash
   cd backend
   source venv/bin/activate
   python app.py
   ```

3. **Start Frontend Server** (in Terminal 2)
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Making Changes

- **Backend Changes**: Restart Flask server (Ctrl+C, then `python app.py`)
- **Frontend Changes**: Hot reload (changes apply automatically)
- **Database Schema Changes**:
  1. Update models.py
  2. Restart backend and reinitialize: `python -c "from database import init_db; init_db()"`

## Production Deployment

### Environment Variables for Production

```bash
DATABASE_URL=postgresql://user:password@prod-host:5432/db
JWT_SECRET_KEY=<generate-secure-random-key>
FLASK_ENV=production
FLASK_DEBUG=0
```

### Deployment Steps

1. Build frontend
   ```bash
   npm run build
   ```

2. Deploy to hosting service (Vercel, Netlify, etc.)

3. Deploy backend to server (Heroku, Railway, AWS, etc.)

4. Update production database

5. Test all features

## Performance Tips

- Use database indexes (included in schema)
- Enable gzip compression
- Use CDN for static assets
- Implement caching for AI matches
- Monitor database query performance

## Support & Documentation

For more information:
- See README.md for general documentation
- See ARCHITECTURE.md for system design
- Check API documentation in backend comments

---

**Need help?** Review error messages carefully and check logs:
- Frontend: Browser console (F12)
- Backend: Terminal output
- Database: PostgreSQL logs
