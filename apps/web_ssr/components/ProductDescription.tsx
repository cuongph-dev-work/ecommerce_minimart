'use client';

import React, { useState } from 'react';
import { Package, FileText, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

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
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-4 transition-all relative ${
                  activeTab === tab.id
                    ? 'text-red-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="whitespace-nowrap">{tab.label}</span>
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
      <div className="p-6 md:p-8">
        {activeTab === 'description' && (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-gray prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-ul:space-y-2 prose-li:text-gray-700 prose-img:rounded-lg prose-img:shadow-md max-w-none"
          >
            {description ? (
              <div dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              <p className="text-gray-500">{t('product_description.no_content')}</p>
            )}
          </motion.div>
        )}

        {activeTab === 'specs' && (
          <motion.div
            key="specs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-gray prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-table:w-full prose-td:p-4 prose-td:border prose-td:border-gray-200 prose-th:bg-gray-50 prose-th:p-4 prose-th:font-semibold max-w-none"
          >
            {specifications ? (
              <div dangerouslySetInnerHTML={{ __html: specifications }} />
            ) : (
              <p className="text-gray-500">{t('product_description.no_content')}</p>
            )}
          </motion.div>
        )}

        {activeTab === 'guide' && (
          <motion.div
            key="guide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-gray prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-ul:space-y-2 prose-ol:space-y-2 prose-li:text-gray-700 prose-img:rounded-lg prose-strong:text-gray-900 max-w-none"
          >
            {usageGuide ? (
              <div dangerouslySetInnerHTML={{ __html: usageGuide }} />
            ) : (
              <p className="text-gray-500">{t('product_description.no_content')}</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

