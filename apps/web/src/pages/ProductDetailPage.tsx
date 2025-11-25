import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { ProductDetailPage as ProductDetailComponent } from '../components/ProductDetailPage';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <Helmet>
        <title>Product Details - Ecommerce Store</title>
      </Helmet>
      <ProductDetailComponent productId={id!} />
    </>
  );
}
