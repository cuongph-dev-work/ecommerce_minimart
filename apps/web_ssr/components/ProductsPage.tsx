'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { SearchSuggestions } from './SearchSuggestions';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
} from './ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { productsService } from '../services/products.service';
import { categoriesService } from '../services/categories.service';
import { ProductCard } from './ProductCard';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ProductsPage() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]); // All categories including subcategories
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Track if this is the first load
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const categoryParam = searchParams?.get('category') || '';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load to prevent URL update loop
  const isUpdatingFromUrlRef = useRef(false); // Track if category is being updated from URL (use ref to avoid re-renders)
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showFilterBlock, setShowFilterBlock] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false); // Prevent multiple concurrent loads

  // Search history
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Infinite scroll - load more when scrolling near bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        // Check both loading state and ref to prevent race conditions
        if (first.isIntersecting && hasMore && !loading && !isLoadingRef.current) {
          setPage(p => p + 1);
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: '400px' // Increased from 100px for smoother prefetching
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading]);

  // Scroll to top when page resets (filters change, category change, etc.)
  useEffect(() => {
    if (page === 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, selectedCategory, debouncedSearch, selectedBrand, sortBy]);

  // Get unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set(products.map(p => p.brand).filter(Boolean));
    return Array.from(brandSet);
  }, [products]);

  const activeParentCategory = useMemo(() => {
    return categories.find((category) => {
      if (category.id === selectedCategory) return true;
      return category.children?.some((child) => child.id === selectedCategory);
    });
  }, [categories, selectedCategory]);

  const activeSubcategories = activeParentCategory?.children || [];
  const selectedSubcategory = activeSubcategories.find((sub) => sub.id === selectedCategory);

  // Load categories
  useEffect(() => {
    const abortController = new AbortController();
    
    const loadCategories = async () => {
      try {
        const cats = await categoriesService.getAll(abortController.signal);
        setCategories(cats);
        
        // Flatten all categories including subcategories for display
        const allCats: Category[] = [];
        const flattenCategories = (cats: Category[]) => {
          cats.forEach(cat => {
            allCats.push(cat);
            if (cat.children && cat.children.length > 0) {
              flattenCategories(cat.children);
            }
          });
        };
        flattenCategories(cats);
        setAllCategories(allCats);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load categories:', error);
        }
      }
    };

    loadCategories();

    return () => abortController.abort();
  }, []);

  // Resolve category from URL (slug or ID) - only on mount or external URL change
  useEffect(() => {
    if (!categoryParam) {
      if (selectedCategory !== 'all') {
        isUpdatingFromUrlRef.current = true;
        setSelectedCategory('all');
        setTimeout(() => {
          isUpdatingFromUrlRef.current = false;
        }, 0);
      } else {
        // If already 'all', just mark initial load as done
        // This will allow products to load via the load products effect
        setIsInitialLoad(false);
      }
      return;
    }

    const resolveCategory = async () => {
      try {
        isUpdatingFromUrlRef.current = true;
        // Try to find by slug first
        let category: Category | null = null;
        try {
          category = await categoriesService.getBySlug(categoryParam);
        } catch {
          // If not found by slug, try by ID
          try {
            category = await categoriesService.getById(categoryParam);
          } catch {
            // Category not found
            setSelectedCategory('all');
            setIsInitialLoad(false);
            isUpdatingFromUrlRef.current = false;
            return;
          }
        }
        
        if (category && selectedCategory !== category.id) {
          setSelectedCategory(category.id);
        }
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Failed to resolve category:', error);
        setSelectedCategory('all');
        setIsInitialLoad(false);
      } finally {
        // Delay reset to ensure URL update effect has checked the flag
        setTimeout(() => {
          isUpdatingFromUrlRef.current = false;
        }, 100);
      }
    };

    resolveCategory();
  }, [categoryParam]); // Only depend on categoryParam, not selectedCategory

  // Load products
  useEffect(() => {
    // Skip loading if we're still resolving category from URL
    if (isInitialLoad && categoryParam) {
      return;
    }

    const abortController = new AbortController();
    
    const loadProducts = async () => {
      try {
        // Prevent concurrent requests
        if (isLoadingRef.current) {
          return;
        }
        
        isLoadingRef.current = true;
        setLoading(true);
        
        // Clear products when filters change or on initial load (page 1)
        if (page === 1) {
          setProducts([]);
        }
        
        const params: any = {
          page,
          limit: 20, // Always load 20 products
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedBrand !== 'all') params.brand = selectedBrand;
        
        // Map sortBy to API params
        if (sortBy !== 'default') {
          switch (sortBy) {
            case 'price-asc':
              params.sortBy = 'price';
              params.sortOrder = 'asc';
              break;
            case 'price-desc':
              params.sortBy = 'price';
              params.sortOrder = 'desc';
              break;
            case 'name-asc':
              params.sortBy = 'name';
              params.sortOrder = 'asc';
              break;
            case 'popular':
              params.sortBy = 'sold';
              params.sortOrder = 'desc';
              break;
          }
        }

        const result = await productsService.getAll(params, abortController.signal);
        
        if (!abortController.signal.aborted) {
          // Append products for page > 1, replace for page 1
          if (page === 1) {
            setProducts(result.products);
          } else {
            // Deduplicate products by ID to prevent duplicate keys
            setProducts(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newProducts = result.products.filter(p => !existingIds.has(p.id));
              return [...prev, ...newProducts];
            });
          }
          
          // Check if there are more products to load
          if (result.pagination) {
            const currentPage = result.pagination.currentPage || page;
            const totalPages = result.pagination.totalPages || 1;
            setHasMore(currentPage < totalPages);
          } else {
            setHasMore(false);
          }
          
          setIsInitialLoading(false);
        }
        } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load products:', error);
          toast.error(t('products.load_error'));
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
          isLoadingRef.current = false; // Reset loading ref
        }
      }
    };

    loadProducts();

    return () => abortController.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategory, selectedBrand, sortBy, page]);

  // Update URL params when selectedCategory changes (from user click)
  // Only update URL when user explicitly clicks, not when category is resolved from URL
  useEffect(() => {
    // Skip during initial load, if categories not loaded yet, or if updating from URL
    if (isInitialLoad || allCategories.length === 0 || isUpdatingFromUrlRef.current) {
      return;
    }

    // Check if current URL already matches the selected category
    const currentCategoryParam = searchParams?.get('category') || '';
    if (selectedCategory !== 'all') {
      const category = allCategories.find(c => c.id === selectedCategory);
      if (category && category.slug) {
        // If URL already has the correct slug, don't update
        if (currentCategoryParam === category.slug) {
          return;
        }
      } else if (selectedCategory === currentCategoryParam) {
        // If URL already has the category ID, don't update
        return;
      }
    } else if (!currentCategoryParam) {
      // If selectedCategory is 'all' and URL has no category, don't update
      return;
    }

    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') {
      const category = allCategories.find(c => c.id === selectedCategory);
      if (category && category.slug) {
        params.set('category', category.slug);
      } else if (selectedCategory) {
        params.set('category', selectedCategory);
      }
    }
    
    // Check if URL needs to be updated
    const currentSearch = searchParams?.get('search') || '';
    const newCategory = params.get('category') || '';
    const newSearch = params.get('search') || '';
    
    // Only update if different to avoid unnecessary updates
    if (currentCategoryParam !== newCategory || currentSearch !== newSearch) {
      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
    }
  }, [searchQuery, selectedCategory, allCategories, router, searchParams, isInitialLoad]);

  // Memoized handlers for performance
  const handleAddToCart = useCallback((product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(t('products.add_to_cart_success', { name: product.name }));
  }, [addToCart, t]);

  const handleProductClick = useCallback((slug: string) => {
    router.push(`/products/${slug}`);
  }, [router]);

  // Memoized utility functions
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }, []);

  const stripHtmlTags = useCallback((html: string) => {
    return html.replace(/<[^>]*>/g, '');
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSortBy('default');
    setPage(1);
  }, []);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedBrand !== 'all' || sortBy !== 'default';

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <h1 className="mb-2 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl">{t('products.title')}</h1>
              <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
                {t('products.subtitle')}
              </p>
            </div>
            <Button
              onClick={() => setShowFilterBlock(!showFilterBlock)}
              className="bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 gap-2 w-fit"
              size="lg"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>
                {showFilterBlock ? t('products.hide_search') : t('products.search_filter')}
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Search and Filter - Collapsible */}
        {showFilterBlock && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 overflow-hidden"
        >
          <div className="bg-white rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder={t('products.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    setSearchFocused(true);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      addToHistory(searchQuery.trim());
                      setShowSuggestions(false);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                
                {/* Search Suggestions */}
                <SearchSuggestions
                  query={searchQuery}
                  onSelect={(query) => {
                    setSearchQuery(query);
                    addToHistory(query);
                    setShowSuggestions(false);
                    setPage(1);
                  }}
                  searchHistory={history}
                  onRemoveHistory={removeFromHistory}
                  onClearHistory={clearHistory}
                  isOpen={showSuggestions && searchFocused}
                  onClose={() => {
                    setShowSuggestions(false);
                    setSearchFocused(false);
                  }}
                />
              </div>

              {/* Filter Button (Mobile) */}
              <Button variant="outline" size="lg" className="sm:hidden" onClick={() => setShowFilterSheet(true)}>
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                {t('products.filter')}
              </Button>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              {/* Main Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all font-medium ${
                    selectedCategory === 'all'
                      ? 'bg-linear-to-r from-red-500 to-orange-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {t('products.all_categories')}
                </button>
                {categories.map((category) => {
                  const isActive =
                    selectedCategory === category.id ||
                    category.children?.some((child) => child.id === selectedCategory);
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setPage(1);
                      }}
                      className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all font-medium ${
                        isActive
                          ? 'bg-linear-to-r from-red-500 to-orange-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>

              {/* Selected Summary */}
              {selectedCategory !== 'all' && activeParentCategory && (
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  <span className="font-medium">{t('products.selected_category')}:</span>
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                    {activeParentCategory.name}
                  </span>
                  {selectedSubcategory && (
                    <>
                      <span className="text-gray-400">›</span>
                      <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 border border-blue-100">
                        {selectedSubcategory.name}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Subcategories - Show when parent has children */}
              {activeParentCategory && activeSubcategories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap bg-gray-50 border border-gray-100 rounded-2xl p-3">
                  <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                    {t('products.subcategories')}:
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {activeSubcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSelectedCategory(sub.id);
                          setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm transition-all border ${
                          selectedCategory === sub.id
                            ? 'bg-blue-500/10 text-blue-700 border-blue-300 font-medium shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        )}

        {/* Products Grid */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            {/* Filter & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b">
              <div className="text-sm text-gray-600">
                {loading ? t('products.loading') : t('products.found_products', { count: products.length })}
              </div>
              
              {/* Desktop Filter & Sort */}
              <div className="hidden sm:flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{t('products.sort_by')}</span>
                  <Select value={sortBy} onValueChange={(value) => {
                    setSortBy(value);
                    setPage(1);
                  }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('products.select_sort')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{t('products.default')}</SelectItem>
                      <SelectItem value="price-asc">{t('products.price_asc')}</SelectItem>
                      <SelectItem value="price-desc">{t('products.price_desc')}</SelectItem>
                      <SelectItem value="name-asc">{t('products.name_asc')}</SelectItem>
                      <SelectItem value="popular">{t('products.popular')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t('products.brand_label')}</span>
                    <Select value={selectedBrand} onValueChange={(value) => {
                      setSelectedBrand(value);
                      setPage(1);
                    }}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={t('products.select_brand')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('products.all')}</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand!}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    {t('products.clear_filters')}
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    {t('products.search_badge').replace('{query}', searchQuery)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {t('products.category_badge', { name: allCategories.find(c => c.id === selectedCategory)?.name || '' })}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSelectedCategory('all')}
                    />
                  </Badge>
                )}
                {selectedBrand !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {t('products.brand_badge', { brand: selectedBrand })}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSelectedBrand('all')}
                    />
                  </Badge>
                )}
                {sortBy !== 'default' && (
                  <Badge variant="secondary" className="gap-1">
                    {sortBy === 'price-asc' && t('products.price_asc')}
                    {sortBy === 'price-desc' && t('products.price_desc')}
                    {sortBy === 'name-asc' && t('products.name_asc')}
                    {sortBy === 'popular' && t('products.popular')}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSortBy('default')}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && isInitialLoading ? (
              <div className="product-grid">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded overflow-hidden shadow-sm">
                    <div className="aspect-square bg-gray-200 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                      <div className="h-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 && !loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="mb-2">{t('products.no_products')}</h3>
                <p className="text-gray-600">
                  {t('products.no_products_desc')}
                </p>
              </motion.div>
            ) : (
              <div className="relative">
                <div className={`product-grid transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      totalProducts={products.length}
                      searchQuery={debouncedSearch}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Trigger & Loading Indicator */}
                {hasMore && products.length > 0 && (
                  <div ref={loadMoreRef} className="flex justify-center mt-8 py-4">
                    {loading && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-600">{t('products.loading')}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* End of products indicator */}
                {!hasMore && products.length > 0 && (
                  <div className="flex justify-center mt-8 py-4">
                    <p className="text-sm text-gray-500">{t('products.no_more_products')}</p>
                  </div>
                )}
                
                {/* Loading Overlay */}
                {loading && !isInitialLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-600">{t('products.loading')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filter Sheet */}
        <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
          <SheetContent className="w-full max-w-2xl">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-1.5">{t('products.filter_title')}</h2>
              <p className="text-sm text-gray-600">
                {t('products.filter_description')}
              </p>
            </div>
            <div className="p-4 space-y-4">
              {/* Brand */}
              {brands.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">{t('products.brand')}</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedBrand('all')}
                      className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm ${
                        selectedBrand === 'all'
                          ? 'bg-linear-to-r from-red-500 to-orange-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {t('products.all')}
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand!)}
                        className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm ${
                          selectedBrand === brand
                            ? 'bg-linear-to-r from-red-500 to-orange-500 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort By */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">{t('products.sort_by_title')}</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'default', label: t('products.default') },
                    { value: 'price-asc', label: t('products.price_asc') },
                    { value: 'price-desc', label: t('products.price_desc') },
                    { value: 'name-asc', label: t('products.name_asc') },
                    { value: 'popular', label: t('products.popular') },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm ${
                        sortBy === option.value
                          ? 'bg-linear-to-r from-red-500 to-orange-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4">
              <Button
                onClick={clearFilters}
                className="w-full bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                {t('products.clear_filters')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}