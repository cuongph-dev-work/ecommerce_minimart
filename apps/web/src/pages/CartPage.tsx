import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CartPage as CartPageComponent } from '../components/CartPage';
import { useSettings } from '../context/SettingsContext';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com';

export default function CartPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const siteName = settings.store_name;
  const title = t('meta.cart.title');
  const description = t('meta.cart.description');

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/cart`} />
        <meta property="og:site_name" content={siteName} />
        
        <link rel="canonical" href={`${SITE_URL}/cart`} />
      </Helmet>
      <CartPageComponent />
    </>
  );
}
