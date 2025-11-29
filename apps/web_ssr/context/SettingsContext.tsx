'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService } from '../services/settings.service';

interface SettingsContextType {
  settings: Record<string, string>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  isLoading: true,
});

// Get preloaded settings from window if available
const getPreloadedSettings = (): Record<string, string> => {
  if (typeof window !== 'undefined' && (window as any).__PRELOADED_SETTINGS__) {
    return (window as any).__PRELOADED_SETTINGS__;
  }
  return {};
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Get preloaded settings immediately (works on both server and client)
  const preloadedSettings = getPreloadedSettings();
  const [settings, setSettings] = useState<Record<string, string>>(preloadedSettings);
  const [isLoading, setIsLoading] = useState(Object.keys(preloadedSettings).length === 0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // On client, always use preloaded settings from server (injected in layout.tsx)
    // This ensures we don't make unnecessary API calls since settings are already fetched on server
    if (typeof window !== 'undefined' && (window as any).__PRELOADED_SETTINGS__) {
      const preloaded = (window as any).__PRELOADED_SETTINGS__;
      if (Object.keys(preloaded).length > 0) {
        setSettings(preloaded);
        setIsLoading(false);
        return;
      }
    }

    // Fallback: Only fetch if preloaded settings are missing (shouldn't happen in normal flow)
    // This is a safety net in case server-side preload failed
    if (Object.keys(settings).length === 0) {
      const loadSettings = async () => {
        try {
          const data = await settingsService.getAll();
          setSettings(data);
          // Update window object for other scripts
          if (typeof window !== 'undefined') {
            (window as any).__PRELOADED_SETTINGS__ = data;
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadSettings();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Update favicon when settings change
  useEffect(() => {
    if (settings.store_logo && typeof document !== 'undefined') {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => link.remove());
      
      // Create new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = settings.store_logo;
      document.head.appendChild(link);
      
      // Also add apple-touch-icon for better mobile support
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = settings.store_logo;
      document.head.appendChild(appleLink);
    }
  }, [settings.store_logo]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

