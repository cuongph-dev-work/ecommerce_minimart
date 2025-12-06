'use client';

import { useState, useEffect } from 'react';
import { Facebook, Instagram, Send, Youtube } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { sanitizeUrl, sanitizeImageUrl } from '../lib/security';

export function Footer() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Row 1: Logo + Name + Description */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-3 sm:gap-6">
          {/* Logo + Name */}
          <div className="flex items-center gap-3 shrink-0" suppressHydrationWarning>
            {isMounted && settings.store_logo ? (() => {
              const logoUrl = sanitizeImageUrl(settings.store_logo);
              return logoUrl ? (
                <img
                  src={logoUrl}
                  alt={settings.store_name || 'Logo'}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              ) : null;
            })() : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {isMounted && settings.store_name ? settings.store_name.charAt(0) : 'M'}
                </span>
              </div>
            )}
            <span className="font-semibold text-gray-800 text-lg" suppressHydrationWarning>
              {isMounted && settings.store_name ? settings.store_name : 'Mini Mart'}
            </span>
          </div>

          {/* Description */}
          {isMounted && settings.store_description && (
            <p className="text-gray-500 text-sm sm:text-base" suppressHydrationWarning>
              {settings.store_description}
            </p>
          )}
        </div>

        {/* Row 2: Social Icons */}
        <div className="flex justify-center sm:!justify-start gap-3 mt-5" suppressHydrationWarning>
          {isMounted && (() => {
            const facebookUrl = sanitizeUrl(settings.facebook_link);
            return facebookUrl ? (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#1877F2' }}
              >
                <Facebook className="h-5 w-5 text-white" />
              </a>
            ) : null;
          })()}
          {isMounted && (() => {
            const instagramUrl = sanitizeUrl(settings.instagram_link);
            return instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
            ) : null;
          })()}
          {isMounted && (() => {
            const telegramUrl = sanitizeUrl(settings.telegram_link);
            return telegramUrl ? (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#0088cc' }}
              >
                <Send className="h-5 w-5 text-white" />
              </a>
            ) : null;
          })()}
          {isMounted && (() => {
            const youtubeUrl = sanitizeUrl(settings.youtube_link);
            return youtubeUrl ? (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#FF0000' }}
              >
                <Youtube className="h-5 w-5 text-white" />
              </a>
            ) : null;
          })()}
        </div>

        {/* Copyright - Centered */}
        <div className="mt-6 pt-4 border-t text-center text-gray-400 text-xs sm:text-sm">
          <p suppressHydrationWarning>
            &copy; 2025 {isMounted && settings.store_name ? settings.store_name : 'Mini Mart'}. {t('footer.all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}