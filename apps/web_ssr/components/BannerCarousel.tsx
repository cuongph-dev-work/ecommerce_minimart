'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { bannersService } from '../services/banners.service';
import type { Banner } from '../types';
import { sanitizeUrl, sanitizeImageUrl } from '../lib/security';

export function BannerCarousel() {
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
      {/* Banner Images - Crossfade instead of slide for smoother transition */}
      {banners.map((banner, index) => (
        <motion.div
          key={banner.id}
          initial={false}
          animate={{ 
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 1.05,
            x: isDragging && index === currentIndex ? dragOffset : 0,
          }}
          transition={{ 
            duration: isDragging ? 0 : 0.3,
            ease: 'easeOut'
          }}
          className="absolute inset-0 cursor-pointer"
          style={{ 
            touchAction: 'pan-x',
            zIndex: index === currentIndex ? 1 : 0,
            pointerEvents: index === currentIndex ? 'auto' : 'none',
          }}
          onClick={index === currentIndex ? handleBannerClick : undefined}
        >
          {/* Banner Image */}
          <div className="absolute inset-0 bg-gray-100">
            <ImageWithFallback
              src={sanitizeImageUrl(banner.image) || ''}
              alt={banner.title || 'Banner'}
              className="w-full h-full object-cover"
              eager={index === 0} // Only eager load first banner
            />
          </div>
        </motion.div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white z-10"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white z-10"
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
