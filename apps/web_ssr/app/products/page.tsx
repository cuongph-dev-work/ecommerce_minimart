import type { Metadata } from 'next';
import { ProductsPage as ProductsPageComponent } from '../../components/ProductsPage';

export const metadata: Metadata = {
  title: 'Products - Minimart',
  description: 'Browse our wide selection of quality products',
};

export default function ProductsPage() {
  return <ProductsPageComponent />;
}
