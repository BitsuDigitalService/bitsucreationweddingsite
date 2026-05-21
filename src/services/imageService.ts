import { getSupabase } from '../lib/supabase';

const BUCKET = 'bag-management';
const GALLERY_ROOT = 'gallery';

export interface GalleryImage {
  id?: string;
  name: string;
  url: string;
  folder: string;
  path: string;
  created_at?: string;
}

// ─── Ensure bucket exists ─────────────────────────────────────────────────────
async function ensureBucket() {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b: any) => b.name === BUCKET);
    if (!exists) {
      await supabase.storage.createBucket(BUCKET, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      });
    }
  } catch (_) { /* ignored */ }
}

export const imageService = {

  // ─── Generic upload (couples / bags) ─────────────────────────────────────────
  async uploadImage(file: File, folder: string = 'general'): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    await ensureBucket();

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  },

  // ─── Browse uploaded images in a folder (for couple selector) ────────────────
  async getUploadedImages(folder: string = 'general'): Promise<string[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error || !data) return [];
      return data
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(f => {
          const { data: u } = supabase.storage.from(BUCKET).getPublicUrl(`${folder}/${f.name}`);
          return u.publicUrl;
        });
    } catch { return []; }
  },

  async getLatestUploadedImage(folders: string[]): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    for (const folder of folders) {
      try {
        const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error || !data || data.length === 0) continue;

        const file = data.find((item) => item.name !== '.emptyFolderPlaceholder');
        if (!file) continue;

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(`${folder}/${file.name}`);
        if (urlData?.publicUrl) return urlData.publicUrl;
      } catch {
        continue;
      }
    }

    return null;
  },

  // ─── Gallery: list folders from storage ──────────────────────────────────────
  async listGalleryFolders(): Promise<string[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    try {
      const { data } = await supabase.storage.from(BUCKET).list(GALLERY_ROOT, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' },
      });
      return (data || [])
        .filter((item: any) => item.id === null && item.name !== '.emptyFolderPlaceholder')
        .map((item: any) => item.name as string);
    } catch { return []; }
  },

  // ─── Gallery: fetch images from DB (with storage fallback) ───────────────────
  async getGalleryImages(category: string = 'all'): Promise<GalleryImage[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      let query = supabase
        .from('gallery_photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.file_name,
          url: row.url,
          folder: row.category,
          path: row.storage_path,
          created_at: row.created_at,
        }));
      }
    } catch (_) { /* fall through to storage */ }

    // Fallback: list from storage
    return this._getGalleryImagesFromStorage(category);
  },

  // ─── Storage fallback ─────────────────────────────────────────────────────────
  async _getGalleryImagesFromStorage(category: string = 'all'): Promise<GalleryImage[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const results: GalleryImage[] = [];

    const fetchFolder = async (folderName: string) => {
      const path = `${GALLERY_ROOT}/${folderName}`;
      const { data } = await supabase.storage.from(BUCKET).list(path, { limit: 200 });
      (data || [])
        .filter((f: any) => f.name !== '.emptyFolderPlaceholder' && f.metadata?.mimetype)
        .forEach((f: any) => {
          const filePath = `${path}/${f.name}`;
          const { data: u } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
          results.push({ name: f.name, url: u.publicUrl, folder: folderName, path: filePath });
        });
    };

    if (category === 'all') {
      const folders = await this.listGalleryFolders();
      await Promise.all(folders.map(fetchFolder));
    } else {
      await fetchFolder(category);
    }
    return results;
  },

  // ─── Gallery: upload image → storage + save metadata to DB ───────────────────
  async uploadGalleryImage(file: File, folder: string): Promise<GalleryImage | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    await ensureBucket();

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${GALLERY_ROOT}/${folder}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
    if (error) { console.error('Gallery upload error:', error); return null; }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Persist metadata to DB
    try {
      await supabase.from('gallery_photos').insert({
        url: publicUrl,
        storage_path: filePath,
        category: folder,
        file_name: fileName,
      });
    } catch (e) {
      console.warn('DB insert failed (table may not exist yet):', e);
    }

    return { name: fileName, url: publicUrl, folder, path: filePath };
  },

  // ─── Gallery: delete a single image (storage + DB) ────────────────────────────
  async deleteGalleryImage(path: string, id?: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    let storageDeleted = false;
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) {
        console.error('Storage delete error:', error);
      } else {
        storageDeleted = true;
      }
    } catch (error) {
      console.error('Storage delete exception:', error);
    }

    let dbDeleted = false;
    try {
      const query = supabase.from('gallery_photos').delete();
      const { error } = id
        ? await query.eq('id', id)
        : await query.eq('storage_path', path);

      if (error) {
        console.error('DB delete error:', error);
      } else {
        dbDeleted = true;
      }
    } catch (error) {
      console.error('DB delete exception:', error);
    }

    return storageDeleted || dbDeleted;
  },

  // ─── Gallery: delete entire folder (all images + DB rows + placeholder) ───────
  async deleteGalleryFolder(folderName: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const folderPath = `${GALLERY_ROOT}/${folderName}`;

    try {
      // List all files in the folder
      const { data: files } = await supabase.storage.from(BUCKET).list(folderPath, { limit: 500 });
      if (files && files.length > 0) {
        const paths = files.map((f: any) => `${folderPath}/${f.name}`);
        const { error: storageError } = await supabase.storage.from(BUCKET).remove(paths);
        if (storageError) {
          console.error('Folder storage delete error:', storageError);
        }
      }

      // Delete all DB rows for this category
      const { error: dbError } = await supabase.from('gallery_photos').delete().eq('category', folderName);
      if (dbError) {
        console.error('Folder DB delete error:', dbError);
      }

      return true;
    } catch (e) {
      console.error('Folder delete error:', e);
      return false;
    }
  },

  // ─── Gallery: create folder (placeholder) ────────────────────────────────────
  async createGalleryFolder(folderName: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;
    await ensureBucket();
    const placeholderPath = `${GALLERY_ROOT}/${folderName}/.emptyFolderPlaceholder`;
    const blob = new Blob([''], { type: 'text/plain' });
    const { error } = await supabase.storage.from(BUCKET).upload(placeholderPath, blob, { upsert: true });
    if (error) { console.error('Folder create error:', error); return false; }
    return true;
  },

  subscribeToGalleryChanges(onChange: () => void) {
    const supabase = getSupabase();
    if (!supabase) return null;

    const channelName = `gallery-photo-changes-${Math.random().toString(36).slice(2)}`;

    return supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery_photos' },
        () => onChange()
      )
      .subscribe();
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Gallery Videos (Reels)
// ─────────────────────────────────────────────────────────────────────────────

export interface GalleryVideo {
  id?: string;
  name: string;
  url: string;
  folder: string;
  path: string;
  thumbnailUrl?: string;
  title?: string;
  created_at?: string;
}

const VIDEO_ROOT = 'gallery/videos';
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB (Supabase free tier limit)

/** Capture the first video frame as a base64 JPEG thumbnail (client-side). */
export async function captureVideoThumbnail(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    video.addEventListener('loadeddata', () => {
      video.currentTime = 0.5; // seek 0.5s in for a better frame
    });

    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 360;
        canvas.height = video.videoHeight || 640;
        const ctx = canvas.getContext('2d');
        if (!ctx) { cleanup(); resolve(null); return; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        cleanup();
        resolve(dataUrl);
      } catch {
        cleanup();
        resolve(null);
      }
    });

    video.addEventListener('error', () => { cleanup(); resolve(null); });

    // Timeout safety
    setTimeout(() => { cleanup(); resolve(null); }, 8000);
  });
}

export const videoService = {

  /** Upload a video file + auto-captured thumbnail → storage + DB. */
  async uploadGalleryVideo(
    file: File,
    folder: string,
    title?: string,
  ): Promise<GalleryVideo | null> {
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      console.error('Video exceeds 50 MB limit');
      return null;
    }

    const supabase = getSupabase();
    if (!supabase) return null;
    await ensureBucket();

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${VIDEO_ROOT}/${folder}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) { console.error('Video upload error:', error); return null; }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Capture thumbnail client-side
    let thumbnailUrl: string | undefined;
    try {
      const dataUrl = await captureVideoThumbnail(file);
      if (dataUrl) {
        // Upload thumbnail as JPEG
        const thumbRes = await fetch(dataUrl);
        const thumbBlob = await thumbRes.blob();
        const thumbPath = `${VIDEO_ROOT}/${folder}/thumb_${fileName.replace(/\.\w+$/, '')}.jpg`;
        const { error: thumbErr } = await supabase.storage
          .from(BUCKET)
          .upload(thumbPath, thumbBlob, { contentType: 'image/jpeg', upsert: false });
        if (!thumbErr) {
          const { data: tUrl } = supabase.storage.from(BUCKET).getPublicUrl(thumbPath);
          thumbnailUrl = tUrl.publicUrl;
        }
      }
    } catch (e) {
      console.warn('Thumbnail capture failed (non-fatal):', e);
    }

    // Persist to DB
    try {
      await supabase.from('gallery_videos').insert({
        url: publicUrl,
        storage_path: filePath,
        category: folder,
        file_name: fileName,
        thumbnail_url: thumbnailUrl ?? null,
        title: title ?? null,
      });
    } catch (e) {
      console.warn('gallery_videos DB insert failed (run VIDEO_MIGRATION.sql):', e);
    }

    return {
      name: fileName,
      url: publicUrl,
      folder,
      path: filePath,
      thumbnailUrl,
      title,
    };
  },

  /** Fetch all videos (optionally filtered by folder). */
  async getGalleryVideos(folder: string = 'all'): Promise<GalleryVideo[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      let query = supabase
        .from('gallery_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (folder !== 'all') {
        query = query.eq('category', folder);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.file_name,
          url: row.url,
          folder: row.category,
          path: row.storage_path,
          thumbnailUrl: row.thumbnail_url,
          title: row.title,
          created_at: row.created_at,
        }));
      }
    } catch (_) { /* ignored */ }

    return [];
  },

  /** Delete a video from storage + DB. */
  async deleteGalleryVideo(path: string, id?: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    // Also remove thumbnail if stored in the same bucket
    const thumbPath = path.replace(/(\.\w+)$/, '').replace(/([^/]+)$/, 'thumb_$1') + '.jpg';
    try {
      await supabase.storage.from(BUCKET).remove([path, thumbPath]);
    } catch (_) { /* ignore */ }

    try {
      const query = supabase.from('gallery_videos').delete();
      const { error } = id
        ? await query.eq('id', id)
        : await query.eq('storage_path', path);
      if (error) console.error('Video DB delete error:', error);
      else return true;
    } catch (e) {
      console.error('Video delete exception:', e);
    }

    return false;
  },

  /** Real-time subscription to gallery_videos table changes. */
  subscribeToVideoChanges(onChange: () => void) {
    const supabase = getSupabase();
    if (!supabase) return null;

    const channelName = `gallery-video-changes-${Math.random().toString(36).slice(2)}`;

    return supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery_videos' },
        () => onChange(),
      )
      .subscribe();
  },
};
