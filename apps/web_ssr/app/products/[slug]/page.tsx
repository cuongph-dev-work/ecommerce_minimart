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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const productUrl = `${siteUrl}/products/${slug}`;
    const productImage = product.images?.[0] || product.image || '';
    const price = product.discount 
      ? product.price * (1 - product.discount / 100)
      : product.price;
    const description = product.description || `Buy ${product.name} at the best price. ${product.brand ? `Brand: ${product.brand}.` : ''} ${product.stock > 0 ? 'In stock now!' : 'Check availability.'}`;
    
    return {
      title: `${product.name} - Minimart`,
      description,
      keywords: [product.name, product.brand, product.category?.name || 'product'].filter(Boolean),
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title: product.name,
        description,
        type: 'website',
        url: productUrl,
        siteName: 'Minimart',
        images: productImage ? [
          {
            url: productImage,
            width: 1200,
            height: 630,
            alt: product.name,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: productImage ? [productImage] : [],
      },
      other: {
        'product:price:amount': price.toString(),
        'product:price:currency': 'VND',
        'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
        'product:condition': 'new',
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Fetch product for structured data
  let product = null;
  try {
    product = await productsService.getBySlug(slug);
  } catch (error) {
    console.error('Failed to load product for structured data:', error);
  }

  // Generate JSON-LD structured data for SEO
  const structuredData = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.images || [product.image].filter(Boolean),
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${slug}`,
      priceCurrency: 'VND',
      price: product.discount 
        ? (product.price * (1 - product.discount / 100)).toString()
        : product.price.toString(),
      availability: product.stock > 0 
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewCount?.toString() || '0',
    } : undefined,
  } : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <ProductDetailPageComponent productSlug={slug} />
    </>
  );
}
