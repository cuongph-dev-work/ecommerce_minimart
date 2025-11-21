import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Slider } from './ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function ProductsPage() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Get unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set(products.map(p => p.brand).filter(Boolean));
    return Array.from(brandSet);
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      const matchesRating = ratingFilter === 0 || (product.rating && product.rating >= ratingFilter);
      const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesRating && matchesBrand && matchesPrice;
    });

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      default:
        // Keep default order
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, ratingFilter, selectedBrand, priceRange, sortBy]);

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

  const getCategoryLabel = (category: string) => {
    if (category === 'all') return 'Tất cả';
    return category;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setRatingFilter(0);
    setSelectedBrand('all');
    setPriceRange([0, 50000000]);
    setSortBy('default');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || ratingFilter > 0 || selectedBrand !== 'all' || priceRange[0] > 0 || priceRange[1] < 50000000 || sortBy !== 'default';

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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
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
                onClick={() => setSelectedCategory('all')}
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
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === category.name
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
                Tìm thấy {filteredProducts.length} sản phẩm
              </div>
              
              {/* Desktop Filter & Sort */}
              <div className="hidden sm:flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sắp xếp:</span>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Chọn sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Mặc định</SelectItem>
                      <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                      <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                      <SelectItem value="name-asc">Tên A-Z</SelectItem>
                      <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                      <SelectItem value="popular">Bán chạy nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Thương hiệu:</span>
                    <Select value={selectedBrand} onValueChange={(value) => setSelectedBrand(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Chọn thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Rating Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Đánh giá:</span>
                  <Select value={ratingFilter.toString()} onValueChange={(value) => setRatingFilter(Number(value))}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Chọn đánh giá" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Tất cả</SelectItem>
                      <SelectItem value="5">5 ⭐</SelectItem>
                      <SelectItem value="4">4 ⭐ trở lên</SelectItem>
                      <SelectItem value="3">3 ⭐ trở lên</SelectItem>
                      <SelectItem value="2">2 ⭐ trở lên</SelectItem>
                      <SelectItem value="1">1 ⭐ trở lên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                    Danh mục: {selectedCategory}
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
                {ratingFilter > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {ratingFilter} ⭐ trở lên
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setRatingFilter(0)}
                    />
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 50000000) && (
                  <Badge variant="secondary" className="gap-1">
                    Giá: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setPriceRange([0, 50000000])}
                    />
                  </Badge>
                )}
                {sortBy !== 'default' && (
                  <Badge variant="secondary" className="gap-1">
                    {sortBy === 'price-asc' && 'Giá tăng dần'}
                    {sortBy === 'price-desc' && 'Giá giảm dần'}
                    {sortBy === 'name-asc' && 'Tên A-Z'}
                    {sortBy === 'rating' && 'Đánh giá cao nhất'}
                    {sortBy === 'popular' && 'Bán chạy nhất'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSortBy('default')}
                    />
                  </Badge>
                )}
              </div>
            )}

            {filteredProducts.length === 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
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
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.stock < 10 && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full">
                          Sắp hết
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="text-sm text-gray-500 mb-1">
                        {product.category}
                      </div>
                      <h3 className="mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div>{formatPrice(product.price)}</div>
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
            )}
          </div>
        </div>

        {/* Filter Sheet */}
        <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
          <SheetContent className="w-full max-w-2xl">
            <SheetHeader>
              <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
              <SheetDescription>
                Áp dụng các bộ lọc để tìm kiếm sản phẩm phù hợp với bạn.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4">
              {/* Brand */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Thương hiệu</h3>
                <div className="flex gap-2">
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
                      onClick={() => setSelectedBrand(brand)}
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

              {/* Price Range */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Khoảng giá</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-1/2 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-1/2 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Đánh giá</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRatingFilter(0)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      ratingFilter === 0
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                        ratingFilter === rating
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Star className="h-5 w-5" />
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Sắp xếp theo</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('default')}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      sortBy === 'default'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Mặc định
                  </button>
                  <button
                    onClick={() => setSortBy('price-asc')}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      sortBy === 'price-asc'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Giá tăng dần
                  </button>
                  <button
                    onClick={() => setSortBy('price-desc')}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      sortBy === 'price-desc'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Giá giảm dần
                  </button>
                  <button
                    onClick={() => setSortBy('name-asc')}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      sortBy === 'name-asc'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Tên A-Z
                  </button>
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      sortBy === 'rating'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Đánh giá cao nhất
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      sortBy === 'popular'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Bán chạy nhất
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={clearFilters}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}