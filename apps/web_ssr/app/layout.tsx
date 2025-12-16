import './polyfills';
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
import '../styles/globals.css';
import '../index.css';

// Helper function to get SEO settings with defaults
async function getSEOSettings() {
  try {
    const settings = await settingsService.getAll();
    const storeName = settings.store_name;
    const storeDescription = settings.store_description;

    return {
      defaultTitle: settings.seo_default_title || storeName,
      titleTemplate: settings.seo_title_template || `%s | ${storeName}`,
      defaultDescription: settings.seo_default_description || storeDescription,
      keywords: settings.seo_keywords
        ? settings.seo_keywords.split(',').map(k => k.trim()).filter(Boolean)
        : ['minimart', 'ecommerce', 'online shopping', 'products'],
      author: settings.seo_author || storeName,
      creator: settings.seo_creator || storeName,
      publisher: settings.seo_publisher || storeName,
      twitterHandle: settings.seo_twitter_handle || '@minimart',
      googleVerification: settings.seo_google_verification || undefined,
    };
  } catch (error) {
    console.error('Failed to load SEO settings:', error);
    return {
      defaultTitle: 'Minimart',
      titleTemplate: '%s | Minimart',
      defaultDescription: 'Your trusted minimart for quality products',
      keywords: ['minimart', 'ecommerce', 'online shopping', 'products'],
      author: 'Minimart',
      creator: 'Minimart',
      publisher: 'Minimart',
      twitterHandle: '@minimart',
      googleVerification: undefined,
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSEOSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seoSettings.defaultTitle,
      template: seoSettings.titleTemplate,
    },
    description: seoSettings.defaultDescription,
    keywords: seoSettings.keywords,
    authors: [{ name: seoSettings.author }],
    creator: seoSettings.creator,
    publisher: seoSettings.publisher,
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
      siteName: seoSettings.defaultTitle,
    },
    twitter: {
      card: 'summary_large_image',
      creator: seoSettings.twitterHandle,
    },
    verification: seoSettings.googleVerification ? {
      google: seoSettings.googleVerification,
    } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Preload settings on server
  let preloadedSettings: Record<string, string> = {};
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
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-NC0DJ2H94Z" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NC0DJ2H94Z');
            `,
          }}
        />
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
