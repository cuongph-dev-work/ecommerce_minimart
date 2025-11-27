import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { settingsService } from '../services/settings.service';
import * as v from 'valibot';

export function ContactPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);

  const getFieldError = (field: string) => {
    return validationErrors.find(err => err.field === field)?.message;
  };

  // Create dynamic schema with i18n messages
  const getContactSchema = () => {
    return v.object({
      name: v.pipe(
        v.string(t('contact.validation.name_required')),
        v.minLength(1, t('contact.validation.name_empty')),
        v.maxLength(100, t('contact.validation.name_max_length'))
      ),
      phone: v.optional(
        v.pipe(
          v.string(),
          v.regex(/^[0-9\s\-()]+$/, t('contact.validation.phone_invalid')),
          v.maxLength(20, t('contact.validation.phone_max_length'))
        )
      ),
      message: v.pipe(
        v.string(t('contact.validation.message_required')),
        v.minLength(1, t('contact.validation.message_empty')),
        v.maxLength(2000, t('contact.validation.message_max_length'))
      ),
    });
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.getAll();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors([]);
    
    // Validate using Valibot with i18n messages
    const schema = getContactSchema();
    const result = v.safeParse(schema, formData);
    
    if (!result.success) {
      // Convert Valibot errors to our format
      const errors: { field: string; message: string }[] = [];
      
      for (const issue of result.issues) {
        const field = issue.path?.[0]?.key as string;
        if (field) {
          errors.push({
            field,
            message: issue.message,
          });
        }
      }
      
      setValidationErrors(errors);
      toast.error(t('contact.errors.check_info'));
      return;
    }
    
    // Check email setting
    if (!settings.store_email) {
      toast.error(t('contact.errors.no_email_config'));
      return;
    }
    
    // Create mailto URL with i18n labels
    const subject = encodeURIComponent(`${t('contact.title')} - ${formData.name}`);
    const nameLabel = t('contact.name');
    const phoneLabel = t('contact.phone');
    const messageLabel = t('contact.message');
    const body = encodeURIComponent(
      `${nameLabel}: ${formData.name}\n` +
      (formData.phone ? `${phoneLabel}: ${formData.phone}\n\n` : '\n') +
      `${messageLabel}:\n${formData.message}`
    );
    
    const mailtoUrl = `mailto:${settings.store_email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    
    toast.success(t('contact.success.opening_email'));
    setFormData({ name: '', phone: '', message: '' });
    setValidationErrors([]);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: t('contact_methods.phone'),
      content: settings.store_phone || '',
      action: settings.store_phone ? `tel:${settings.store_phone.replace(/\s/g, '')}` : '#',
      actionText: t('contact_methods.phone_call_now'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Mail,
      title: t('contact_methods.email'),
      content: settings.store_email || '',
      action: settings.store_email ? `mailto:${settings.store_email}` : '#',
      actionText: t('contact_methods.email_send'),
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: MessageCircle,
      title: t('contact_methods.zalo'),
      content: settings.telegram_link ? t('contact_methods.zalo_content') : '',
      action: settings.telegram_link || '#',
      actionText: t('contact_methods.zalo_chat'),
      color: 'from-blue-400 to-blue-500',
    },
    {
      icon: MapPin,
      title: t('contact_methods.address'),
      content: settings.store_address || '',
      action: '/stores',
      actionText: t('contact_methods.address_view_map'),
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
          <h1 className="mb-4">{t('contact.title')}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('contact.subtitle')}
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
              <h2 className="mb-6">{t('contact.send_message')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2">
                    {t('contact.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      // Clear error when user starts typing
                      if (getFieldError('name')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'name'));
                      }
                    }}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all ${
                      getFieldError('name') ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder={t('contact.name_placeholder')}
                  />
                  {getFieldError('name') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('name')}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2">{t('contact.phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      // Clear error when user starts typing
                      if (getFieldError('phone')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'phone'));
                      }
                    }}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all ${
                      getFieldError('phone') ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder={t('contact.phone_placeholder')}
                  />
                  {getFieldError('phone') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('phone')}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2">
                    {t('contact.message')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      // Clear error when user starts typing
                      if (getFieldError('message')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'message'));
                      }
                    }}
                    rows={5}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all resize-none ${
                      getFieldError('message') ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder={t('contact.message_placeholder')}
                  />
                  {getFieldError('message') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('message')}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 group"
                >
                  {t('contact.send_button')}
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
              <h2 className="mb-6">{t('contact.info.title')}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">{t('contact.info.hotline')}</h3>
                    {settings.store_phone ? (
                      <>
                        <p className="text-gray-600">{settings.store_phone} ({t('contact.info.hotline_hours')})</p>
                        <p className="text-gray-600">{t('contact.info.hotline_support')}</p>
                      </>
                    ) : (
                      <p className="text-gray-400">{t('contact.info.not_updated')}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">{t('contact.info.email')}</h3>
                    {settings.store_email ? (
                      <>
                        <p className="text-gray-600">{settings.store_email}</p>
                        <p className="text-gray-600">{t('contact.info.email_response')}</p>
                      </>
                    ) : (
                      <p className="text-gray-400">{t('contact.info.not_updated')}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">{t('contact.info.address')}</h3>
                    {settings.store_address ? (
                      <p className="text-gray-600">{settings.store_address}</p>
                    ) : (
                      <p className="text-gray-400">{t('contact.info.not_updated')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
              <h3 className="mb-4">{t('contact.faq.title')}</h3>
              <div className="space-y-4">
                {[
                  {
                    q: t('contact.faq.delivery_time_q'),
                    a: t('contact.faq.delivery_time_a'),
                  },
                  {
                    q: t('contact.faq.return_policy_q'),
                    a: t('contact.faq.return_policy_a'),
                  },
                  {
                    q: t('contact.faq.installment_q'),
                    a: t('contact.faq.installment_a'),
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