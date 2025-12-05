'use client';

import { useState, useEffect } from 'react';
import { Facebook, Instagram, Send } from 'lucide-react';
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
    <footer className="bg-white border-t mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Main Content */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-8">
          {/* Left: Logo + Name */}
          <div className="flex items-center gap-3" suppressHydrationWarning>
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

          {/* Right: Address + Phone */}
          <div className="text-gray-600 text-sm sm:text-base sm:text-right" suppressHydrationWarning>
            {isMounted && settings.store_address && (
              <p className="mb-1">{settings.store_address}</p>
            )}
            {isMounted && settings.store_phone && (
              <p>{settings.store_phone}</p>
            )}
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex gap-3 mt-5" suppressHydrationWarning>
          {isMounted && (() => {
            const facebookUrl = sanitizeUrl(settings.facebook_link);
            return facebookUrl ? (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
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
                className="w-9 h-9 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
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
                className="w-9 h-9 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <Send className="h-5 w-5 text-white" />
              </a>
            ) : null;
          })()}
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t text-gray-400 text-xs sm:text-sm">
          <p suppressHydrationWarning>
            &copy; 2025 {isMounted && settings.store_name ? settings.store_name : 'Mini Mart'}. {t('footer.all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}