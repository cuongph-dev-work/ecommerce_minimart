import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { OrderTrackingPage as OrderTrackingPageComponent } from '../components/OrderTrackingPage';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com';

export default function OrderTrackingPage() {
  const { t } = useTranslation();
  const siteName = t('meta.site_name');
  const title = t('meta.order_tracking.title');
  const description = t('meta.order_tracking.description');

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
        <meta property="og:url" content={`${SITE_URL}/order-tracking`} />
        <meta property="og:site_name" content={siteName} />
        
        <link rel="canonical" href={`${SITE_URL}/order-tracking`} />
      </Helmet>
      <OrderTrackingPageComponent />
    </>
  );
}

