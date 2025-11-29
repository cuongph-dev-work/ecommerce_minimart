'use client';

import React, { useState } from 'react';
import { Package, FileText, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { sanitizeHtml } from '../lib/security';

interface ProductDescriptionProps {
  description?: string;
  specifications?: string;
  usageGuide?: string;
}

export function ProductDescription({ description, specifications, usageGuide }: ProductDescriptionProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'guide'>('description');

  const tabs = [
    { id: 'description', label: t('product_description.tabs.description'), icon: FileText },
    { id: 'specs', label: t('product_description.tabs.specifications'), icon: Package },
    { id: 'guide', label: t('product_description.tabs.guide'), icon: BookOpen },
  ];

  // Check if we have any content to display
  const hasContent = description || specifications || usageGuide;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex overflow-x-auto scrollbar-hide scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`shrink-0 min-w-[140px] sm:min-w-[150px] flex items-center justify-center gap-2 px-4 sm:px-6 py-4 sm:py-4 transition-all relative ${
                  activeTab === tab.id
                    ? 'text-red-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="whitespace-nowrap text-sm sm:text-base">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 md:p-8">
        {activeTab === 'description' && (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-sm sm:prose-base prose-gray prose-headings:font-semibold prose-h2:text-xl sm:prose-h2:text-2xl prose-h3:text-lg sm:prose-h3:text-xl prose-h4:text-base sm:prose-h4:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-ul:space-y-2 prose-li:text-gray-700 prose-li:text-sm sm:prose-li:text-base prose-img:rounded-lg prose-img:shadow-md prose-img:w-full max-w-none"
          >
            {description ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} />
            ) : (
              <p className="text-gray-500 text-sm sm:text-base">{t('product_description.no_content')}</p>
            )}
          </motion.div>
        )}

        {activeTab === 'specs' && (
          <motion.div
            key="specs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-sm sm:prose-base prose-gray prose-headings:font-semibold prose-h2:text-xl sm:prose-h2:text-2xl prose-h3:text-lg sm:prose-h3:text-xl prose-table:w-full prose-table:text-sm sm:prose-table:text-base prose-td:p-3 sm:prose-td:p-4 prose-td:border prose-td:border-gray-200 prose-th:bg-gray-50 prose-th:p-3 sm:prose-th:p-4 prose-th:font-semibold prose-th:text-sm sm:prose-th:text-base max-w-none overflow-x-auto"
          >
            {specifications ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(specifications) }} />
            ) : (
              <p className="text-gray-500 text-sm sm:text-base">{t('product_description.no_content')}</p>
            )}
          </motion.div>
        )}

        {activeTab === 'guide' && (
          <motion.div
            key="guide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-sm sm:prose-base prose-gray prose-headings:font-semibold prose-h2:text-xl sm:prose-h2:text-2xl prose-h3:text-lg sm:prose-h3:text-xl prose-h4:text-base sm:prose-h4:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-ul:space-y-2 prose-ol:space-y-2 prose-li:text-gray-700 prose-li:text-sm sm:prose-li:text-base prose-img:rounded-lg prose-strong:text-gray-900 max-w-none"
          >
            {usageGuide ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(usageGuide) }} />
            ) : (
              <p className="text-gray-500 text-sm sm:text-base">{t('product_description.no_content')}</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

