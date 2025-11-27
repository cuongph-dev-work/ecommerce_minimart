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
  const [settings, setSettings] = useState<Record<string, string>>(getPreloadedSettings());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        // Keep preloaded settings if API fails
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if we don't have preloaded settings
    if (Object.keys(settings).length === 0) {
      loadSettings();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

