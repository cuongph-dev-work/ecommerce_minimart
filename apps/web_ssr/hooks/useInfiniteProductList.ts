import { useState, useEffect, useRef, useCallback } from "react";
import { productsService } from "../services/products.service";
import { Product } from "../types";

interface UseInfiniteProductListProps {
  initialLimit?: number;
}

export function useInfiniteProductList({ initialLimit = 20 }: UseInfiniteProductListProps = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [realProducts, setRealProducts] = useState<Product[]>([]); // Store unique products from API
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRealMore, setHasRealMore] = useState(true);
  const [hasFinishedDuplication, setHasFinishedDuplication] = useState(false);
  
  // Ref to track if we are currently loading to prevent duplicate requests
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadOriginalData = useCallback(async (currentPage: number, signal?: AbortSignal) => {
    try {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setIsLoading(true);

      const params = {
        page: currentPage,
        limit: initialLimit,
      };

      const result = await productsService.getAll(params, signal);

      if (!isMountedRef.current) return;

      if (currentPage === 1) {
        setProducts(result.products);
        setRealProducts(result.products);
      } else {
        setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newProducts = result.products.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newProducts];
        });
        setRealProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newProducts = result.products.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newProducts];
        });
      }

      if (result.pagination) {
        const totalPages = result.pagination.totalPages || 1;
        setHasRealMore(currentPage < totalPages);
      } else {
        setHasRealMore(false);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to load products:", error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }
  }, [initialLimit]);

  // Ref to track offset for fake pagination
  const fakeOffsetRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;

    if (hasRealMore) {
        // Increment page for next effect trigger
        setPage(p => p + 1);
    } else {
        // FAKE MODE: Duplicate the list in chunks
        if (hasFinishedDuplication) return;

        isLoadingRef.current = true;
        setIsLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!isMountedRef.current) return;

        // Calculate next chunk from realProducts
        const start = fakeOffsetRef.current;
        let end = start + initialLimit;
        
        let newFakeProducts: Product[] = [];

        if (end >= realProducts.length) {
            // Reached the end of duplication
            newFakeProducts = realProducts.slice(start);
            setHasFinishedDuplication(true);
        } else {
            // Normal slice
            newFakeProducts = realProducts.slice(start, end);
            fakeOffsetRef.current = end;
        }

        setProducts(prev => [...prev, ...newFakeProducts]);
        setIsLoading(false);
        isLoadingRef.current = false;
    }
  }, [hasRealMore, realProducts, initialLimit, hasFinishedDuplication]);

  // Initial Load & Real Pagination
  useEffect(() => {
    const abortController = new AbortController();
    
    // Only fetch if we have real more data. 
    // If !hasRealMore, the loadMore function handles the fake append locally and doesn't depend on this effect.
    if (hasRealMore) {
        loadOriginalData(page, abortController.signal);
    }

    return () => {
      abortController.abort();
    };
  }, [page, hasRealMore, loadOriginalData]);

  const hasMore = hasRealMore || (!hasFinishedDuplication && realProducts.length > 0);

  return {
    products,
    isLoading,
    hasMore,
    loadMore,
    isRealDataLoading: isLoading && hasRealMore
  };
}
