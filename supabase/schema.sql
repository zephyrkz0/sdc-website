-- ==========================================================
-- SDC PLATFORM - SUPABASE DATABASE SCHEMA (1-CLICK SETUP)
-- IDEMPOTENT: Safe to run repeatedly on new or existing DBs
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

-- Migration columns for existing databases:
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT '';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS semester TEXT DEFAULT '';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS hours_contributed INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_members_email ON public.members (email);
CREATE INDEX IF NOT EXISTS idx_members_username ON public.members (username);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members (user_id);

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
    session_type TEXT NOT NULL DEFAULT 'LEARNING_SESSION',
    track TEXT NOT NULL DEFAULT 'BEGINNER',
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
    track TEXT NOT NULL,
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

-- Ensure cascade deletion constraint on tickets.event_id even on existing tables
DO $$ 
BEGIN
    ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_event_id_fkey;
    ALTER TABLE public.tickets ADD CONSTRAINT tickets_event_id_fkey 
        FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_tickets_user_email ON public.tickets (user_email);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON public.tickets (ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets (event_id);

-- ==========================================================
-- 6. GALLERY ITEMS TABLE (Photo Archive)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    photographer TEXT,
    aspect_ratio TEXT NOT NULL DEFAULT '16:9',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 7. SECURITY FUNCTIONS (is_admin helper)
-- Must be declared before storage and table RLS policies
-- ==========================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.members
    WHERE user_id = auth.uid()
      AND UPPER(role) IN ('ADMIN', 'SUPER_ADMIN', 'MASTER_ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================
-- 8. STORAGE BUCKETS (Avatars & Gallery Uploads)
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('club-assets', 'club-assets', true),
    ('gallery-uploads', 'gallery-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies
DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public Read Club Assets" ON storage.objects;
CREATE POLICY "Public Read Club Assets" ON storage.objects FOR SELECT USING (bucket_id = 'club-assets');

DROP POLICY IF EXISTS "Public Read Gallery" ON storage.objects;
CREATE POLICY "Public Read Gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-uploads');

DROP POLICY IF EXISTS "Allow Upload Avatars" ON storage.objects;
CREATE POLICY "Allow Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Allow Upload Club Assets" ON storage.objects;
CREATE POLICY "Allow Upload Club Assets" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'club-assets' AND public.is_admin()
);

DROP POLICY IF EXISTS "Allow Upload Gallery" ON storage.objects;
CREATE POLICY "Allow Upload Gallery" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'gallery-uploads' AND public.is_admin()
);

-- ==========================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES & SECURITY TRIGGERS
-- ==========================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Trigger to prevent non-admins from escalating roles on INSERT or UPDATE
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS TRIGGER 
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- On insert, if caller is not an admin, force role to 'MEMBER'
    IF NOT public.is_admin() THEN
      NEW.role := 'MEMBER';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
      IF NOT public.is_admin() THEN
        -- Retain existing role if caller is not an admin
        NEW.role := OLD.role;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_change ON public.members;
CREATE TRIGGER trg_prevent_role_change
BEFORE INSERT OR UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.prevent_unauthorized_role_change();

-- Public Read Access for catalog and display data
DROP POLICY IF EXISTS "Public Read Members" ON public.members;
CREATE POLICY "Public Read Members" ON public.members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Events" ON public.events;
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Past Events" ON public.past_events;
CREATE POLICY "Public Read Past Events" ON public.past_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Gallery" ON public.gallery_items;
CREATE POLICY "Public Read Gallery" ON public.gallery_items FOR SELECT USING (true);

-- Scoped ticket reading: only pass owner or administrators
DROP POLICY IF EXISTS "Read Tickets" ON public.tickets;
CREATE POLICY "Read Tickets" ON public.tickets FOR SELECT USING (
  (auth.uid() IS NOT NULL AND (auth.uid()::text = user_id OR user_email = (auth.jwt()->>'email'))) OR 
  public.is_admin()
);

-- Members Write Policies (Self-management & Admin)
DROP POLICY IF EXISTS "Insert Member Record" ON public.members;
CREATE POLICY "Insert Member Record" ON public.members FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR public.is_admin()
);

DROP POLICY IF EXISTS "Update Member Record" ON public.members;
CREATE POLICY "Update Member Record" ON public.members FOR UPDATE USING (
  auth.uid() = user_id OR public.is_admin()
) WITH CHECK (
  auth.uid() = user_id OR public.is_admin()
);

DROP POLICY IF EXISTS "Delete Member Record" ON public.members;
CREATE POLICY "Delete Member Record" ON public.members FOR DELETE USING (
  auth.uid() = user_id OR public.is_admin()
);

-- Events & Past Events Write Policies (Admin Only)
DROP POLICY IF EXISTS "Admin Insert Events" ON public.events;
CREATE POLICY "Admin Insert Events" ON public.events FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Events" ON public.events;
CREATE POLICY "Admin Update Events" ON public.events FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Events" ON public.events;
CREATE POLICY "Admin Delete Events" ON public.events FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Insert Past Events" ON public.past_events;
CREATE POLICY "Admin Insert Past Events" ON public.past_events FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Past Events" ON public.past_events;
CREATE POLICY "Admin Update Past Events" ON public.past_events FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Past Events" ON public.past_events;
CREATE POLICY "Admin Delete Past Events" ON public.past_events FOR DELETE USING (public.is_admin());

-- Gallery Write Policies (Admin Only)
DROP POLICY IF EXISTS "Admin Insert Gallery" ON public.gallery_items;
CREATE POLICY "Admin Insert Gallery" ON public.gallery_items FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Gallery" ON public.gallery_items;
CREATE POLICY "Admin Update Gallery" ON public.gallery_items FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Gallery" ON public.gallery_items;
CREATE POLICY "Admin Delete Gallery" ON public.gallery_items FOR DELETE USING (public.is_admin());

-- Tickets Write Policies (Attendee RSVP + Admin Scanner Validation)
DROP POLICY IF EXISTS "Create Ticket Pass" ON public.tickets;
CREATE POLICY "Create Ticket Pass" ON public.tickets FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND (auth.uid()::text = user_id OR user_email = (auth.jwt()->>'email'))) OR 
  public.is_admin()
);

DROP POLICY IF EXISTS "Admin Update Ticket Admission" ON public.tickets;
CREATE POLICY "Admin Update Ticket Admission" ON public.tickets FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Delete Ticket Pass" ON public.tickets;
CREATE POLICY "Delete Ticket Pass" ON public.tickets FOR DELETE USING (
  user_email = (auth.jwt()->>'email') OR 
  user_id = auth.uid()::text OR 
  public.is_admin()
);

-- ==========================================================
-- 9. RPC FUNCTIONS (RSVP Counter, Role Management, Account Deletion)
-- ==========================================================

-- Secure Role Assignment RPC
CREATE OR REPLACE FUNCTION public.set_member_role(target_member_id UUID, target_role TEXT)
RETURNS BOOLEAN 
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can update member roles.';
  END IF;

  UPDATE public.members
  SET role = target_role
  WHERE id = target_member_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment RSVP count when a new pass is generated
CREATE OR REPLACE FUNCTION public.increment_rsvp(event_id UUID)
RETURNS VOID 
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to RSVP.';
  END IF;
  UPDATE public.events
  SET rsvp_count = rsvp_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement RSVP count when a pass is cancelled (floor at 0)
CREATE OR REPLACE FUNCTION public.decrement_rsvp(event_id UUID)
RETURNS VOID 
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to cancel RSVP.';
  END IF;
  UPDATE public.events
  SET rsvp_count = GREATEST(rsvp_count - 1, 0)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete Account Deletion RPC (Deletes from members, tickets, and auth.users)
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS BOOLEAN 
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.members WHERE user_id = current_user_id;
  DELETE FROM public.tickets WHERE user_id = current_user_id::text OR user_email = (SELECT email FROM auth.users WHERE id = current_user_id);
  DELETE FROM auth.users WHERE id = current_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
