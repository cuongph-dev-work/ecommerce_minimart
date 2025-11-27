import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HighlightText } from './HighlightText';
import { SearchSuggestions } from './SearchSuggestions';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]); // All categories including subcategories
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const categoryParam = searchParams.get('category') || '';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load to prevent URL update loop
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Search history
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const debouncedSearch = useDebounce(searchQuery, 500);

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
        setSelectedCategory('all');
      }
      setIsInitialLoad(false);
      return;
    }

    const resolveCategory = async () => {
      try {
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
      }
    };

    resolveCategory();
  }, [categoryParam]); // Only depend on categoryParam, not selectedCategory

  // Load products
  useEffect(() => {
    const abortController = new AbortController();
    
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        const params: any = {
          page,
          limit: 20,
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
          setProducts(result.products);
          if (result.pagination) {
            setTotalPages(result.pagination.totalPages || 1);
          }
        }
        } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load products:', error);
          toast.error(t('products.load_error'));
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => abortController.abort();
  }, [debouncedSearch, selectedCategory, selectedBrand, sortBy, page]);

  // Update URL params when selectedCategory changes (from user click)
  useEffect(() => {
    // Skip during initial load or if categories not loaded yet
    if (isInitialLoad || allCategories.length === 0) {
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
    const currentCategory = searchParams.get('category') || '';
    const currentSearch = searchParams.get('search') || '';
    const newCategory = params.get('category') || '';
    const newSearch = params.get('search') || '';
    
    // Only update if different to avoid unnecessary updates
    if (currentCategory !== newCategory || currentSearch !== newSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [searchQuery, selectedCategory, allCategories, setSearchParams, searchParams, isInitialLoad]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(t('products.add_to_cart_success', { name: product.name }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSortBy('default');
    setPage(1);
  };

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
          <h1 className="mb-4">{t('products.title')}</h1>
          <p className="text-gray-600 max-w-2xl">
            {t('products.subtitle')}
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl shadow-md p-6">
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
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all"
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
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
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
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
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
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
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
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-gray-200 rounded-2xl animate-pulse h-96" />
                ))}
              </div>
            ) : products.length === 0 ? (
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -8 }}
                      onClick={() => navigate(`/products/${product.slug}`)}
                      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer group"
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100 relative">
                        <ImageWithFallback
                          src={product.images?.[0] || product.image || ''}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.stock < 10 && product.stock > 0 && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full">
                            {t('products.almost_out')}
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-gray-500 text-white text-xs rounded-full">
                            {t('products.out_of_stock')}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="text-sm text-gray-500 mb-1">
                        {product.brand || (typeof product.category === 'string' ? product.category : product.category?.name)}
                      </div>
                      <h3 className="mb-2 line-clamp-2">
                        {debouncedSearch ? (
                          <HighlightText text={product.name} highlight={debouncedSearch} />
                        ) : (
                          product.name
                        )}
                      </h3>
                        
                        {/* Price with Discount */}
                        <div className="mb-3">
                          {product.discount ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-red-600">
                                  {formatPrice(product.price * (1 - product.discount / 100))}
                                </span>
                                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                  -{product.discount}%
                                </span>
                              </div>
                              <div className="text-sm text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-lg font-semibold text-red-600">{formatPrice(product.price)}</div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-500">
                            {product.soldCount && t('products.sold_count', { count: product.soldCount })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {t('products.stock_remaining', { stock: product.stock })}
                          </div>
                        </div>
                        <Button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? t('products.out_of_stock') : t('products.add_to_cart')}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      {t('products.previous')}
                    </Button>
                    <div className="flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`w-10 h-10 rounded-lg transition-all ${
                            page === i + 1
                              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      {t('products.next')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filter Sheet (Mobile) */}
        <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
          <SheetContent className="w-full max-w-2xl">
            <SheetHeader>
              <SheetTitle>{t('products.filter_title')}</SheetTitle>
              <SheetDescription>
                {t('products.filter_description')}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              {/* Brand */}
              {brands.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">{t('products.brand')}</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedBrand('all')}
                      className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                        selectedBrand === 'all'
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {t('products.all')}
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand!)}
                        className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                          selectedBrand === brand
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
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
                      className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                        sortBy === option.value
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex-1"
              >
                {t('products.clear_filters')}
              </Button>
              <Button
                onClick={() => setShowFilterSheet(false)}
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                {t('products.apply')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}