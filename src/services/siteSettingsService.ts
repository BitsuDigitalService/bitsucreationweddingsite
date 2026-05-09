import { getSupabase } from '../lib/supabase';
import { COUPLE_1, COUPLE_2 } from '../constants';
import { imageService } from './imageService';

export interface SiteSettings {
  heroImage: string;
  showCountdown: boolean;
  weddingDate: string;
  couple1Image: string;
  couple2Image: string;
}

const SETTINGS_ROW_ID = 'default';

export const defaultSiteSettings: SiteSettings = {
  heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000',
  showCountdown: true,
  weddingDate: '2026-05-14T22:00',
  couple1Image: COUPLE_1.imageUrl,
  couple2Image: COUPLE_2.imageUrl,
};

function mapRowToSettings(row: any): SiteSettings {
  const cleanUrl = (url: any, fallback: string) => {
    if (!url || typeof url !== 'string' || url.startsWith('blob:')) return fallback;
    return url;
  };

  return {
    heroImage: cleanUrl(row?.hero_image, defaultSiteSettings.heroImage),
    showCountdown: typeof row?.show_countdown === 'boolean' ? row.show_countdown : defaultSiteSettings.showCountdown,
    weddingDate: typeof row?.wedding_date === 'string' && row.wedding_date ? row.wedding_date : defaultSiteSettings.weddingDate,
    couple1Image: cleanUrl(row?.couple1_image, defaultSiteSettings.couple1Image),
    couple2Image: cleanUrl(row?.couple2_image, defaultSiteSettings.couple2Image),
  };
}

export const siteSettingsService = {
  async getSiteSettings(): Promise<SiteSettings> {
    const supabase = getSupabase();
    if (!supabase) return defaultSiteSettings;

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', SETTINGS_ROW_ID)
        .maybeSingle();

      if (error) throw error;

      const settings = data ? mapRowToSettings(data) : { ...defaultSiteSettings };

      if (!data?.couple1_image) {
        settings.couple1Image =
          (await imageService.getLatestUploadedImage(['couples/couple1', 'couples'])) || settings.couple1Image;
      }

      if (!data?.couple2_image) {
        settings.couple2Image =
          (await imageService.getLatestUploadedImage(['couples/couple2', 'couples'])) || settings.couple2Image;
      }

      return settings;
    } catch (error) {
      console.warn('Failed to load site settings:', error);
      return defaultSiteSettings;
    }
  },

  async updateSiteSettings(patch: Partial<SiteSettings>): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    const row: Record<string, unknown> = { id: SETTINGS_ROW_ID };
    if (patch.heroImage !== undefined) row.hero_image = patch.heroImage;
    if (patch.showCountdown !== undefined) row.show_countdown = patch.showCountdown;
    if (patch.weddingDate !== undefined) row.wedding_date = patch.weddingDate;
    if (patch.couple1Image !== undefined) row.couple1_image = patch.couple1Image;
    if (patch.couple2Image !== undefined) row.couple2_image = patch.couple2Image;

    const { error } = await supabase.from('site_settings').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Failed to update site settings:', error);
      throw error;
    }
  },

  subscribeToSiteSettings(onChange: () => void) {
    const supabase = getSupabase();
    if (!supabase) return null;

    return supabase
      .channel('site-settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => onChange()
      )
      .subscribe();
  },
};
