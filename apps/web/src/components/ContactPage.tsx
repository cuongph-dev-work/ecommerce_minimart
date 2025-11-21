import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Điện thoại',
      content: '1900 xxxx',
      action: 'tel:1900xxxx',
      actionText: 'Gọi ngay',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'support@store.vn',
      action: 'mailto:support@store.vn',
      actionText: 'Gửi email',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: MessageCircle,
      title: 'Zalo',
      content: '0912 345 678',
      action: 'https://zalo.me',
      actionText: 'Chat Zalo',
      color: 'from-blue-400 to-blue-500',
    },
    {
      icon: MapPin,
      title: 'Địa chỉ',
      content: '3 chi nhánh HCM, HN, ĐN',
      action: '#stores',
      actionText: 'Xem bản đồ',
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh bên dưới
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all text-center"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <method.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2">{method.title}</h3>
              <p className="text-gray-600 mb-4">{method.content}</p>
              <Button
                onClick={() => {
                  if (method.action.startsWith('http') || method.action.startsWith('mailto') || method.action.startsWith('tel')) {
                    window.open(method.action, '_blank');
                  }
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {method.actionText}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h2 className="mb-6">Gửi tin nhắn cho chúng tôi</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    placeholder="0912345678"
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                    placeholder="Nhập nội dung cần hỗ trợ..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 group"
                >
                  Gửi tin nhắn
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h2 className="mb-6">Thông tin liên hệ</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">Hotline</h3>
                    <p className="text-gray-600">1900 xxxx (8:00 - 21:00)</p>
                    <p className="text-gray-600">Hỗ trợ khách hàng 24/7</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">Email</h3>
                    <p className="text-gray-600">support@store.vn</p>
                    <p className="text-gray-600">Phản hồi trong 24h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">Địa chỉ cửa hàng</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Chi nhánh Quận 1, TP.HCM</li>
                      <li>• Chi nhánh Hà Nội</li>
                      <li>• Chi nhánh Đà Nẵng</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
              <h3 className="mb-4">Câu hỏi thường gặp</h3>
              <div className="space-y-4">
                {[
                  {
                    q: 'Thời gian giao hàng bao lâu?',
                    a: '1-3 ngày nội thành, 3-7 ngày ngoại thành',
                  },
                  {
                    q: 'Chính sách đổi trả như thế nào?',
                    a: 'Đổi trả trong 7 ngày với sản phẩm còn nguyên tem',
                  },
                  {
                    q: 'Có hỗ trợ trả góp không?',
                    a: 'Hỗ trợ trả góp 0% qua thẻ tín dụng',
                  },
                ].map((faq, index) => (
                  <div key={index}>
                    <div className="mb-1">{faq.q}</div>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}