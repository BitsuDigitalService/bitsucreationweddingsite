import { useCallback, useEffect, useState } from 'react';
import { videoService, type GalleryVideo } from '../services/imageService';
import { getSupabase } from '../lib/supabase';

const DEFAULT_POLL_MS = 6000;

export function useLiveReels(folder: string = 'all', pollMs: number = DEFAULT_POLL_MS) {
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVideos = useCallback(async () => {
    const next = await videoService.getGalleryVideos(folder);
    setVideos(next);
    setLoading(false);
  }, [folder]);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      if (!active) return;
      await loadVideos();
    };

    void sync();

    const channel = videoService.subscribeToVideoChanges(() => {
      void sync();
    });

    const intervalId = window.setInterval(() => {
      void sync();
    }, pollMs);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      const supabase = getSupabase();
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadVideos, pollMs]);

  return { videos, loading, reload: loadVideos };
}
