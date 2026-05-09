import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Couple, EventDetail, GalleryItem } from '../types';
import { COUPLE_1, COUPLE_2, EVENTS, GALLERY } from '../constants';
import { getSupabase } from '../lib/supabase';
import { defaultSiteSettings, siteSettingsService } from '../services/siteSettingsService';

interface AppState {
  heroImage: string;
  showCountdown: boolean;
  weddingDate: string;
  gallery: GalleryItem[];
  events: EventDetail[];
  couples: {
    couple1: Couple;
    couple2: Couple;
  };
}

interface AppContextType {
  state: AppState;
  updateHeroImage: (url: string) => void;
  toggleCountdown: (enabled: boolean) => void;
  updateWeddingDate: (weddingDate: string) => void;
  addGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (index: number) => void;
  updateCoupleImage: (coupleId: 'couple1' | 'couple2', url: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    heroImage: defaultSiteSettings.heroImage,
    showCountdown: defaultSiteSettings.showCountdown,
    weddingDate: defaultSiteSettings.weddingDate,
    gallery: GALLERY,
    events: EVENTS,
    couples: {
      couple1: COUPLE_1,
      couple2: COUPLE_2,
    }
  });

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const settings = await siteSettingsService.getSiteSettings();
      if (!isMounted) return;

      setState(prev => ({
        ...prev,
        heroImage: settings.heroImage,
        showCountdown: settings.showCountdown,
        weddingDate: settings.weddingDate,
        couples: {
          couple1: { ...prev.couples.couple1, imageUrl: settings.couple1Image },
          couple2: { ...prev.couples.couple2, imageUrl: settings.couple2Image },
        },
      }));
    };

    loadSettings();

    const channel = siteSettingsService.subscribeToSiteSettings(loadSettings);

    return () => {
      isMounted = false;
      const supabase = getSupabase();
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const updateHeroImage = (url: string) => {
    setState(prev => ({ ...prev, heroImage: url }));
    void siteSettingsService.updateSiteSettings({ heroImage: url });
  };

  const toggleCountdown = (enabled: boolean) => {
    setState(prev => ({ ...prev, showCountdown: enabled }));
    void siteSettingsService.updateSiteSettings({ showCountdown: enabled });
  };

  const updateWeddingDate = (weddingDate: string) => {
    setState(prev => ({ ...prev, weddingDate }));
    void siteSettingsService.updateSiteSettings({ weddingDate });
  };

  const addGalleryItem = (item: GalleryItem) => {
    setState(prev => ({ ...prev, gallery: [item, ...prev.gallery] }));
  };

  const deleteGalleryItem = (index: number) => {
    setState(prev => ({ 
      ...prev, 
      gallery: prev.gallery.filter((_, i) => i !== index) 
    }));
  };

  const updateCoupleImage = (coupleId: 'couple1' | 'couple2', url: string) => {
    setState(prev => ({
      ...prev,
      couples: {
        ...prev.couples,
        [coupleId]: {
          ...prev.couples[coupleId],
          imageUrl: url
        }
      }
    }));

    void siteSettingsService.updateSiteSettings({
      [coupleId === 'couple1' ? 'couple1Image' : 'couple2Image']: url,
    });
  };

  return (
    <AppContext.Provider value={{ state, updateHeroImage, toggleCountdown, updateWeddingDate, addGalleryItem, deleteGalleryItem, updateCoupleImage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
