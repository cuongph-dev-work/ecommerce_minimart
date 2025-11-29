import type { Metadata } from 'next';
import { ContactPage as ContactPageComponent } from '../../components/ContactPage';
import { settingsService } from '../../services/settings.service';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsService.getAll();
    const siteName = settings.store_name || 'Minimart';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const title = settings.seo_contact_title || `Contact Us - ${siteName}`;
    const description = settings.seo_contact_description || settings.store_description || 'Get in touch with us for any questions or concerns. We are here to help!';
    const keywords = settings.seo_contact_keywords 
      ? settings.seo_contact_keywords.split(',').map(k => k.trim()).filter(Boolean)
      : ['contact', 'support', 'customer service', 'help'];
    const logo = settings.store_logo || '';

    return {
      title,
      description,
      keywords,
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
