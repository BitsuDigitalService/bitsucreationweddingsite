-- Run this in Supabase SQL Editor if gallery delete is not removing files.
-- It allows delete access for files inside the public bag-management bucket.

CREATE POLICY "Public Delete From Bag Management"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'bag-management');
