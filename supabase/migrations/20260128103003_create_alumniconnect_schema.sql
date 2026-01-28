/*
  # AlumniConnect AI Platform - Complete Database Schema

  ## Overview
  Comprehensive database schema for AI-powered alumni networking platform with mentorship,
  career intelligence, and referral systems.

  ## New Tables

  ### Core Tables
  - `profiles` - Extended user profiles with role and verification status
  - `user_details` - Detailed information (education, career, skills)
  - `verification_requests` - Alumni verification workflow
  
  ### Matching & Mentorship
  - `skills` - Master skills list
  - `user_skills` - User-skill relationships
  - `interests` - Career interests and goals
  - `ai_matches` - AI-generated alumni-student matches
  - `mentorship_sessions` - Mentorship booking and tracking
  - `session_feedback` - Session ratings and reviews
  
  ### Opportunities
  - `job_postings` - Job and internship opportunities
  - `referral_requests` - Student referral requests
  - `referrals` - Alumni referrals tracking
  
  ### Knowledge Base
  - `interview_experiences` - Interview prep content
  - `experience_tags` - Tagging system
  
  ### Communication
  - `messages` - Direct messaging system
  - `notifications` - User notifications
  
  ### Analytics
  - `career_trends` - Industry trends data
  - `platform_analytics` - Usage analytics
  
  ## Security
  All tables have Row Level Security (RLS) enabled with appropriate policies
  for authenticated users based on roles and ownership.
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'alumni', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('requested', 'accepted', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE referral_status AS ENUM ('pending', 'in_progress', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  user_role user_role NOT NULL DEFAULT 'student',
  avatar_url text,
  bio text,
  is_verified boolean DEFAULT false,
  verification_badge boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User detailed information
CREATE TABLE IF NOT EXISTS user_details (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Education
  institute text,
  degree text,
  major text,
  graduation_year integer,
  
  -- Career (for alumni)
  current_company text,
  job_title text,
  experience_years integer,
  location text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  
  -- Preferences
  available_for_mentorship boolean DEFAULT false,
  can_provide_referrals boolean DEFAULT false,
  preferred_communication text[],
  
  -- Achievements
  achievements jsonb DEFAULT '[]'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Verification requests
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  institute_email text,
  document_url text,
  proof_type text NOT NULL,
  status verification_status DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- SKILLS & INTERESTS
-- ============================================================================

-- Master skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

-- User skills mapping
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  proficiency_level integer DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, skill_id)
);

-- Career interests
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  domain text NOT NULL,
  sub_domain text,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- AI MATCHING SYSTEM
-- ============================================================================

-- AI-powered matches
CREATE TABLE IF NOT EXISTS ai_matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  alumni_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_score decimal(3,2) CHECK (match_score BETWEEN 0 AND 1),
  match_reasons jsonb DEFAULT '[]'::jsonb,
  matched_skills text[],
  matched_interests text[],
  is_active boolean DEFAULT true,
  student_viewed boolean DEFAULT false,
  alumni_viewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(student_id, alumni_id)
);

-- ============================================================================
-- MENTORSHIP SYSTEM
-- ============================================================================

-- Mentorship sessions
CREATE TABLE IF NOT EXISTS mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  alumni_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status session_status DEFAULT 'requested',
  scheduled_at timestamptz,
  duration_minutes integer DEFAULT 30,
  meeting_link text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Session feedback
CREATE TABLE IF NOT EXISTS session_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES mentorship_sessions(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  feedback_text text,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(session_id, reviewer_id)
);

-- ============================================================================
-- OPPORTUNITIES & REFERRALS
-- ============================================================================

-- Job postings
CREATE TABLE IF NOT EXISTS job_postings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  job_type text NOT NULL,
  location text,
  salary_range text,
  required_skills text[],
  experience_required text,
  application_url text,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referral requests
CREATE TABLE IF NOT EXISTS referral_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_posting_id uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  alumni_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  resume_url text,
  status referral_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referrals given
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid REFERENCES referral_requests(id) ON DELETE CASCADE NOT NULL,
  alumni_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  referral_code text,
  guidance_notes text,
  success_probability decimal(3,2),
  outcome text,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(request_id)
);

-- ============================================================================
-- INTERVIEW KNOWLEDGE BASE
-- ============================================================================

-- Interview experiences
CREATE TABLE IF NOT EXISTS interview_experiences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  interview_date date,
  difficulty_level text,
  content text NOT NULL,
  rounds jsonb DEFAULT '[]'::jsonb,
  questions_asked text[],
  tips text[],
  outcome text,
  upvotes integer DEFAULT 0,
  views integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Experience tags
CREATE TABLE IF NOT EXISTS experience_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id uuid REFERENCES interview_experiences(id) ON DELETE CASCADE NOT NULL,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(experience_id, tag)
);

-- ============================================================================
-- COMMUNICATION
-- ============================================================================

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  related_to text,
  related_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- ANALYTICS & INTELLIGENCE
-- ============================================================================

-- Career trends
CREATE TABLE IF NOT EXISTS career_trends (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_name text NOT NULL,
  domain text NOT NULL,
  demand_score decimal(3,2),
  avg_salary integer,
  growth_rate decimal(5,2),
  top_companies text[],
  job_count integer DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Platform analytics
CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name text NOT NULL,
  metric_value decimal,
  metadata jsonb DEFAULT '{}'::jsonb,
  recorded_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_user_details_user_id ON user_details(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_matches_student ON ai_matches(student_id);
CREATE INDEX IF NOT EXISTS idx_matches_alumni ON ai_matches(alumni_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON mentorship_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_alumni ON mentorship_sessions(alumni_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON mentorship_sessions(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_interview_company ON interview_experiences(company);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- User details
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user details"
  ON user_details FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own details"
  ON user_details FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Verification requests
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification requests"
  ON verification_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'
  ));

CREATE POLICY "Users can create own verification requests"
  ON verification_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update verification requests"
  ON verification_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'
  ));

-- Skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skills"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage skills"
  ON skills FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'
  ));

-- User skills
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user skills"
  ON user_skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own skills"
  ON user_skills FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Interests
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all interests"
  ON interests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own interests"
  ON interests FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- AI matches
ALTER TABLE ai_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their matches"
  ON ai_matches FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR alumni_id = auth.uid());

CREATE POLICY "System can create matches"
  ON ai_matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their match views"
  ON ai_matches FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() OR alumni_id = auth.uid())
  WITH CHECK (student_id = auth.uid() OR alumni_id = auth.uid());

-- Mentorship sessions
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their sessions"
  ON mentorship_sessions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR alumni_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'
  ));

CREATE POLICY "Students can create session requests"
  ON mentorship_sessions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Participants can update sessions"
  ON mentorship_sessions FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() OR alumni_id = auth.uid())
  WITH CHECK (student_id = auth.uid() OR alumni_id = auth.uid());

-- Session feedback
ALTER TABLE session_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback for their sessions"
  ON session_feedback FOR SELECT
  TO authenticated
  USING (reviewer_id = auth.uid() OR reviewee_id = auth.uid());

CREATE POLICY "Users can create feedback for their sessions"
  ON session_feedback FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

-- Job postings
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active job postings"
  ON job_postings FOR SELECT
  TO authenticated
  USING (is_active = true OR posted_by = auth.uid());

CREATE POLICY "Alumni can create job postings"
  ON job_postings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('alumni', 'admin')
  ));

CREATE POLICY "Posters can update own postings"
  ON job_postings FOR UPDATE
  TO authenticated
  USING (posted_by = auth.uid())
  WITH CHECK (posted_by = auth.uid());

-- Referral requests
ALTER TABLE referral_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referral requests"
  ON referral_requests FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR alumni_id = auth.uid());

CREATE POLICY "Students can create referral requests"
  ON referral_requests FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Participants can update referral requests"
  ON referral_requests FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() OR alumni_id = auth.uid())
  WITH CHECK (student_id = auth.uid() OR alumni_id = auth.uid());

-- Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (alumni_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Alumni can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (alumni_id = auth.uid());

CREATE POLICY "Alumni can update their referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (alumni_id = auth.uid())
  WITH CHECK (alumni_id = auth.uid());

-- Interview experiences
ALTER TABLE interview_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published experiences"
  ON interview_experiences FOR SELECT
  TO authenticated
  USING (is_published = true OR author_id = auth.uid());

CREATE POLICY "Users can create experiences"
  ON interview_experiences FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own experiences"
  ON interview_experiences FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete own experiences"
  ON interview_experiences FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Experience tags
ALTER TABLE experience_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags"
  ON experience_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authors can manage tags for their experiences"
  ON experience_tags FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM interview_experiences 
    WHERE id = experience_id AND author_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM interview_experiences 
    WHERE id = experience_id AND author_id = auth.uid()
  ));

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Career trends
ALTER TABLE career_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view career trends"
  ON career_trends FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage trends"
  ON career_trends FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'
  ));

-- Platform analytics
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics"
  ON platform_analytics FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'
  ));

CREATE POLICY "System can insert analytics"
  ON platform_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);
