import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { HomePage as HomePageComponent } from '../components/HomePage';
import { useSettings } from '../context/SettingsContext';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const siteName = settings.store_name || t('meta.site_name');
  const title = settings.store_name 
    ? `${t('meta.home.title')} - ${settings.store_name}`
    : t('meta.home.title');
  const description = settings.store_description || t('meta.home.description');
  const keywords = t('meta.home.keywords');
  const locale = i18n.language === 'vi' ? 'vi_VN' : 'en_US';
  const alternateLocale = i18n.language === 'vi' ? 'en_US' : 'vi_VN';

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
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content={locale} />
        <meta property="og:locale:alternate" content={alternateLocale} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        <link rel="canonical" href={`${SITE_URL}/`} />
      </Helmet>
      <HomePageComponent />
    </>
  );
}
