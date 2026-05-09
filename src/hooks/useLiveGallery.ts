import { useCallback, useEffect, useState } from 'react';
import { imageService, type GalleryImage } from '../services/imageService';
import { getSupabase } from '../lib/supabase';

const DEFAULT_POLL_MS = 4000;

export function useLiveGallery(category: string = 'all', pollMs: number = DEFAULT_POLL_MS) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadImages = useCallback(async () => {
    const nextImages = await imageService.getGalleryImages(category);
    setImages(nextImages);
    setLoading(false);
  }, [category]);

  useEffect(() => {
    let active = true;

    const syncImages = async () => {
      if (!active) return;
      await loadImages();
    };

    void syncImages();

    const channel = imageService.subscribeToGalleryChanges(() => {
      void syncImages();
    });

    const intervalId = window.setInterval(() => {
      void syncImages();
    }, pollMs);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      const supabase = getSupabase();
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadImages, pollMs]);

  return { images, loading, reload: loadImages };
}
