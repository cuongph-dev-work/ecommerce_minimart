import type { Metadata } from 'next';
import { OrderTrackingPage as OrderTrackingPageComponent } from '../../components/OrderTrackingPage';
import { settingsService } from '../../services/settings.service';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsService.getAll();
    const siteName = settings.store_name || 'Minimart';
    const title = `Order Tracking - ${siteName}`;
    const description = 'Track your order status';

    return {
      title,
      description,
      robots: {
        index: false, // Don't index order tracking page
        follow: false,
      },
    };
  } catch (error) {
    console.error('Failed to load settings for metadata:', error);
    return {
      title: 'Order Tracking - Minimart',
      description: 'Track your order status',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function OrderTrackingPage() {
  return <OrderTrackingPageComponent />;
}
