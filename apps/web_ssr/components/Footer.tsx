'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Send, ChevronDown } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { sanitizeUrl, sanitizeEmail, sanitizeImageUrl } from '../lib/security';

// Collapsible Section Component for Mobile
function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 sm:border-none">
      {/* Mobile: Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 sm:hidden text-left"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <ChevronDown 
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {/* Desktop: Always visible title */}
      <h3 className="hidden sm:block mb-4 font-semibold text-gray-900">{title}</h3>
      
      {/* Content */}
      <div className={`overflow-hidden transition-all duration-200 sm:block ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'} sm:max-h-none sm:pb-0`}>
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-16">
        {/* Mobile: Compact Brand Section */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3" suppressHydrationWarning>
              {isMounted && settings.store_logo ? (() => {
                const logoUrl = sanitizeImageUrl(settings.store_logo);
                return logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={settings.store_name || 'Logo'}
                    className="w-10 h-10 object-contain rounded-lg"
                  />
                ) : null;
              })() : (
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {isMounted && settings.store_name ? settings.store_name.charAt(0) : 'M'}
                  </span>
                </div>
              )}
              <span className="font-semibold text-gray-900" suppressHydrationWarning>
                {isMounted && settings.store_name ? settings.store_name : 'Mini Mart'}
              </span>
            </div>
            
            {/* Social Icons - Inline on Mobile */}
            <div className="flex gap-2" suppressHydrationWarning>
              {isMounted && (() => {
                const facebookUrl = sanitizeUrl(settings.facebook_link);
                return facebookUrl ? (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
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
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
                  >
                    <Instagram className="h-4 w-4 text-pink-600" />
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
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
                  >
                    <Send className="h-4 w-4 text-blue-600" />
                  </a>
                ) : null;
              })()}
            </div>
          </div>
        </div>

        {/* Desktop Grid / Mobile Collapsible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 sm:gap-12">
          {/* Brand - Desktop Only (full version) */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 mb-4" suppressHydrationWarning>
              {isMounted && settings.store_logo ? (() => {
                const logoUrl = sanitizeImageUrl(settings.store_logo);
                return logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={settings.store_name || 'Logo'}
                    className="w-14 h-14 object-contain rounded-lg"
                  />
                ) : null;
              })() : (
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">
                    {isMounted && settings.store_name ? settings.store_name.charAt(0) : 'M'}
                  </span>
                </div>
              )}
              <span suppressHydrationWarning>
                {isMounted && settings.store_name ? settings.store_name : 'Mini Mart'}
              </span>
            </div>
            <p className="text-gray-600 mb-4" suppressHydrationWarning>
              {isMounted && settings.store_description ? settings.store_description : ''}
            </p>
            <div className="flex gap-3" suppressHydrationWarning>
              {isMounted && (() => {
                const facebookUrl = sanitizeUrl(settings.facebook_link);
                return facebookUrl ? (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white hover:bg-blue-50 flex items-center justify-center transition-colors"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
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
                    className="w-9 h-9 rounded-full bg-white hover:bg-pink-50 flex items-center justify-center transition-colors"
                  >
                    <Instagram className="h-4 w-4 text-pink-600" />
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
                    className="w-9 h-9 rounded-full bg-white hover:bg-blue-50 flex items-center justify-center transition-colors"
                  >
                    <Send className="h-4 w-4 text-blue-600" />
                  </a>
                ) : null;
              })()}
            </div>
          </div>

          {/* Quick Links - Collapsible on Mobile */}
          <CollapsibleSection title={t('footer.quick_links')}>
            <ul className="space-y-2">
              {[
                { label: t('common.home'), path: '/' },
                { label: t('common.products'), path: '/products' },
                { label: t('common.stores'), path: '/stores' },
                { label: t('common.contact'), path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          {/* Contact - Collapsible on Mobile */}
          <CollapsibleSection title={t('footer.contact')}>
            <ul className="space-y-2 sm:space-y-3" suppressHydrationWarning>
              {isMounted && settings.store_phone && (
                <li className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                  <Phone className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>{settings.store_phone}</span>
                </li>
              )}
              {isMounted && (() => {
                const email = sanitizeEmail(settings.store_email);
                return email ? (
                  <li className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <Mail className="h-4 w-4 shrink-0 text-blue-600" />
                    <a href={`mailto:${email}`} className="hover:text-blue-600 transition-colors truncate">
                      {email}
                    </a>
                  </li>
                ) : null;
              })()}
              {isMounted && settings.store_address && (
                <li className="flex items-start gap-2 text-gray-600 text-sm sm:text-base">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
                  <span className="line-clamp-2">{settings.store_address}</span>
                </li>
              )}
            </ul>
          </CollapsibleSection>

          {/* Support - Collapsible on Mobile */}
          <CollapsibleSection title={t('footer.support')}>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors text-sm sm:text-base">
                  {t('footer.warranty_policy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors text-sm sm:text-base">
                  {t('footer.return_policy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors text-sm sm:text-base">
                  {t('footer.shopping_guide')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors text-sm sm:text-base">
                  {t('footer.faq')}
                </a>
              </li>
            </ul>
          </CollapsibleSection>
        </div>

        {/* Copyright */}
        <div className="mt-6 sm:mt-12 pt-4 sm:pt-8 border-t text-center text-gray-500 text-xs sm:text-sm">
          <p suppressHydrationWarning>
            &copy; 2025 {isMounted && settings.store_name ? settings.store_name : 'Mini Mart'}. {t('footer.all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}