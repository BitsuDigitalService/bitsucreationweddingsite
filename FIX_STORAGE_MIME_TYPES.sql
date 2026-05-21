-- ====================================================================
-- SQL FIX FOR SUPABASE STORAGE UPLOAD ISSUE
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ====================================================================

-- Reset allowed_mime_types to NULL so the bucket allows all files (both images and videos)
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'bag-management';
