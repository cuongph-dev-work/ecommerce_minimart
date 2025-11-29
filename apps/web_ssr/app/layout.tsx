import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SettingsProvider } from '../context/SettingsContext';
import { CartProvider } from '../context/CartContext';
import { RecentlyViewedProvider } from '../context/RecentlyViewedContext';
import { I18nProvider } from '../components/I18nProvider';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Toaster } from '../components/ui/sonner';
import { settingsService } from '../services/settings.service';
import '../index.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Minimart',
    template: '%s | Minimart',
  },
  description: 'Your trusted minimart for quality products',
  keywords: ['minimart', 'ecommerce', 'online shopping', 'products'],
  authors: [{ name: 'Minimart' }],
  creator: 'Minimart',
  publisher: 'Minimart',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Minimart',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@minimart',
  },
  verification: {
    // Add Google Search Console verification if needed
    // google: 'verification-code',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Preload settings on server
  let preloadedSettings = {};
  try {
    preloadedSettings = await settingsService.getAll();
  } catch (error) {
    console.error('Failed to preload settings:', error);
  }

  // Serialize settings for client
  const settingsScript = `window.__PRELOADED_SETTINGS__ = ${JSON.stringify(preloadedSettings)};`;

  // Generate Organization structured data for SEO
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: preloadedSettings.store_name || 'Minimart',
    description: preloadedSettings.store_description || 'Your trusted minimart for quality products',
    url: siteUrl,
    logo: preloadedSettings.store_logo || '',
    address: preloadedSettings.store_address ? {
      '@type': 'PostalAddress',
      streetAddress: preloadedSettings.store_address,
    } : undefined,
    telephone: preloadedSettings.store_phone || undefined,
    email: preloadedSettings.store_email || undefined,
  };

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: settingsScript }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
      </head>
      <body>
        <I18nProvider>
          <SettingsProvider>
            <CartProvider>
              <RecentlyViewedProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <Suspense fallback={null}>
                    <main className="flex-1">{children}</main>
                  </Suspense>
                  <Footer />
                  <Toaster position="top-right" />
                </div>
              </RecentlyViewedProvider>
            </CartProvider>
          </SettingsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
