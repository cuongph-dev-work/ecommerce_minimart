"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Headphones,
  Watch,
  Package,
  Camera,
  Gamepad2,
  Home,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Refrigerator,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Product } from "../types";
import { BannerCarousel } from "./BannerCarousel";
// import { FlashSaleSection } from './FlashSaleSection';
// import { VoucherSection } from './VoucherSection';
import { CategoryProductSection } from "./CategoryProductSection";
import { ProductCard } from "./ProductCard";
import { productsService } from "../services/products.service";
import {
  categoriesService,
  CategoryWithSales,
} from "../services/categories.service";
import { useTranslation } from "react-i18next";

export function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryWithSales[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<
    Record<string, Product[]>
  >({});
  const [loading, setLoading] = useState(true);
  
  // Products list state
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const loadData = async () => {
      try {
        // Load featured products
        const featured = await productsService.getFeatured(5, signal);
        if (signal.aborted) return;
        setFeaturedProducts(featured);

        // Load top 3 categories by sales
        const topCats = await categoriesService.getTopBySales(3, signal);
        if (signal.aborted) return;
        setTopCategories(topCats);

        // Load top 6 products for each category
        const productsMap: Record<string, Product[]> = {};
        for (const category of topCats) {
          const products = await productsService.getByCategory(
            category.id,
            6,
            "sold",
            "desc",
            signal
          );
          if (signal.aborted) return;
          productsMap[category.id] = products;
        }
        setCategoryProducts(productsMap);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request cancelled");
          return;
        }
        console.error("Failed to load homepage data:", error);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      abortController.abort();
    };
  }, []);

  // Infinite scroll - load more when scrolling near bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingProducts && !isLoadingRef.current) {
          setPage((p) => p + 1);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "400px",
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
  }, [hasMore, isLoadingProducts]);

  // Load products with pagination
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const loadProducts = async () => {
      try {
        if (isLoadingRef.current) {
          return;
        }

        isLoadingRef.current = true;
        setIsLoadingProducts(true);

        if (page === 1) {
          setProducts([]);
        }

        const params: any = {
          page,
          limit: 20,
        };

        const result = await productsService.getAll(params, signal);

        if (!signal.aborted) {
          if (page === 1) {
            setProducts(result.products);
          } else {
            setProducts((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const newProducts = result.products.filter(
                (p) => !existingIds.has(p.id)
              );
              return [...prev, ...newProducts];
            });
          }

          if (result.pagination) {
            const currentPage = result.pagination.currentPage || page;
            const totalPages = result.pagination.totalPages || 1;
            setHasMore(currentPage < totalPages);
          } else {
            setHasMore(false);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to load products:", error);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoadingProducts(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadProducts();

    return () => {
      abortController.abort();
    };
  }, [page]);

  const handleCategoryClick = (
    _categoryId: string,
    _categoryName: string,
    categorySlug?: string
  ) => {
    // Navigate to products page with category, similar to MegaMenu
    const slug = categorySlug || _categoryId;
    router.push(`/products?category=${encodeURIComponent(slug)}`);
  };

  // Icon mapping for categories - using icon name from API
  const iconMap: Record<string, any> = {
    Headphones,
    Watch,
    Package,
    Camera,
    Gamepad2,
    Home,
    Monitor,
    Smartphone,
    Tablet,
    Tv,
    Refrigerator,
    Activity,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Carousel */}
      <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 mb-6">
        <BannerCarousel />
      </section>

      {/* Flash Sale Section */}
      {/* <section className="container mx-auto px-4 sm:px-6 mb-6">
        <FlashSaleSection />
      </section> */}

      {/* Voucher Section */}
      {/* <section className="container mx-auto px-4 sm:px-6 mb-6">
        <VoucherSection />
      </section> */}

      {/* Featured Products */}
      {/* {(loading || featuredProducts.length > 0) && (
        <div className="container mx-auto px-4 sm:px-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="mb-2">{t("home.featured_products")}</h2>
                <p className="text-gray-600">
                  {t("home.featured_products_subtitle")}
                </p>
              </div>
              <button
                onClick={() => router.push("/products")}
                className="hidden sm:flex items-center gap-1 text-red-500 text-sm font-medium hover:text-red-600 transition-colors group"
              >
                {t("home.view_all")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {loading ? (
              <div className="product-grid-home">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 rounded animate-pulse h-64"
                  />
                ))}
              </div>
            ) : (
              <div className="product-grid-home">
                {featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    totalProducts={featuredProducts.length}
                    showCategory={false}
                    showDescription={false}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-6 sm:hidden">
              <button
                onClick={() => router.push("/products")}
                className="flex items-center justify-center gap-1 text-red-500 text-sm font-medium hover:text-red-600 transition-colors group mx-auto"
              >
                {t("home.view_all_products")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Category Product Sections - Top 3 Categories by Sales */}
      {/* {!loading &&
        topCategories.map((category) => (
          <CategoryProductSection
            key={category.id}
            categoryName={category.name}
            categorySlug={category.slug}
            products={categoryProducts[category.id] || []}
          />
        ))} */}

      {/* Products List */}
      <div className="container mx-auto px-4 sm:px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          {isLoadingProducts && page === 1 ? (
            <div className="product-grid-products-page">
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
          ) : products.length === 0 && !isLoadingProducts ? (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <Package className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="mb-2">{t("products.no_products")}</h3>
              <p className="text-gray-600">{t("products.no_products_desc")}</p>
            </div>
          ) : (
            <div className="relative">
              <div className="product-grid-products-page">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    totalProducts={products.length}
                  />
                ))}
              </div>

              {/* Infinite Scroll Trigger & Loading Indicator */}
              {hasMore && products.length > 0 && (
                <div ref={loadMoreRef} className="flex justify-center mt-8 py-4">
                  {isLoadingProducts && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-600">{t("products.loading")}</p>
                    </div>
                  )}
                </div>
              )}

              {/* End of products indicator */}
              {!hasMore && products.length > 0 && (
                <div className="flex justify-center mt-8 py-4">
                  <p className="text-sm text-gray-500">{t("products.no_more_products")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
