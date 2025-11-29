import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProductsPage as ProductsPageComponent } from '../components/ProductsPage';
import { useSettings } from '../context/SettingsContext';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const siteName = settings.store_name;
  
  const getTitle = () => {
    if (search) return t('meta.products.title_search', { query: search });
    if (category) return t('meta.products.title_category', { category });
    return t('meta.products.title_default');
  };
  
  const getDescription = () => {
    if (search) return t('meta.products.description_search', { query: search });
    if (category) return t('meta.products.description_category', { category });
    return t('meta.products.description_default');
  };
  
  const keywords = `${t('meta.products.keywords')}, ${category || ''}, ${search || ''}`;
  
  const canonicalUrl = category || search 
    ? `${SITE_URL}/products${category ? `?category=${category}` : ''}${search ? `?search=${search}` : ''}`
    : `${SITE_URL}/products`;

  return (
    <>
      <Helmet>
        <title>{getTitle()}</title>
        <meta name="description" content={getDescription()} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph */}
        <meta property="og:title" content={getTitle()} />
        <meta property="og:description" content={getDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={getTitle()} />
        <meta name="twitter:description" content={getDescription()} />
        
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <ProductsPageComponent />
    </>
  );
}
