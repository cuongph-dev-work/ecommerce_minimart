import type { Metadata } from 'next';
import { HomePage as HomePageComponent } from '../components/HomePage';
import { settingsService } from '../services/settings.service';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsService.getAll();
    const siteName = settings.store_name || 'Minimart';
    const title = settings.store_name 
      ? `Home - ${settings.store_name}`
      : 'Home - Minimart';
    const description = settings.store_description || 'Your trusted minimart for quality products';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName,
        images: settings.store_logo ? [settings.store_logo] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: settings.store_logo ? [settings.store_logo] : [],
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
