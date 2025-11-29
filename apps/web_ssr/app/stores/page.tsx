import type { Metadata } from 'next';
import { StoresPage as StoresPageComponent } from '../../components/StoresPage';
import { settingsService } from '../../services/settings.service';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsService.getAll();
    const siteName = settings.store_name || 'Minimart';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const title = `Our Stores - ${siteName}`;
    const description = settings.store_address 
      ? `Visit our store at ${settings.store_address}. Find a store near you.`
      : 'Find a store near you. Visit us in person for the best shopping experience.';
    const logo = settings.store_logo || '';

    return {
      title,
      description,
      keywords: ['stores', 'locations', 'find store', 'visit us'],
      alternates: {
        canonical: `${siteUrl}/stores`,
      },
      openGraph: {
        title,
        description,
        type: 'website',
        siteName,
        url: `${siteUrl}/stores`,
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
      title: 'Our Stores - Minimart',
      description: 'Find a store near you',
    };
  }
}

export default function StoresPage() {
  return <StoresPageComponent />;
}
