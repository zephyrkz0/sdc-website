-- ==========================================================
-- SDC PLATFORM - SUPABASE DATABASE SCHEMA (1-CLICK SETUP)
-- ==========================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- 2. MEMBERS TABLE (Strictly Specified Parameters)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    username TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER', -- 'SUPER_ADMIN', 'ADMIN', 'MEMBER', or role title
    track TEXT NOT NULL DEFAULT 'Web Development',
    branch TEXT DEFAULT '',
    semester TEXT DEFAULT '',
    avatarUrl TEXT,
    bio TEXT DEFAULT '',
    skills TEXT[] DEFAULT '{}',
    projects JSONB DEFAULT '[]'::jsonb,
    hours_contributed INTEGER DEFAULT 0,
    github_url TEXT,
    linkedin_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'DEPLOYED', 'STANDBY'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration for existing databases:
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT '';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS semester TEXT DEFAULT '';

-- Make kashinath.r2017@gmail.com Super Admin:
UPDATE public.members SET role = 'SUPER_ADMIN' WHERE email = 'kashinath.r2017@gmail.com';

-- ==========================================================
-- 3. EVENTS TABLE (Upcoming Sessions & Workshops)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    day TEXT NOT NULL,
    time_start TEXT NOT NULL,
    time_end TEXT NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'LEARNING_SESSION', -- 'LEARNING_SESSION', 'WORKSHOP', 'HACKATHON', 'CODE', 'DESIGN', 'AI', 'CYBER', 'EVENT'
    track TEXT NOT NULL DEFAULT 'BEGINNER', -- 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'
    location TEXT NOT NULL,
    room_number TEXT,
    virtual_stream_url TEXT,
    instructor_name TEXT NOT NULL,
    instructor_username TEXT,
    instructor_avatar TEXT,
    curriculum TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    hardware_reqs TEXT,
    max_capacity INTEGER NOT NULL DEFAULT 50,
    rsvp_count INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    banner_url TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 4. PAST EVENTS TABLE (Archive)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.past_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    session_type TEXT NOT NULL,
    track TEXT NOT NULL, -- 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'
    attendees_count INTEGER NOT NULL DEFAULT 0,
    instructor_name TEXT,
    highlight_summary TEXT,
    banner_url TEXT,
    resources_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 5. TICKETS TABLE (RSVP Passes & Gate Scanner)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    venue TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'STANDARD_ACCESS',
    qr_payload TEXT NOT NULL,
    is_admitted BOOLEAN NOT NULL DEFAULT false,
    admitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 6. GALLERY ITEMS TABLE (Photo Archive)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'HACKATHONS', 'WORKSHOPS', '3D_ART', 'SUMMITS', 'ROBOTICS'
    image_url TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    photographer TEXT,
    aspect_ratio TEXT NOT NULL DEFAULT '16:9',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 7. STORAGE BUCKETS (Avatars & Gallery Uploads)
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('gallery-uploads', 'gallery-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies (Public Read Access)
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Read Gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-uploads');

CREATE POLICY "Allow Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Allow Upload Gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-uploads');

-- ==========================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Public Read Access for all display data
CREATE POLICY "Public Read Members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public Read Past Events" ON public.past_events FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON public.gallery_items FOR SELECT USING (true);
CREATE POLICY "Public Read Tickets" ON public.tickets FOR SELECT USING (true);

-- Allow insertions/updates
CREATE POLICY "Allow Member Writes" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Event Writes" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Past Event Writes" ON public.past_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Ticket Writes" ON public.tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Gallery Writes" ON public.gallery_items FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- 9. RPC FUNCTIONS (RSVP Counter Management)
-- ==========================================================

-- Increment RSVP count when a new pass is generated
CREATE OR REPLACE FUNCTION public.increment_rsvp(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events
  SET rsvp_count = rsvp_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement RSVP count when a pass is cancelled (floor at 0)
CREATE OR REPLACE FUNCTION public.decrement_rsvp(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events
  SET rsvp_count = GREATEST(rsvp_count - 1, 0)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;
