import { Helmet } from 'react-helmet-async';
import { ContactPage as ContactPageComponent } from '../components/ContactPage';

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Liên hệ - Ecommerce Store</title>
        <meta 
          name="description" 
          content="Liên hệ với chúng tôi qua email, điện thoại hoặc đến trực tiếp cửa hàng. Hỗ trợ 24/7." 
        />
        <meta property="og:title" content="Liên hệ - Ecommerce Store" />
        <meta property="og:description" content="Liên hệ với chúng tôi qua email, điện thoại hoặc đến trực tiếp cửa hàng" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://yourdomain.com/contact" />
      </Helmet>
      <ContactPageComponent />
    </>
  );
}
