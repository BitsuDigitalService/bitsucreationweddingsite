-- ============================================================
-- VIDEO MIGRATION — Gallery Videos (Reels Feature)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create gallery_videos table
CREATE TABLE IF NOT EXISTS public.gallery_videos (
  id           UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  url          TEXT                     NOT NULL,
  storage_path TEXT                     NOT NULL,
  category     TEXT                     NOT NULL DEFAULT 'general',
  file_name    TEXT                     NOT NULL,
  thumbnail_url TEXT,
  title        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.gallery_videos ENABLE ROW LEVEL SECURITY;

-- 3. Public read — everyone can watch reels
CREATE POLICY "Public read gallery_videos"
  ON public.gallery_videos FOR SELECT USING (true);

-- 4. Admin write — all writes go through authenticated admin UI
--    (same open-write pattern used by gallery_photos for this wedding app)
CREATE POLICY "Admin write gallery_videos"
  ON public.gallery_videos FOR ALL USING (true) WITH CHECK (true);

-- 5. Update storage bucket to allow video MIME types
--    (Run this or do it via Supabase Dashboard → Storage → bag-management → Settings)
UPDATE storage.buckets
SET allowed_mime_types = array_append(
  COALESCE(allowed_mime_types, ARRAY[]::text[]),
  'video/mp4'
)
WHERE id = 'bag-management' AND NOT ('video/mp4' = ANY(COALESCE(allowed_mime_types, ARRAY[]::text[])));

UPDATE storage.buckets
SET allowed_mime_types = array_append(
  COALESCE(allowed_mime_types, ARRAY[]::text[]),
  'video/webm'
)
WHERE id = 'bag-management' AND NOT ('video/webm' = ANY(COALESCE(allowed_mime_types, ARRAY[]::text[])));

UPDATE storage.buckets
SET allowed_mime_types = array_append(
  COALESCE(allowed_mime_types, ARRAY[]::text[]),
  'video/quicktime'
)
WHERE id = 'bag-management' AND NOT ('video/quicktime' = ANY(COALESCE(allowed_mime_types, ARRAY[]::text[])));
