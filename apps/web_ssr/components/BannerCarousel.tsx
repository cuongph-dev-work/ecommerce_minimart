'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { bannersService } from '../services/banners.service';
import type { Banner } from '../types';
import { useTranslation } from 'react-i18next';
import { sanitizeUrl, sanitizeImageUrl } from '../lib/security';

export function BannerCarousel() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ isDragging: false, startX: 0, dragOffset: 0 });

  // Load banners from API
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await bannersService.getAll();
        // Sort by sortOrder if available, otherwise keep original order
        const sortedBanners = [...data].sort((a, b) => {
          const orderA = a.sortOrder ?? 0;
          const orderB = b.sortOrder ?? 0;
          return orderA - orderB;
        });
        setBanners(sortedBanners);
      } catch (error) {
        console.error('Failed to load banners:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  // Auto slide
  useEffect(() => {
    if (banners.length === 0 || isDragging) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length, isDragging]);

  const goToPrevious = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const getClientX = (e: React.TouchEvent | React.MouseEvent | TouchEvent | MouseEvent): number => {
    if ('touches' in e) {
      return e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0;
    }
    return e.clientX;
  };

  const handleStart = (clientX: number) => {
    if (banners.length === 0) return;
    dragStateRef.current = {
      isDragging: true,
      startX: clientX,
      dragOffset: 0,
    };
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleMove = (clientX: number) => {
    const state = dragStateRef.current;
    if (!state.isDragging || banners.length === 0) return;
    const offset = clientX - state.startX;
    state.dragOffset = offset;
    setDragOffset(offset);
  };

  const handleEnd = () => {
    const state = dragStateRef.current;
    if (!state.isDragging || banners.length === 0) return;
    const threshold = 50; // Minimum drag distance to trigger slide
    
    if (Math.abs(state.dragOffset) > threshold) {
      if (state.dragOffset > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
    
    state.isDragging = false;
    state.dragOffset = 0;
    state.startX = 0;
    setIsDragging(false);
    setDragOffset(0);
    setStartX(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(getClientX(e));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(getClientX(e));
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(getClientX(e));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(getClientX(e));
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Global mouse events for drag outside component
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      handleEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  const handleBannerClick = () => {
    const currentBanner = banners[currentIndex];
    if (currentBanner?.link) {
      const safeUrl = sanitizeUrl(currentBanner.link);
      if (safeUrl) {
        // Check if it's an internal link (starts with /)
        if (safeUrl.startsWith('/')) {
          router.push(safeUrl);
        } else {
          // External link - open in new tab
          window.open(safeUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        router.push('/products');
      }
    } else {
      router.push('/products');
    }
  };

  // Don't render if loading or no banners
  if (loading) {
    return (
      <>
        <style>{`
          .banner-aspect {
            aspect-ratio: 16/9;
          }
          @media (min-width: 640px) {
            .banner-aspect {
              aspect-ratio: 21/9;
            }
          }
        `}</style>
        <div className="relative w-full overflow-hidden rounded-2xl bg-gray-200 animate-pulse banner-aspect" />
      </>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        .banner-aspect {
          aspect-ratio: 16/9;
        }
        @media (min-width: 640px) {
          .banner-aspect {
            aspect-ratio: 21/9;
          }
        }
      `}</style>
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl banner-aspect cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ 
            opacity: isDragging ? 0.8 : 1, 
            x: dragOffset 
          }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: isDragging ? 0 : 0.5 }}
          className="absolute inset-0"
          style={{ touchAction: 'pan-x' }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <ImageWithFallback
              src={sanitizeImageUrl(banners[currentIndex].image) || ''}
              alt={banners[currentIndex].title || 'Banner'}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Dark overlay - half width from bottom */}
          <div className="absolute left-0 bottom-0 w-1/2 h-full bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          
          <div className="relative h-full container mx-auto px-4 sm:px-6 flex items-end pb-6 sm:pb-12">
            <div className="max-w-2xl text-white drop-shadow-lg relative z-10">
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-2 sm:mb-4 text-shadow text-xl sm:text-2xl md:text-3xl lg:text-4xl"
              >
                {banners[currentIndex].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-3 sm:mb-6 text-shadow text-sm sm:text-base"
              >
                {banners[currentIndex].description}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={handleBannerClick}
                  size="lg"
                  className="bg-white text-red-600 hover:bg-gray-100 shadow-xl text-sm sm:text-base h-9 sm:h-11"
                >
                  {t('home.view_more')}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white"
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 sm:h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-6 sm:w-8 bg-white' : 'w-1.5 sm:w-2 bg-white/50'
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
      </div>
    </>
  );
}
