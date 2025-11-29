import type { Metadata } from 'next';
import { ProductsPage as ProductsPageComponent } from '../../components/ProductsPage';
import { settingsService } from '../../services/settings.service';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsService.getAll();
    const siteName = settings.store_name || 'Minimart';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const title = `Products - ${siteName}`;
    const description = 'Browse our wide selection of quality products at the best prices';
    const logo = settings.store_logo || '';

    return {
      title,
      description,
      keywords: ['products', 'shopping', 'ecommerce', 'online store'],
      alternates: {
        canonical: `${siteUrl}/products`,
      },
      openGraph: {
        title,
        description,
        type: 'website',
        siteName,
        url: `${siteUrl}/products`,
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
      title: 'Products - Minimart',
      description: 'Browse our wide selection of quality products',
    };
  }
}

export default function ProductsPage() {
  return <ProductsPageComponent />;
}
