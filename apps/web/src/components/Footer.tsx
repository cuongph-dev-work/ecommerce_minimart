import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Send } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const { settings } = useSettings();

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {settings.store_logo ? (
                <img
                  src={settings.store_logo}
                  alt={settings.store_name || 'Logo'}
                  className="w-10 h-10 object-contain rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">{settings.store_name?.charAt(0)}</span>
                </div>
              )}
              <span>{settings.store_name}</span>
            </div>
            <p className="text-gray-600 mb-4">
              {settings.store_description }
            </p>
            <div className="flex gap-3">
              {settings.facebook_link && (
                <a
                  href={settings.facebook_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white hover:bg-blue-50 flex items-center justify-center transition-colors"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                </a>
              )}
              {settings.instagram_link && (
                <a
                  href={settings.instagram_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white hover:bg-pink-50 flex items-center justify-center transition-colors"
                >
                  <Instagram className="h-4 w-4 text-pink-600" />
                </a>
              )}
              {settings.telegram_link && (
                <a
                  href={settings.telegram_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white hover:bg-blue-50 flex items-center justify-center transition-colors"
                >
                  <Send className="h-4 w-4 text-blue-600" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4">{t('footer.quick_links')}</h3>
            <ul className="space-y-2">
              {[
                { label: t('common.home'), path: '/' },
                { label: t('common.products'), path: '/products' },
                { label: t('common.stores'), path: '/stores' },
                { label: t('common.contact'), path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              {settings.store_phone && (
                <li className="flex items-start gap-3 text-gray-600">
                  <Phone className="h-5 w-5 mt-0.5 shrink-0 text-blue-600" />
                  <div>
                    <div>{settings.store_phone}</div>
                    <div className="text-sm">{settings.working_hours}</div>
                  </div>
                </li>
              )}
              {settings.store_email && (
                <li className="flex items-start gap-3 text-gray-600">
                  <Mail className="h-5 w-5 mt-0.5 shrink-0 text-blue-600" />
                  <a href={`mailto:${settings.store_email}`} className="hover:text-blue-600 transition-colors">
                    {settings.store_email}
                  </a>
                </li>
              )}
              {settings.store_address && (
                <li className="flex items-start gap-3 text-gray-600">
                  <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-blue-600" />
                  <div>{settings.store_address}</div>
                </li>
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  {t('footer.warranty_policy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  {t('footer.return_policy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  {t('footer.shopping_guide')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  {t('footer.faq')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-gray-600">
          <p>&copy; 2025 {settings.store_name}. {t('footer.all_rights_reserved')}</p>
        </div>
      </div>
    </footer>
  );
}