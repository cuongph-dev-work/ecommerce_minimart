'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

export function NotFoundPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const description = t('meta.not_found.description');

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          {description}
        </p>
        <Link 
          href="/" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('common.home')}
        </Link>
      </div>
    </div>
  );
}
