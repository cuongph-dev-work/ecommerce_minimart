import type { Metadata } from 'next';
import { ProductDetailPage as ProductDetailPageComponent } from '../../../components/ProductDetailPage';
import { productsService } from '../../../services/products.service';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await productsService.getBySlug(slug);
    
    return {
      title: `${product.name} - Minimart`,
      description: product.description || `Buy ${product.name} at the best price`,
      openGraph: {
        title: product.name,
        description: product.description || '',
        images: product.images?.length ? [product.images[0]] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || '',
        images: product.images?.length ? [product.images[0]] : [],
      },
    };
  } catch (error) {
    console.error('Failed to load product for metadata:', error);
    return {
      title: 'Product - Minimart',
      description: 'View product details',
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailPageComponent productSlug={slug} />;
}
