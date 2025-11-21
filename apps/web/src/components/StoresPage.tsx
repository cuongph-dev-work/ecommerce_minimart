import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { storeLocations } from '../data/stores';
import { StoreLocation } from '../types';

export function StoresPage() {
  const [selectedStore, setSelectedStore] = useState<StoreLocation>(storeLocations[0]);

  const getMapUrl = (store: StoreLocation) => {
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY_HERE&q=${store.lat},${store.lng}&zoom=15`;
  };

  const openInGoogleMaps = (store: StoreLocation) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`,
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="mb-4">Hệ thống cửa hàng</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tìm cửa hàng gần bạn nhất để trải nghiệm sản phẩm trực tiếp
          </p>
        </motion.div>

        {/* Store Selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          {storeLocations.map((store, index) => (
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
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
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
                  <MapPin className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    selectedStore.id === store.id ? 'text-white/80' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    {store.address}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className={`h-4 w-4 flex-shrink-0 ${
                    selectedStore.id === store.id ? 'text-white/80' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    {store.phone}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className={`h-4 w-4 flex-shrink-0 ${
                    selectedStore.id === store.id ? 'text-white/80' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    {store.email}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    selectedStore.id === store.id ? 'text-white/80' : 'text-gray-500'
                  }`} />
                  <div className={`text-sm ${
                    selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    <div>T2-T6: 8:00 - 21:00</div>
                    <div>T7-CN: 9:00 - 20:00</div>
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
                    Chỉ đường
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${store.phone}`, '_blank');
                    }}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/40 text-white hover:bg-white/20"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Gọi
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
              {/* Interactive Map Placeholder */}
              <div className="aspect-video bg-gray-100 relative">
                {/* Since we don't have a real API key, we'll show a static map placeholder */}
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
                      Mở trong Google Maps
                    </Button>
                  </div>
                </div>
                
                {/* In a real implementation, you would use an iframe with Google Maps Embed API:
                <iframe
                  src={getMapUrl(selectedStore)}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={selectedStore.name}
                />
                */}
              </div>

              <div className="p-6 border-t">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => openInGoogleMaps(selectedStore)}
                    className="flex-1 min-w-[200px] bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Chỉ đường
                  </Button>
                  <Button
                    onClick={() => window.open(`tel:${selectedStore.phone}`, '_blank')}
                    variant="outline"
                    className="flex-1 min-w-[200px]"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Gọi điện
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
              <h3 className="mb-6">Thông tin liên hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">Địa chỉ</div>
                    <p className="text-gray-600">{selectedStore.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">Điện thoại</div>
                    <a
                      href={`tel:${selectedStore.phone}`}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {selectedStore.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">Email</div>
                    <a
                      href={`mailto:${selectedStore.email}`}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {selectedStore.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">Giờ làm việc</div>
                    <div className="text-gray-600 space-y-1">
                      <div>Thứ 2 - Thứ 6: 8:00 - 21:00</div>
                      <div>Thứ 7 - CN: 9:00 - 20:00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-red-50 rounded-2xl p-6">
              <h3 className="mb-4">Dịch vụ tại cửa hàng</h3>
              <ul className="space-y-3">
                {[
                  'Trải nghiệm sản phẩm trực tiếp',
                  'Tư vấn chuyên sâu từ chuyên gia',
                  'Hỗ trợ cài đặt và kích hoạt',
                  'Bảo hành và sửa chữa nhanh',
                  'Đổi trả trong 7 ngày',
                  'Miễn phí gửi xe ô tô, xe máy',
                ].map((service, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white">
              <h3 className="mb-2 text-white">Cần hỗ trợ?</h3>
              <p className="mb-4 text-white/90">
                Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn
              </p>
              <Button
                onClick={() => window.open(`tel:${selectedStore.phone}`, '_blank')}
                className="w-full bg-white text-red-600 hover:bg-gray-100"
              >
                <Phone className="mr-2 h-4 w-4" />
                Gọi ngay
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}