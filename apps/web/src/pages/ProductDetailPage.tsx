import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductDetailPage as ProductDetailComponent } from '../components/ProductDetailPage';
import { productsService } from '../services/products.service';
import type { Product } from '../types';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com';

export default function ProductDetailPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const siteName = t('meta.site_name');

  useEffect(() => {
    if (!slug) return;
    
    const abortController = new AbortController();
    
    productsService.getBySlug(slug, abortController.signal)
      .then((data) => {
        if (!abortController.signal.aborted) {
          setProduct(data);
        }
      })
      .catch(() => {
        // Silent fail, component will handle error
      });

    return () => abortController.abort();
  }, [slug]);

  if (!product) {
    return (
      <>
        <Helmet>
          <title>{t('products.title')} - {siteName}</title>
          <meta name="description" content={t('meta.product_detail.description_default', { name: '' })} />
        </Helmet>
        <ProductDetailComponent productSlug={slug!} />
      </>
    );
  }

  const productName = product.name;
  const productDescription = product.description 
    ? product.description.replace(/<[^>]*>/g, '').substring(0, 160)
    : t('meta.product_detail.description_default', { name: productName });
  const productImage = product.images?.[0] || product.image || '';
  const productPrice = product.discount 
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;
  const formattedPrice = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(productPrice);
  const canonicalUrl = `${SITE_URL}/products/${slug}`;
  const categoryName = typeof product.category === 'string' 
    ? product.category 
    : product.category?.name || '';

  const title = t('meta.product_detail.title', { 
    name: productName, 
    price: formattedPrice 
  });
  const keywords = t('meta.product_detail.keywords', {
    name: productName,
    category: categoryName,
    brand: product.brand || ''
  });

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={productDescription} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${productName} - ${siteName}`} />
        <meta property="og:description" content={productDescription} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        {productImage && <meta property="og:image" content={productImage} />}
        <meta property="og:image:alt" content={productName} />
        <meta property="og:site_name" content={siteName} />
        <meta property="product:price:amount" content={productPrice.toString()} />
        <meta property="product:price:currency" content="VND" />
        {product.brand && <meta property="product:brand" content={product.brand} />}
        {categoryName && <meta property="product:category" content={categoryName} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${productName} - ${siteName}`} />
        <meta name="twitter:description" content={productDescription} />
        {productImage && <meta name="twitter:image" content={productImage} />}
        
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <ProductDetailComponent productId={id!} />
    </>
  );
}
