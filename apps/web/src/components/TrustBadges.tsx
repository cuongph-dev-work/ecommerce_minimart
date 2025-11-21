import React from 'react';
import { Shield, Award, ThumbsUp, Users } from 'lucide-react';
import { motion } from 'motion/react';

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: 'Chính hãng 100%',
      description: 'Cam kết hàng chính hãng',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Award,
      title: 'Bảo hành uy tín',
      description: 'Bảo hành tại nhà',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: ThumbsUp,
      title: '98% hài lòng',
      description: 'Khách hàng tin tưởng',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Users,
      title: '50.000+ khách hàng',
      description: 'Phục vụ tận tâm',
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
