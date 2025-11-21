import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { banners } from '../data/banners';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative h-[400px] sm:h-[500px] overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <ImageWithFallback
              src={banners[currentIndex].image}
              alt={banners[currentIndex].title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Dark overlay - half width from bottom */}
          <div className="absolute left-0 bottom-0 w-1/2 h-full bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          
          <div className="relative h-full container mx-auto px-4 sm:px-6 flex items-end pb-12">
            <div className="max-w-2xl text-white drop-shadow-lg relative z-10">
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4 text-shadow"
              >
                {banners[currentIndex].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6 text-shadow"
              >
                {banners[currentIndex].description}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={() => navigate('/products')}
                  size="lg"
                  className="bg-white text-red-600 hover:bg-gray-100 shadow-xl"
                >
                  Mua ngay
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white"
        aria-label="Next banner"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}