import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, X, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { productsService } from '../services/products.service';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HighlightText } from './HighlightText';
import { useTranslation } from 'react-i18next';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (query: string) => void;
  searchHistory: string[];
  onRemoveHistory: (query: string) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchSuggestions({
  query,
  onSelect,
  searchHistory,
  onRemoveHistory,
  onClearHistory,
  isOpen,
  onClose,
}: SearchSuggestionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load popular searches on mount
  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        const response = await productsService.getPopularSearches(5);
        // Only set if we have actual data from API
        if (response && response.length > 0) {
          setPopularSearches(response);
        } else {
          // Don't show fallback - let it be empty
          setPopularSearches([]);
        }
      } catch (error) {
        console.error('Failed to load popular searches:', error);
        // Don't show fallback on error either
        setPopularSearches([]);
      }
    };

    loadPopularSearches();
  }, []);

  // Load suggestions when query changes
  useEffect(() => {
    const abortController = new AbortController();

    const loadSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const result = await productsService.getAll(
          { search: query, limit: 8 },
          abortController.signal
        );
        if (!abortController.signal.aborted) {
          setSuggestions(result.products);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load suggestions:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(loadSuggestions, 300);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions, searchHistory]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const totalItems = query.length >= 2 
        ? suggestions.length 
        : searchHistory.length + popularSearches.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            if (query.length >= 2 && suggestions[selectedIndex]) {
              navigate(`/products/${suggestions[selectedIndex].id}`);
              onClose();
            } else if (query.length < 2) {
              const allItems = [...searchHistory, ...popularSearches];
              if (allItems[selectedIndex]) {
                onSelect(allItems[selectedIndex]);
              }
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, suggestions, searchHistory, query, navigate, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[500px] overflow-y-auto z-50"
    >
      {/* Product Suggestions (when typing) */}
      {query.length >= 2 && (
        <div>
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b">
                Gợi ý sản phẩm
              </div>
              {suggestions.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => {
                    navigate(`/products/${product.id}`);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                    selectedIndex === index ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={product.thumbnailUrls?.[0] || product.images?.[0] || product.image || ''}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate">
                      <HighlightText text={product.name} highlight={query} />
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.brand || (typeof product.category === 'string' ? product.category : product.category?.name)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-purple-600 shrink-0">
                    {product.discount ? (
                      <div className="text-right">
                        <div>{formatPrice(product.price * (1 - product.discount / 100))}</div>
                        <div className="text-xs text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="text-sm">Không tìm thấy sản phẩm</div>
            </div>
          )}
        </div>
      )}

      {/* Search History & Popular Searches (when not typing) */}
      {query.length < 2 && (
        <div>
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b flex items-center justify-between">
                <span>Tìm kiếm gần đây</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearHistory();
                  }}
                  className="text-red-500 hover:text-red-600 text-xs"
                >
                  Xóa tất cả
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={item}
                  onClick={() => onSelect(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${
                    selectedIndex === index ? 'bg-gray-100' : ''
                  }`}
                >
                  <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="flex-1 text-left text-sm">{item}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHistory(item);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b">
                {t('search.popular_searches')}
              </div>
              {popularSearches.map((item, index) => (
              <button
                key={item}
                onClick={() => onSelect(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  selectedIndex === (searchHistory.length + index) ? 'bg-gray-100' : ''
                }`}
              >
                <TrendingUp className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="flex-1 text-left text-sm">{item}</span>
              </button>
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
