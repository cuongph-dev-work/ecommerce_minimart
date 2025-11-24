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
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Get unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set(products.map(p => p.brand).filter(Boolean));
    return Array.from(brandSet);
  }, [products]);

  // Load categories
  useEffect(() => {
    const abortController = new AbortController();
    
    const loadCategories = async () => {
      try {
        const cats = await categoriesService.getAll(abortController.signal);
        setCategories(cats);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load categories:', error);
        }
      }
    };

    loadCategories();

    return () => abortController.abort();
  }, []);

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
          toast.error('Không thể tải sản phẩm');
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

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, setSearchParams]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
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
          <h1 className="mb-4">Sản phẩm</h1>
          <p className="text-gray-600 max-w-2xl">
            Khám phá bộ sưu tập đầy đủ các sản phẩm công nghệ chất lượng cao
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Filter Button (Mobile) */}
              <Button variant="outline" size="lg" className="sm:hidden" onClick={() => setShowFilterSheet(true)}>
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Bộ lọc
              </Button>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            {/* Filter & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b">
              <div className="text-sm text-gray-600">
                {loading ? 'Đang tải...' : `Tìm thấy ${products.length} sản phẩm`}
              </div>
              
              {/* Desktop Filter & Sort */}
              <div className="hidden sm:flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sắp xếp:</span>
                  <Select value={sortBy} onValueChange={(value) => {
                    setSortBy(value);
                    setPage(1);
                  }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Chọn sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Mặc định</SelectItem>
                      <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                      <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                      <SelectItem value="name-asc">Tên A-Z</SelectItem>
                      <SelectItem value="popular">Bán chạy nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Thương hiệu:</span>
                    <Select value={selectedBrand} onValueChange={(value) => {
                      setSelectedBrand(value);
                      setPage(1);
                    }}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Chọn thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
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
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Tìm kiếm: "{searchQuery}"
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Danh mục: {categories.find(c => c.id === selectedCategory)?.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSelectedCategory('all')}
                    />
                  </Badge>
                )}
                {selectedBrand !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Thương hiệu: {selectedBrand}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSelectedBrand('all')}
                    />
                  </Badge>
                )}
                {sortBy !== 'default' && (
                  <Badge variant="secondary" className="gap-1">
                    {sortBy === 'price-asc' && 'Giá tăng dần'}
                    {sortBy === 'price-desc' && 'Giá giảm dần'}
                    {sortBy === 'name-asc' && 'Tên A-Z'}
                    {sortBy === 'popular' && 'Bán chạy nhất'}
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
                <h3 className="mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600">
                  Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
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
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer group"
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100 relative">
                        <ImageWithFallback
                          src={product.thumbnailUrls?.[0] || product.images?.[0] || product.image || ''}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.stock < 10 && product.stock > 0 && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full">
                            Sắp hết
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-gray-500 text-white text-xs rounded-full">
                            Hết hàng
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="text-sm text-gray-500 mb-1">
                          {product.brand || (typeof product.category === 'string' ? product.category : product.category?.name)}
                        </div>
                        <h3 className="mb-2 line-clamp-2">{product.name}</h3>
                        
                        {/* Price with Discount */}
                        <div className="mb-3">
                          {product.discount ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-purple-600">
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
                            <div className="text-lg font-semibold text-purple-600">{formatPrice(product.price)}</div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-500">
                            {product.soldCount && `Đã bán ${product.soldCount}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            Còn {product.stock}
                          </div>
                        </div>
                        <Button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
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
                      Trước
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
                      Sau
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
              <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
              <SheetDescription>
                Áp dụng các bộ lọc để tìm kiếm sản phẩm phù hợp với bạn.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              {/* Brand */}
              {brands.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Thương hiệu</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedBrand('all')}
                      className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                        selectedBrand === 'all'
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      Tất cả
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
                <h3 className="text-sm font-medium">Sắp xếp theo</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'default', label: 'Mặc định' },
                    { value: 'price-asc', label: 'Giá tăng dần' },
                    { value: 'price-desc', label: 'Giá giảm dần' },
                    { value: 'name-asc', label: 'Tên A-Z' },
                    { value: 'popular', label: 'Bán chạy nhất' },
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
                Xóa bộ lọc
              </Button>
              <Button
                onClick={() => setShowFilterSheet(false)}
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                Áp dụng
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}