import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white">M</span>
              </div>
              <span>Tech Store</span>
            </div>
            <p className="text-gray-600 mb-4">
              Cửa hàng công nghệ uy tín, chất lượng cao. Cam kết sản phẩm chính hãng, bảo hành tốt nhất.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white hover:bg-blue-50 flex items-center justify-center transition-colors"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white hover:bg-pink-50 flex items-center justify-center transition-colors"
              >
                <Instagram className="h-4 w-4 text-pink-600" />
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white hover:bg-blue-50 flex items-center justify-center transition-colors"
              >
                <Send className="h-4 w-4 text-blue-600" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              {[
                { label: 'Trang chủ', path: '/' },
                { label: 'Sản phẩm', path: '/products' },
                { label: 'Cửa hàng', path: '/stores' },
                { label: 'Liên hệ', path: '/contact' },
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
            <h3 className="mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-600">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600" />
                <div>
                  <div>1900 xxxx</div>
                  <div className="text-sm">T2-T7: 8:00 - 21:00</div>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600" />
                <a href="mailto:support@store.vn" className="hover:text-blue-600 transition-colors">
                  support@store.vn
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600" />
                <div>3 chi nhánh tại TP.HCM, Hà Nội, Đà Nẵng</div>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Chính sách bảo hành
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-gray-600">
          <p>&copy; 2025 Tech Store. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}