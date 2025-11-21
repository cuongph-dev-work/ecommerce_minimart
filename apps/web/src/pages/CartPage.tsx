import { Helmet } from 'react-helmet-async';
import { CartPage as CartPageComponent } from '../components/CartPage';

export default function CartPage() {
  return (
    <>
      <Helmet>
        <title>Giỏ hàng - Ecommerce Store</title>
        <meta name="description" content="Xem giỏ hàng và thanh toán đơn hàng của bạn" />
        <meta property="og:title" content="Giỏ hàng - Ecommerce Store" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://yourdomain.com/cart" />
      </Helmet>
      <CartPageComponent />
    </>
  );
}
