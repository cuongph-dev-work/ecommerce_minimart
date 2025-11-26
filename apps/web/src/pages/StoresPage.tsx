import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { StoresPage as StoresPageComponent } from '../components/StoresPage';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com';

export default function StoresPage() {
  const { t } = useTranslation();
  const siteName = t('meta.site_name');
  const title = t('meta.stores.title');
  const description = t('meta.stores.description');
  const keywords = t('meta.stores.keywords');

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/stores`} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        <link rel="canonical" href={`${SITE_URL}/stores`} />
      </Helmet>
      <StoresPageComponent />
    </>
  );
}
