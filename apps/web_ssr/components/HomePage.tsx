"use client";

import { useState, useEffect } from "react";
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
      {(loading || featuredProducts.length > 0) && (
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
      )}

      {/* Category Product Sections - Top 3 Categories by Sales */}
      {!loading &&
        topCategories.map((category) => (
          <CategoryProductSection
            key={category.id}
            categoryName={category.name}
            categorySlug={category.slug}
            products={categoryProducts[category.id] || []}
          />
        ))}
    </div>
  );
}
