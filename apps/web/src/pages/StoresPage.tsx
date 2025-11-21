import { Helmet } from 'react-helmet-async';
import { StoresPage as StoresPageComponent } from '../components/StoresPage';

export default function StoresPage() {
  return (
    <>
      <Helmet>
        <title>Cửa hàng - Ecommerce Store</title>
        <meta 
          name="description" 
          content="Tìm cửa hàng gần bạn. Hệ thống cửa hàng trên toàn quốc với địa chỉ và giờ mở cửa." 
        />
        <meta property="og:title" content="Cửa hàng - Ecommerce Store" />
        <meta property="og:description" content="Tìm cửa hàng gần bạn" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://yourdomain.com/stores" />
      </Helmet>
      <StoresPageComponent />
    </>
  );
}
