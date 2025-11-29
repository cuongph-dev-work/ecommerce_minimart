import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ContactPage as ContactPageComponent } from '../components/ContactPage';
import { useSettings } from '../context/SettingsContext';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com';

export default function ContactPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const siteName = settings.store_name;
  const title = t('meta.contact.title');
  const description = t('meta.contact.description');
  const keywords = t('meta.contact.keywords');

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
        <meta property="og:url" content={`${SITE_URL}/contact`} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        <link rel="canonical" href={`${SITE_URL}/contact`} />
      </Helmet>
      <ContactPageComponent />
    </>
  );
}
