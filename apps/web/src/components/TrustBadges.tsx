import React from 'react';
import { Shield, Award, ThumbsUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export function TrustBadges() {
  const { t } = useTranslation();
  
  const badges = [
    {
      icon: Shield,
      title: t('home.trust_badges.genuine_title'),
      description: t('home.trust_badges.genuine_desc'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Award,
      title: t('home.trust_badges.warranty_title'),
      description: t('home.trust_badges.warranty_desc'),
      color: 'from-green-500 to-green-600',
    },
    {
      icon: ThumbsUp,
      title: t('home.trust_badges.satisfaction_title'),
      description: t('home.trust_badges.satisfaction_desc'),
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Users,
      title: t('home.trust_badges.customers_title'),
      description: t('home.trust_badges.customers_desc'),
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all"
        >
          <div className={`w-12 h-12 bg-gradient-to-br ${badge.color} rounded-xl flex items-center justify-center mb-3`}>
            <badge.icon className="h-6 w-6 text-white" />
          </div>
          <div className="mb-1">{badge.title}</div>
          <p className="text-sm text-gray-600">{badge.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
