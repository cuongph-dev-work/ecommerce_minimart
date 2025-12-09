'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, ClipboardList } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { MegaMenu } from './MegaMenu';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useSettings } from '../context/SettingsContext';
import { sanitizeImageUrl } from '../lib/security';

export function Header() {
  const { t } = useTranslation();
  const { getTotalItems } = useCart();
  const { settings, isLoading } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);
  const prevItemCount = useRef(getTotalItems());
  const pathname = usePathname();
  const router = useRouter();

  // Ensure client-side only rendering for logo to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger animation when cart items change
  useEffect(() => {
    const currentCount = getTotalItems();
    if (isMounted && currentCount !== prevItemCount.current && currentCount > 0) {
      setCartAnimation(true);
      const timer = setTimeout(() => setCartAnimation(false), 600);
      prevItemCount.current = currentCount;
      return () => clearTimeout(timer);
    }
    prevItemCount.current = currentCount;
  }, [getTotalItems(), isMounted]);

  const navItems = [
    { label: t('common.home'), path: '/' },
    { label: t('common.products'), path: '/products' },
    { label: t('common.stores'), path: '/stores' },
    { label: t('common.contact'), path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-r from-red-500 to-orange-500 ${
        isScrolled ? 'shadow-lg' : 'shadow-md'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Use suppressHydrationWarning to avoid mismatch between server (fallback) and client (with settings) */}
          <Link href="/" className="flex items-center gap-2 group" suppressHydrationWarning>
            {(!isMounted || !settings.store_logo) ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-md"
                suppressHydrationWarning
              >
                <span className="bg-gradient-to-br from-red-500 to-orange-500 bg-clip-text text-transparent">
                  {isMounted && settings.store_name ? settings.store_name.charAt(0) : 'M'}
                </span>
              </motion.div>
            ) : (() => {
              const logoUrl = sanitizeImageUrl(settings.store_logo);
              return logoUrl ? (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  src={logoUrl}
                  alt={settings.store_name || 'Logo'}
                  className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-lg"
                />
              ) : null;
            })()}
            <span className="hidden sm:block text-white transition-colors" suppressHydrationWarning>
              {isMounted && settings.store_name ? settings.store_name : 'Mini Mart'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <MegaMenu />
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`relative py-2 transition-colors ${
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* <LanguageSwitcher /> */}
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/20 w-10 h-10 sm:w-14 sm:h-14"
              onClick={() => router.push('/products?trigger=search_open')}
            >
              <Search className="h-5 w-5 sm:h-7 sm:w-7" />
            </Button>

            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.push('/order-tracking')}
              title={t('common.orderTracking')}
            >
              <ClipboardList className="h-5 w-5" />
            </Button> */}

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative text-white hover:bg-white/20 w-10 h-10 sm:w-14 sm:h-14"
              onClick={() => router.push('/cart')}
              suppressHydrationWarning
            >
              <motion.div
                animate={cartAnimation ? {
                  scale: [1, 1.2, 0.9, 1.1, 1],
                  rotate: [0, -10, 10, -5, 0]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <ShoppingCart className="h-5 w-5 sm:h-7 sm:w-7" />
              </motion.div>
              {isMounted && getTotalItems() > 0 && (
                <div className="absolute -top-0.5 -right-0.5 sm:top-0 sm:right-0">
                  {/* Ripple/Ping effect */}
                  <motion.span
                    className="absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full"
                    animate={{
                      scale: [1, 1.8],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      repeatDelay: 0.3
                    }}
                  />
                  {/* Badge number */}
                  <motion.span
                    key={getTotalItems()}
                    initial={{ scale: 0 }}
                    animate={cartAnimation ? {
                      scale: [1, 1.3, 1],
                    } : { scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative bg-white text-red-600 text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-medium shadow-md"
                  >
                    {getTotalItems()}
                  </motion.span>
                </div>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full text-white hover:bg-white/20 w-10 h-10 sm:w-14 sm:h-14"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-7 sm:w-7" />
              ) : (
                <Menu className="h-5 w-5 sm:h-7 sm:w-7" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-left px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}