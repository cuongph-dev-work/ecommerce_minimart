'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { storesService } from '../services/stores.service';
import { StoreLocation } from '../types';

export function StoresPage() {
  const { t } = useTranslation();
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await storesService.getAll();
        setStores(data);
        if (data.length > 0) {
          setSelectedStore(data[0]);
        }
      } catch (error) {
        console.error('Failed to load stores:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, []);

  const getMapEmbedUrl = (store: StoreLocation) => {
    if (store.lat && store.lng) {
      // Use Google Maps Embed with coordinates (no API key needed)
      return `https://www.google.com/maps?q=${store.lat},${store.lng}&z=15&output=embed`;
    } else if (store.address) {
      // Use address-based embed (no API key needed)
      return `https://www.google.com/maps?q=${encodeURIComponent(store.address)}&output=embed`;
    }
    return '';
  };

  const openInGoogleMaps = (store: StoreLocation) => {
    if (store.lat && store.lng) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`,
        '_blank'
      );
    } else if (store.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`,
        '_blank'
      );
    }
  };

  const formatWorkingHours = (store: StoreLocation) => {
    if (store.workingHours) {
      const { weekdays, weekends } = store.workingHours;
      return (
        <>
          <div>{t('stores.weekdays')}: {weekdays.start} - {weekdays.end}</div>
          <div>{t('stores.weekends')}: {weekends.start} - {weekends.end}</div>
        </>
      );
    }
    return (
      <>
        <div>{t('stores.weekdays')}: {t('stores.default_weekdays')}</div>
        <div>{t('stores.weekends')}: {t('stores.default_weekends')}</div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">{t('stores.loading')}</div>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">{t('stores.no_stores')}</div>
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="mb-4">{t('stores.title')}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('stores.subtitle')}
          </p>
        </motion.div>

        {/* Store Selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          {stores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedStore(store)}
              className={`text-left p-6 rounded-2xl transition-all cursor-pointer ${
                selectedStore.id === store.id
                  ? 'bg-red-600 text-white shadow-xl'
                  : 'bg-white hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedStore.id === store.id
                      ? 'bg-white/20'
                      : 'bg-red-100'
                  }`}
                >
                  <MapPin
                    className={`h-6 w-6 ${
                      selectedStore.id === store.id ? 'text-white' : 'text-red-600'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="mb-2">{store.name}</h3>
                </div>
              </div>

              {/* Store Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className={`h-4 w-4 mt-0.5 shrink-0 ${
                    selectedStore.id === store.id ? 'text-white/80' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    {store.address}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className={`h-4 w-4 shrink-0 ${
                    selectedStore.id === store.id ? 'text-white/80' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    {store.phone}
                  </span>
                </div>

                {store.email && (
                  <div className="flex items-center gap-2">
                    <Mail className={`h-4 w-4 shrink-0 ${
                      selectedStore.id === store.id ? 'text-white/80' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm ${
                      selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {store.email}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Clock className={`h-4 w-4 mt-0.5 shrink-0 ${
                    selectedStore.id === store.id ? 'text-white/80' : 'text-gray-500'
                  }`} />
                  <div className={`text-sm ${
                    selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    {formatWorkingHours(store)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedStore.id === store.id && (
                <div className="mt-4 pt-4 border-t border-white/20 flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInGoogleMaps(store);
                    }}
                    size="sm"
                    className="flex-1 bg-white text-red-600 hover:bg-gray-100"
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    {t('stores.get_directions')}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${store.phone}`, '_blank');
                    }}
                    size="sm"
                    className="flex-1 bg-white text-red-600 hover:bg-gray-100 border-0"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    {t('stores.call')}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Map and Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
              {/* Interactive Map */}
              <div className="aspect-video bg-gray-100 relative">
                {getMapEmbedUrl(selectedStore) ? (
                  <iframe
                    src={getMapEmbedUrl(selectedStore)}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${t('stores.map_title')} ${selectedStore.name}`}
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-red-600" />
                      <h3 className="mb-2">{selectedStore.name}</h3>
                      <p className="text-gray-600 mb-4">{selectedStore.address}</p>
                      <Button
                        onClick={() => openInGoogleMaps(selectedStore)}
                        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        {t('stores.open_in_maps')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => openInGoogleMaps(selectedStore)}
                    className="flex-1 min-w-[200px] bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    {t('stores.get_directions')}
                  </Button>
                  <Button
                    onClick={() => window.open(`tel:${selectedStore.phone}`, '_blank')}
                    variant="outline"
                    className="flex-1 min-w-[200px]"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    {t('stores.call_phone')}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Store Details */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="mb-6">{t('stores.contact_info')}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">{t('stores.address')}</div>
                    <p className="text-gray-600">{selectedStore.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">{t('stores.phone')}</div>
                    <a
                      href={`tel:${selectedStore.phone}`}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {selectedStore.phone}
                    </a>
                  </div>
                </div>

                {selectedStore.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1">{t('stores.email')}</div>
                      <a
                        href={`mailto:${selectedStore.email}`}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {selectedStore.email}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">{t('stores.working_hours')}</div>
                    <div className="text-gray-600 space-y-1">
                      {formatWorkingHours(selectedStore)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            {selectedStore.services && selectedStore.services.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-6">
                <h3 className="mb-4">{t('stores.services')}</h3>
                <ul className="space-y-3">
                  {selectedStore.services.map((service, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full shrink-0" />
                      <span className="text-gray-700">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}