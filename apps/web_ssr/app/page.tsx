import type { Metadata } from 'next';
import { HomePage as HomePageComponent } from '../components/HomePage';
import { settingsService } from '../services/settings.service';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsService.getAll();
    const siteName = settings.store_name || 'Minimart';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const title = settings.store_name 
      ? `Home - ${settings.store_name}`
      : 'Home - Minimart';
    const description = settings.store_description || 'Your trusted minimart for quality products';
    const logo = settings.store_logo || '';

    return {
      title,
      description,
      alternates: {
        canonical: siteUrl,
      },
      openGraph: {
        title,
        description,
        type: 'website',
        siteName,
        url: siteUrl,
        images: logo ? [
          {
            url: logo,
            width: 1200,
            height: 630,
            alt: siteName,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: logo ? [logo] : [],
      },
    };
  } catch (error) {
    console.error('Failed to load settings for metadata:', error);
    return {
      title: 'Home - Minimart',
      description: 'Your trusted minimart for quality products',
    };
  }
}

export default function HomePage() {
  return <HomePageComponent />;
}
