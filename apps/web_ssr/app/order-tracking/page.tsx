import type { Metadata } from 'next';
import { OrderTrackingPage as OrderTrackingPageComponent } from '../../components/OrderTrackingPage';

export const metadata: Metadata = {
  title: 'Order Tracking - Minimart',
  description: 'Track your order status',
};

export default function OrderTrackingPage() {
  return <OrderTrackingPageComponent />;
}
