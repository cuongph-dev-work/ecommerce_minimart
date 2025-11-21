import { Helmet } from 'react-helmet-async';
import { ProductsPage as ProductsPageComponent } from '../components/ProductsPage';

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title>Sản phẩm - Ecommerce Store</title>
        <meta 
          name="description" 
          content="Danh sách tất cả sản phẩm với bộ lọc thông minh. Tìm kiếm theo danh mục, thương hiệu, giá cả." 
        />
        <meta property="og:title" content="Sản phẩm - Ecommerce Store" />
        <meta property="og:description" content="Danh sách tất cả sản phẩm với bộ lọc thông minh" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://yourdomain.com/products" />
      </Helmet>
      <ProductsPageComponent />
    </>
  );
}
