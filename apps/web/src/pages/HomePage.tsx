import { Helmet } from 'react-helmet-async';
import { HomePage as HomePageComponent } from '../components/HomePage';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Trang chủ - Ecommerce Store</title>
        <meta 
          name="description" 
          content="Khám phá các sản phẩm hot nhất với giá tốt nhất tại Ecommerce Store. Flash sale hàng ngày, miễn phí vận chuyển." 
        />
        <meta property="og:title" content="Ecommerce Store - Trang chủ" />
        <meta property="og:description" content="Khám phá các sản phẩm hot nhất với giá tốt nhất" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" />
        <link rel="canonical" href="https://yourdomain.com/" />
      </Helmet>
      <HomePageComponent />
    </>
  );
}
