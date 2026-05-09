-- SUPABASE DATABASE AND STORAGE SCHEMA
-- PROJECT: Wedding Tag Management System

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- A. Tags/Bags management
CREATE TABLE IF NOT EXISTS public.bags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unique_tag_code TEXT UNIQUE NOT NULL,
    guest_name TEXT NOT NULL,
    phone_number TEXT,
    room_name TEXT,
    bag_image TEXT,
    bag_status TEXT DEFAULT 'active' CHECK (bag_status IN ('active', 'collected', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE,
    print_status TEXT DEFAULT 'pending' CHECK (print_status IN ('pending', 'printed')),
    scan_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMP WITH TIME ZONE
);

-- B. Design Templates
CREATE TABLE IF NOT EXISTS public.tag_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    front_url TEXT,
    back_url TEXT
);

-- C. Design Layouts (Canvas configurations)
CREATE TABLE IF NOT EXISTS public.tag_layouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    template_id UUID REFERENCES public.tag_templates(id) ON DELETE SET NULL,
    name TEXT UNIQUE NOT NULL,
    front_config JSONB DEFAULT '{}'::jsonb,
    back_config JSONB DEFAULT '{}'::jsonb
);

-- 3. STORAGE SETUP
-- Bucket Name: 'bag-management'
-- Public: Enabled

-- ENABLE STORAGE ACCESS (Supabase Storage Policies)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bag-management', 'bag-management', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for Public SELECT
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'bag-management' );

-- Policy for Public INSERT
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'bag-management' );

-- Policy for Public UPDATE (Optional)
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'bag-management' );

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- For prototyping/demo purposes, we'll allow public access. 
-- For production, replace 'true' with proper auth checks.

-- Bags Table Policies
ALTER TABLE public.bags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public All Access Bags" ON public.bags FOR ALL USING (true) WITH CHECK (true);

-- Tag Templates Policies
ALTER TABLE public.tag_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public All Access Templates" ON public.tag_templates FOR ALL USING (true) WITH CHECK (true);

-- Tag Layouts Policies
ALTER TABLE public.tag_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public All Access Layouts" ON public.tag_layouts FOR ALL USING (true) WITH CHECK (true);

-- TROUBLESHOOTING PERMISSION DENIED:
-- If you still see "Permission denied", it means the policies above were not applied correctly.
-- You can try disabling RLS entirely for a fast fix in a development environment:
-- ALTER TABLE public.bags DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tag_templates DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tag_layouts DISABLE ROW LEVEL SECURITY;

-- 5. FUNCTIONS & TRIGGERS
-- Auto-update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bags_updated_at BEFORE UPDATE ON public.bags
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tag_layouts_updated_at BEFORE UPDATE ON public.tag_layouts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
