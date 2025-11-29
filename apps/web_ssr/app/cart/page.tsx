import type { Metadata } from 'next';
import { CartPage as CartPageComponent } from '../../components/CartPage';
import { settingsService } from '../../services/settings.service';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsService.getAll();
    const siteName = settings.store_name || 'Minimart';
    const title = `Shopping Cart - ${siteName}`;
    const description = 'Review your shopping cart and proceed to checkout';

    return {
      title,
      description,
      robots: {
        index: false, // Don't index cart page
        follow: false,
      },
    };
  } catch (error) {
    console.error('Failed to load settings for metadata:', error);
    return {
      title: 'Shopping Cart - Minimart',
      description: 'Review your shopping cart and proceed to checkout',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function CartPage() {
  return <CartPageComponent />;
}
