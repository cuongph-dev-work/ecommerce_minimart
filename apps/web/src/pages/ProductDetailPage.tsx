import { Helmet } from 'react-helmet-async';
import { useParams, Navigate } from 'react-router-dom';
import { ProductDetailPage as ProductDetailComponent } from '../components/ProductDetailPage';
import { products } from '../data/products';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === id);

  if (!product) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{product.name} - Ecommerce Store</title>
        <meta name="description" content={product.description} />
        <meta name="keywords" content={`${product.category}, ${product.brand}, ${product.name}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://yourdomain.com/products/${id}`} />
        
        {/* Product specific */}
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content="VND" />
        <meta property="product:brand" content={product.brand} />
        <meta property="product:availability" content={product.stock > 0 ? 'in stock' : 'out of stock'} />
        
        <link rel="canonical" href={`https://yourdomain.com/products/${id}`} />
      </Helmet>
      <ProductDetailComponent productId={id!} />
    </>
  );
}
