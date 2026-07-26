-- ============================================
-- Maaz LMS - Supabase Migration SQL
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  image_url TEXT NOT NULL DEFAULT '',
  enrolled_courses TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_title TEXT NOT NULL,
  course_description TEXT NOT NULL,
  course_thumbnail TEXT DEFAULT '',
  course_price NUMERIC NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  discount NUMERIC NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  course_content JSONB DEFAULT '[]',
  course_ratings JSONB DEFAULT '[]',
  educator TEXT NOT NULL REFERENCES users(id),
  enrolled_students TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. COURSE_PROGRESS TABLE
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  lecture_completed JSONB DEFAULT '[]',
  UNIQUE(user_id, course_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_courses_educator ON courses(educator);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_purchases_course ON purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course ON course_progress(course_id);

-- RLS - Disable for server-side access (using service_role key)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service_role (server-side)
DROP POLICY IF EXISTS "Service role full access" ON users;
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON courses;
CREATE POLICY "Service role full access" ON courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON purchases;
CREATE POLICY "Service role full access" ON purchases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON course_progress;
CREATE POLICY "Service role full access" ON course_progress FOR ALL USING (true) WITH CHECK (true);

-- Add role column if it doesn't exist (for existing databases)
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;
