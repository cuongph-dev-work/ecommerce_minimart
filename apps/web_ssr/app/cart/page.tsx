import type { Metadata } from 'next';
import { CartPage as CartPageComponent } from '../../components/CartPage';

export const metadata: Metadata = {
  title: 'Shopping Cart - Minimart',
  description: 'Review your shopping cart and proceed to checkout',
};

export default function CartPage() {
  return <CartPageComponent />;
}
