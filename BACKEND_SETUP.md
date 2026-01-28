# AlumniConnect Backend Setup

## Local Development with Docker

### Prerequisites
- Docker and Docker Compose installed
- Python 3.11+ (for non-Docker development)

### Quick Start with Docker

1. **Start the services:**
```bash
docker-compose up --build
```

This will:
- Start PostgreSQL on `localhost:5432`
- Start FastAPI backend on `localhost:8000`
- Create all database tables automatically

2. **Verify it's running:**
```bash
curl http://localhost:8000/health
```

3. **Stop the services:**
```bash
docker-compose down
```

### Local Development (without Docker)

1. **Install PostgreSQL locally:**
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`
   - Windows: Download from https://www.postgresql.org/download/windows/

2. **Create database:**
```bash
createdb -U postgres alumniconnect
psql -U postgres -d alumniconnect -c "CREATE USER alumni_user WITH PASSWORD 'alumni_password';"
psql -U postgres -d alumniconnect -c "GRANT ALL PRIVILEGES ON DATABASE alumniconnect TO alumni_user;"
```

3. **Setup Python environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Create `.env` file:**
```bash
cp .env.example .env
```

5. **Run backend:**
```bash
cd backend
uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

### API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Database

- Host: `localhost`
- Port: `5432`
- Database: `alumniconnect`
- User: `alumni_user`
- Password: `alumni_password`

To access the database:
```bash
psql -U alumni_user -d alumniconnect -h localhost
```

### Frontend Connection

Update the React frontend `.env` to use:
```
VITE_API_URL=http://localhost:8000
```

### Project Structure

```
backend/
├── main.py           # FastAPI app entry point
├── config.py         # Configuration settings
├── database.py       # Database connection
├── models.py         # SQLAlchemy models
├── schemas.py        # Pydantic schemas
├── requirements.txt  # Python dependencies
└── .env             # Environment variables (local only)
```

### Troubleshooting

**Connection refused on 5432:**
- Ensure PostgreSQL is running
- Check if port 5432 is already in use

**Database doesn't exist:**
- Run the database creation commands again
- Ensure user has proper privileges

**Python dependency issues:**
- Delete `venv` folder and reinstall
- Run `pip install --upgrade pip setuptools wheel`
