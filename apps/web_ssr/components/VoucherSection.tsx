'use client';

import React from 'react';
import { Ticket, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { vouchers } from '../data/vouchers';
import { toast } from 'sonner';

export function VoucherSection() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDiscount = (voucher: typeof vouchers[0]) => {
    if (voucher.type === 'percentage') {
      return `-${voucher.discount}%`;
    }
    return `-${formatPrice(voucher.discount)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
          <Ticket className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="mb-1">Mã giảm giá</h3>
          <p className="text-sm text-gray-600">Nhấn để sao chép mã voucher</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vouchers.map((voucher, index) => (
          <motion.div
            key={voucher.id}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-xl border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 p-4 cursor-pointer group"
            onClick={() => handleCopy(voucher.code, voucher.id)}
          >
            {/* Decorative circles */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white" />

            <div className="text-center">
              <div className="text-2xl mb-2">{formatDiscount(voucher)}</div>
              <div className="mb-2">{voucher.title}</div>
              <p className="text-xs text-gray-600 mb-3">{voucher.description}</p>

              <div className="bg-white border-2 border-dashed border-orange-400 rounded-lg px-3 py-2 flex items-center justify-between group-hover:border-orange-500 transition-colors">
                <code className="text-sm text-orange-600">{voucher.code}</code>
                {copiedId === voucher.id ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
