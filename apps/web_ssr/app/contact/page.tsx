import type { Metadata } from 'next';
import { ContactPage as ContactPageComponent } from '../../components/ContactPage';
import { settingsService } from '../../services/settings.service';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsService.getAll();
    const siteName = settings.store_name || 'Minimart';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const title = `Contact Us - ${siteName}`;
    const description = settings.store_description || 'Get in touch with us for any questions or concerns. We are here to help!';
    const logo = settings.store_logo || '';

    return {
      title,
      description,
      keywords: ['contact', 'support', 'customer service', 'help'],
      alternates: {
        canonical: `${siteUrl}/contact`,
      },
      openGraph: {
        title,
        description,
        type: 'website',
        siteName,
        url: `${siteUrl}/contact`,
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
      title: 'Contact Us - Minimart',
      description: 'Get in touch with us for any questions or concerns',
    };
  }
}

export default function ContactPage() {
  return <ContactPageComponent />;
}
