-- Site settings table for hero and couple images.
-- Run this in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY,
  hero_image text,
  show_countdown boolean DEFAULT true,
  couple1_image text,
  couple2_image text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update site settings"
  ON public.site_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

INSERT INTO public.site_settings (id, show_countdown)
VALUES ('default', true)
ON CONFLICT (id) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_photos;
