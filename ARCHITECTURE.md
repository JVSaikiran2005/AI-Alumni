# AlumniConnect AI - System Architecture

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [AI/ML Architecture](#aiml-architecture)
5. [Security Architecture](#security-architecture)
6. [Component Architecture](#component-architecture)
7. [Data Flow](#data-flow)

## Overview

AlumniConnect AI is built using a modern, scalable, serverless architecture leveraging Supabase as the backend infrastructure and React for the frontend.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          React 18 + TypeScript + Vite                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │  Student   │  │  Alumni    │  │   Admin    │    │  │
│  │  │ Dashboard  │  │ Dashboard  │  │ Dashboard  │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │   Supabase API   │
                   │   (REST/GraphQL) │
                   └────────┬────────┘
                            │
┌────────────────────────────┴──────────────────────────────┐
│                    Backend Layer (Supabase)               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐     │
│  │  PostgreSQL │  │    Auth     │  │    Edge      │     │
│  │  Database   │  │   Service   │  │  Functions   │     │
│  │     +RLS    │  │    (JWT)    │  │   (Deno)     │     │
│  └─────────────┘  └─────────────┘  └──────────────┘     │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            AI Services (Edge Functions)             │ │
│  │  ┌──────────────────┐  ┌──────────────────┐       │ │
│  │  │  AI Matching     │  │  Career Insights  │       │ │
│  │  │    Engine        │  │    Generator      │       │ │
│  │  └──────────────────┘  └──────────────────┘       │ │
│  └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

## Database Design

### Entity Relationship Diagram

```
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   profiles   │          │ user_details │          │    skills    │
├──────────────┤          ├──────────────┤          ├──────────────┤
│ id (PK)      │1───────1│ user_id (FK) │          │ id (PK)      │
│ email        │          │ institute    │          │ name         │
│ full_name    │          │ degree       │          │ category     │
│ user_role    │          │ company      │          └──────────────┘
│ is_verified  │          │ job_title    │                 │
└──────────────┘          └──────────────┘                 │
       │                                                    │
       │                                                    │
       │1                  ┌──────────────┐              M│
       ├──────────────────M│ user_skills  │M──────────────┤
       │                   ├──────────────┤                │
       │                   │ user_id (FK) │                │
       │                   │ skill_id (FK)│                │
       │                   │ proficiency  │                │
       │                   └──────────────┘                │
       │                                                    │
       │1                  ┌──────────────┐                │
       ├──────────────────M│  interests   │                │
       │                   ├──────────────┤                │
       │                   │ user_id (FK) │                │
       │                   │ domain       │                │
       │                   └──────────────┘                │
       │                                                    │
       │1        student   ┌──────────────┐                │
       ├──────────────────M│ ai_matches   │M───────────────┤
       │1        alumni    ├──────────────┤     alumni     │
       ├───────────────────│student_id(FK)│                │
       │                   │alumni_id (FK)│                │
       │                   │ match_score  │                │
       │                   │match_reasons │                │
       │                   └──────────────┘                │
       │                                                    │
       │1        student   ┌──────────────┐                │
       ├──────────────────M│ mentorship   │M───────────────┤
       │1        alumni    │  _sessions   │     alumni     │
       ├───────────────────├──────────────┤                │
       │                   │student_id(FK)│                │
       │                   │alumni_id (FK)│                │
       │                   │ status       │                │
       │                   │scheduled_at  │                │
       │                   └──────────────┘                │
       │                                                    │
       │1        posted_by ┌──────────────┐                │
       ├──────────────────M│job_postings  │                │
       │                   ├──────────────┤                │
       │                   │posted_by (FK)│                │
       │                   │ company      │                │
       │                   │ title        │                │
       │                   │req_skills    │                │
       │                   └──────────────┘                │
       │                          │                         │
       │                          │1                        │
       │                          │                         │
       │1        student          │M                        │
       ├──────────────────────────┼────────────────────────┤
       │                   ┌──────▼───────┐      alumni    │
       │                   │  referral    │M───────────────┤
       │                   │  _requests   │                │
       │                   ├──────────────┤                │
       │                   │student_id(FK)│                │
       │                   │alumni_id (FK)│                │
       │                   │job_post_id   │                │
       │                   └──────────────┘                │
       │                                                    │
       └────────────────────────────────────────────────────┘
```

### Key Database Features

1. **Normalized Schema**: Follows 3NF for data integrity
2. **Foreign Key Constraints**: Ensures referential integrity
3. **Indexes**: Optimized for frequent query patterns
4. **JSONB Fields**: Flexible storage for achievements, match reasons
5. **ENUM Types**: Type-safe status tracking
6. **Timestamps**: Automatic tracking of created_at/updated_at

## AI/ML Architecture

### Matching Algorithm Flow

```
┌──────────────────────────────────────────────────────────┐
│                Student Profile Analysis                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Skills   │  │ Interests  │  │ Education  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│              AI Matching Engine (Edge Function)          │
│                                                           │
│  1. Fetch all verified alumni profiles                   │
│  2. For each alumni:                                     │
│     a. Calculate skill overlap score (60% weight)        │
│     b. Calculate interest alignment (40% weight)         │
│     c. Compute final match score                         │
│  3. Filter matches above threshold (20%)                 │
│  4. Sort by match score (descending)                     │
│  5. Return top 10 matches with explanations              │
│                                                           │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│              Store Matches in Database                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ai_matches table with:                            │ │
│  │  - match_score                                     │ │
│  │  - matched_skills[]                                │ │
│  │  - matched_interests[]                             │ │
│  │  - match_reasons[]                                 │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Career Insights Generation

```
┌──────────────────────────────────────────────────────────┐
│            Data Collection & Analysis                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Job Posts  │  │User Skills │  │  Alumni    │        │
│  │            │  │            │  │ Companies  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│        Career Insights AI (Edge Function)                │
│                                                           │
│  1. Analyze skill demand from job postings               │
│  2. Calculate growth rates and trends                    │
│  3. Identify top hiring companies                        │
│  4. Generate personalized recommendations                │
│  5. Predict career paths based on current skills         │
│  6. Estimate salary ranges                               │
│                                                           │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│           Real-time Dashboard Visualization              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  Trending  │  │ Personalized│  │   Career   │        │
│  │   Skills   │  │  Insights   │  │   Paths    │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└──────────────────────────────────────────────────────────┘
```

## Security Architecture

### Authentication Flow

```
┌─────────┐              ┌─────────────┐              ┌──────────┐
│  User   │              │   Frontend  │              │ Supabase │
│         │              │             │              │   Auth   │
└────┬────┘              └──────┬──────┘              └────┬─────┘
     │                          │                          │
     │  1. Login Request        │                          │
     ├─────────────────────────>│                          │
     │                          │  2. Auth Request         │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │  3. JWT Token            │
     │                          │<─────────────────────────┤
     │  4. Redirect to          │                          │
     │     Dashboard            │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │  5. API Request          │                          │
     │     with JWT             │                          │
     ├─────────────────────────>│                          │
     │                          │  6. Validate JWT         │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │  7. User Info            │
     │                          │<─────────────────────────┤
     │  8. Protected Data       │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
```

### Row Level Security (RLS) Policies

```sql
-- Example: Students can only view their own matches
CREATE POLICY "Students view own matches"
  ON ai_matches FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Example: Alumni can only update their own profiles
CREATE POLICY "Alumni update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() AND user_role = 'alumni');

-- Example: Only admins can approve verifications
CREATE POLICY "Admins approve verifications"
  ON verification_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  ));
```

### Security Layers

1. **Network Layer**: HTTPS encryption for all communications
2. **Authentication Layer**: JWT-based authentication with Supabase
3. **Authorization Layer**: Role-based access control (RBAC)
4. **Database Layer**: Row Level Security (RLS) policies
5. **Application Layer**: Input validation and sanitization

## Component Architecture

### Frontend Component Hierarchy

```
App
├── AuthProvider (Context)
├── LandingPage
│   ├── Login
│   └── SignUp
│
└── Dashboards (Role-based)
    ├── StudentDashboard
    │   ├── DashboardLayout
    │   ├── ProfileSettings
    │   ├── AIMatches
    │   ├── MentorshipRequest
    │   ├── CareerInsights
    │   └── JobOpportunities
    │
    ├── AlumniDashboard
    │   ├── DashboardLayout
    │   ├── ProfileSettings
    │   ├── MenteeManagement
    │   ├── JobPostingForm
    │   └── ReferralRequests
    │
    └── AdminDashboard
        ├── DashboardLayout
        ├── VerificationPanel
        ├── UserManagement
        └── PlatformAnalytics
```

### State Management

```
┌─────────────────────────────────────────────────┐
│           Global State (Context API)            │
│                                                  │
│  AuthContext                                    │
│  ├── user: User | null                          │
│  ├── profile: Profile | null                    │
│  ├── loading: boolean                           │
│  ├── signIn()                                   │
│  ├── signUp()                                   │
│  ├── signOut()                                  │
│  └── updateProfile()                            │
│                                                  │
└─────────────────────────────────────────────────┘
           │
           │ Consumed by all components
           ▼
┌─────────────────────────────────────────────────┐
│         Component Local State (useState)        │
│                                                  │
│  Dashboard Components                           │
│  ├── activeTab: string                          │
│  ├── loading: boolean                           │
│  ├── data: any[]                                │
│  └── error: string | null                       │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Data Flow

### Typical User Interaction Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Action (e.g., "Generate AI Matches")
     ▼
┌────────────┐
│ React      │
│ Component  │
└────┬───────┘
     │
     │ 2. Call function
     ▼
┌────────────┐
│ Supabase   │
│ Client     │
└────┬───────┘
     │
     │ 3. HTTP Request with JWT
     ▼
┌────────────┐
│ Supabase   │
│ Edge Func  │
└────┬───────┘
     │
     │ 4. Query Database
     ▼
┌────────────┐
│ PostgreSQL │
│ + RLS      │
└────┬───────┘
     │
     │ 5. Return Data
     ▼
┌────────────┐
│ Edge Func  │
│ Processing │
└────┬───────┘
     │
     │ 6. AI Computation
     ▼
┌────────────┐
│ Store      │
│ Results    │
└────┬───────┘
     │
     │ 7. Return Response
     ▼
┌────────────┐
│ React      │
│ Component  │
└────┬───────┘
     │
     │ 8. Update UI
     ▼
┌─────────┐
│  User   │
│ Sees    │
│ Results │
└─────────┘
```

### Real-time Data Synchronization

```
┌──────────────────────────────────────────────────────┐
│         Component subscribes to changes              │
│                                                       │
│  useEffect(() => {                                   │
│    const subscription = supabase                     │
│      .from('mentorship_sessions')                    │
│      .on('INSERT', handleNewSession)                 │
│      .subscribe();                                   │
│                                                       │
│    return () => subscription.unsubscribe();          │
│  }, []);                                             │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Stateless architecture allows easy scaling
- Edge functions auto-scale with demand
- CDN distribution for static assets

### Database Optimization
- Proper indexing on frequently queried columns
- Connection pooling via Supabase
- Query optimization with selective fetching
- Pagination for large data sets

### Caching Strategy
- Browser caching for static assets
- React Query for API response caching
- Edge function response caching
- Database query result caching

## Monitoring & Observability

### Key Metrics to Track
- User authentication success rate
- AI matching generation time
- Database query performance
- Edge function execution time
- Error rates and types
- User engagement metrics

### Logging Strategy
- Console errors in development
- Structured logging in production
- Edge function execution logs
- Database query logs
- Authentication audit logs

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│              Production Environment                  │
│                                                      │
│  ┌──────────────┐        ┌──────────────┐         │
│  │    Vercel    │        │   Supabase   │         │
│  │   (Frontend) │◄──────►│   (Backend)  │         │
│  │              │        │              │         │
│  │  - React App │        │ - PostgreSQL │         │
│  │  - CDN       │        │ - Auth       │         │
│  │  - SSL       │        │ - Edge Funcs │         │
│  └──────────────┘        └──────────────┘         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

This architecture ensures:
- **Scalability**: Serverless architecture scales automatically
- **Security**: Multiple layers of security protection
- **Performance**: Optimized queries and caching strategies
- **Maintainability**: Clean separation of concerns
- **Reliability**: Robust error handling and data validation
