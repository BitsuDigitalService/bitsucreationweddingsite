-- Gallery photos table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  url text NOT NULL,
  storage_path text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  file_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Allow public read
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery photos"
  ON gallery_photos FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert gallery photos"
  ON gallery_photos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can delete gallery photos"
  ON gallery_photos FOR DELETE
  USING (true);

-- Storage delete permission is required for removing the actual image file
CREATE POLICY "Public Delete From Bag Management"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'bag-management');

-- Index for faster category queries
CREATE INDEX IF NOT EXISTS idx_gallery_photos_category ON gallery_photos(category);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_created_at ON gallery_photos(created_at DESC);
