-- ============================================
-- ClimbingHub Indonesia — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Custom ENUM types
CREATE TYPE route_discipline AS ENUM ('sport', 'multipitch', 'bouldering');
CREATE TYPE user_role AS ENUM ('guest', 'registered', 'gym_admin', 'super_admin');

-- 2. Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL DEFAULT 'registered',
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  handle TEXT UNIQUE,
  avatar TEXT,
  grade_max TEXT,
  ascents_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Gyms table
CREATE TABLE gyms (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  slots_morning INTEGER NOT NULL DEFAULT 0,
  slots_afternoon INTEGER NOT NULL DEFAULT 0,
  slots_evening INTEGER NOT NULL DEFAULT 0,
  max_slots_morning INTEGER NOT NULL DEFAULT 20,
  max_slots_afternoon INTEGER NOT NULL DEFAULT 20,
  max_slots_evening INTEGER NOT NULL DEFAULT 25,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  price_per_session INTEGER NOT NULL DEFAULT 0,
  address TEXT NOT NULL DEFAULT '',
  route_setters TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Crag Regions table
CREATE TABLE crag_regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  sector_count INTEGER NOT NULL DEFAULT 0,
  problem_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Sectors table
CREATE TABLE sectors (
  id TEXT PRIMARY KEY,
  crag_id TEXT NOT NULL REFERENCES crag_regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Routes table (multi-discipline with JSONB)
CREATE TABLE routes (
  id TEXT PRIMARY KEY,
  sector_id TEXT NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  discipline route_discipline NOT NULL,
  grade TEXT NOT NULL,
  font_grade TEXT NOT NULL DEFAULT '',
  setter TEXT NOT NULL DEFAULT '',
  fa TEXT NOT NULL DEFAULT '',
  fa_date DATE,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  beta_video_url TEXT,
  access_info TEXT NOT NULL DEFAULT '',
  local_contact TEXT NOT NULL DEFAULT '',
  ascent_count INTEGER NOT NULL DEFAULT 0,
  grade_votes JSONB NOT NULL DEFAULT '[]',
  markers JSONB NOT NULL DEFAULT '[]',
  -- Sport climbing specific
  pitch_length TEXT,
  bolt_count INTEGER,
  anchor_type TEXT,
  -- Multi pitch specific
  total_pitches INTEGER,
  total_height TEXT,
  pitch_breakdown JSONB,
  descent_info TEXT,
  -- Bouldering specific
  pad_recommendation TEXT,
  landing_quality TEXT,
  start_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Communities table
CREATE TABLE communities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  member_count INTEGER NOT NULL DEFAULT 0,
  homebase TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  members JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Ascent Logs table
CREATE TABLE ascent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  grade_opinion TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_id TEXT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('morning', 'afternoon', 'evening')),
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_sectors_crag ON sectors(crag_id);
CREATE INDEX idx_routes_sector ON routes(sector_id);
CREATE INDEX idx_routes_discipline ON routes(discipline);
CREATE INDEX idx_ascent_logs_user ON ascent_logs(user_id);
CREATE INDEX idx_ascent_logs_route ON ascent_logs(route_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_gym ON bookings(gym_id);
CREATE INDEX idx_bookings_date ON bookings(date);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crag_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ascent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for content tables
CREATE POLICY "Public read gyms" ON gyms FOR SELECT USING (true);
CREATE POLICY "Public read crag_regions" ON crag_regions FOR SELECT USING (true);
CREATE POLICY "Public read sectors" ON sectors FOR SELECT USING (true);
CREATE POLICY "Public read routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Public read communities" ON communities FOR SELECT USING (true);
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);

-- Allow anon inserts for seeding (can tighten later)
CREATE POLICY "Allow insert gyms" ON gyms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert crag_regions" ON crag_regions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert sectors" ON sectors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert routes" ON routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert communities" ON communities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert ascent_logs" ON ascent_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Allow updates for gym slots and route ascents
CREATE POLICY "Allow update gyms" ON gyms FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow update routes" ON routes FOR UPDATE USING (true) WITH CHECK (true);
