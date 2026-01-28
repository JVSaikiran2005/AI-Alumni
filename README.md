# AlumniConnect AI - Smart Alumni Engagement & Career Intelligence Platform

Production-grade alumni networking and career intelligence platform with AI-powered matching, mentorship system, and comprehensive analytics.

## Features

✅ **User Authentication** - Role-based access (Student, Alumni, Admin)
✅ **AI Matching Engine** - Intelligent alumni-student pairing (60% skills + 40% interests)
✅ **Mentorship Platform** - 1-on-1 session booking and tracking
✅ **Career Intelligence** - AI-powered trends, salary insights, career paths
✅ **Job Marketplace** - Alumni job postings and referral system
✅ **Alumni Verification** - Admin-controlled verification workflow
✅ **Interview Prep** - Experience sharing and interview insights
✅ **Admin Dashboard** - Analytics, user management, verification review

## Quick Start

### Install & Setup
```bash
npm install
```

Create `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run
```bash
npm run dev
```

Application: http://localhost:5173

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, Vite
- **Backend**: Supabase (PostgreSQL, Auth)
- **AI/ML**: Custom matching algorithm, trend analysis

## Project Structure

```
src/
├── components/    # UI components
├── pages/         # Dashboard pages
├── contexts/      # Authentication
└── lib/           # Supabase client
```

## User Roles

**Student**: Browse matches, request mentorship, view opportunities, request referrals
**Alumni**: Post jobs, provide mentorship & referrals, share interview experiences
**Admin**: Approve verifications, manage users, view analytics

## Build & Deploy

```bash
npm run build
```

Deploy `dist/` to Vercel, Netlify, or any static host.

## Database Tables (Supabase)

Core: profiles, user_details, skills, user_skills, interests
AI: ai_matches, career_trends
Engagement: mentorship_sessions, job_postings, referral_requests
Communication: messages, notifications

## Features in Detail

### AI Matching
- 60% skill overlap scoring
- 40% interest alignment
- Real-time match generation
- Explainable recommendations

### Security
- Row Level Security (RLS)
- JWT authentication
- Role-based access control
- Data validation on both client & server

### Performance
- Database indexes
- Optimized bundle size
- Lazy loading components
- Efficient data fetching

## Support

For issues, check browser console for error messages or review inline code documentation.

---

**Built with React, TypeScript, and Supabase for the future of alumni engagement**
