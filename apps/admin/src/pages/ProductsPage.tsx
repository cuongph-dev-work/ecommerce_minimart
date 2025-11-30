import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Filter, MoreHorizontal, Upload, X } from 'lucide-react';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from "@/components/ui/label";
import type { Product, Category } from '@/types';
import { productsService } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';
import axios from 'axios';
import { extractApiError, getFieldError, type ValidationError } from '@/lib/error-handler';
import { productSchema } from '@/schemas/product.schema';
import { safeParse } from 'valibot';
import { UploadHelper, type PendingFile } from '@/lib/upload-helper';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function ProductsPage() {
  useDocumentTitle('Sản phẩm');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{ total: number; totalPages: number; page: number; limit: number } | null>(null);
  const itemsPerPage = 20;

  // Form state
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDiscount, setNewProductDiscount] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductWarranty, setNewProductWarranty] = useState('');
  const [newProductIsOfficial, setNewProductIsOfficial] = useState(false);
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductSpecifications, setNewProductSpecifications] = useState('');
  const [newProductUsageGuide, setNewProductUsageGuide] = useState('');
  // Store pending files (not yet uploaded) and uploaded URLs separately
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [uploadingImages, setUploadingImages] = useState<Record<number, number>>({});

  const [newProductSubcategory, setNewProductSubcategory] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isLoadingProductDetail, setIsLoadingProductDetail] = useState(false);

  // Remove client-side filtering, use server-side search instead

  const selectedCategory = categories.find(c => c.id === newProductCategory);
  // Get children categories (with IDs) instead of just names
  const availableSubcategories = selectedCategory?.children || [];

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchCategories = async (signal?: AbortSignal) => {
    try {
      const data = await categoriesService.getAll(signal);
      // Transform API response to match frontend Category type
      const transformed = data.map((cat) => {
        // Keep children as Category objects (with id and name) for subcategory selection
        // Also maintain subcategories for backward compatibility
        let subcategories: string[] = [];
        if (cat.children && Array.isArray(cat.children) && cat.children.length > 0) {
          // Extract names for backward compatibility
          subcategories = cat.children.map((child: any) => 
            typeof child === 'object' && child !== null ? child.name : String(child)
          );
        } else if (cat.subcategories && Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
          subcategories = cat.subcategories;
        }
        
        return {
          ...cat,
          icon: cat.icon || 'Package',
          subcategories, // Keep for backward compatibility
          // Keep children as Category[] for subcategory selection (with IDs)
          children: cat.children && Array.isArray(cat.children) ? cat.children : [],
        };
      });
      setCategories(transformed);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const response = await productsService.getAll({ 
        page: currentPage, 
        limit: itemsPerPage,
        search: searchTerm || undefined,
      }, signal);
      // Transform API response to match frontend Product type
      const transformedProducts = response.products.map((p) => {
        const categoryName = typeof p.category === 'object' && p.category !== null 
          ? (p.category as { name: string }).name 
          : typeof p.category === 'string' 
            ? p.category 
            : 'Uncategorized';
        
        // Extract subcategory name if available
        const subcategoryName = typeof p.subcategory === 'object' && p.subcategory !== null
          ? (p.subcategory as { name: string }).name
          : typeof p.subcategory === 'string'
            ? p.subcategory
            : undefined;
        
        // Use thumbnail for list view, original images for detail
        const productWithImages = p as Product & { images?: string[]; thumbnailUrls?: string[] };
        const thumbnailUrl = productWithImages.thumbnailUrls?.[0] || 
                           (productWithImages.images?.[0] ? 
                             productWithImages.images[0].replace('/original/', '/thumbnail/') : 
                             '');
        return {
          ...p,
          image: thumbnailUrl, // Use thumbnail for list
          images: productWithImages.images || [], // Keep original images for detail
          category: categoryName,
          subcategory: subcategoryName, // Store subcategory name for display
        };
      });
      setProducts(transformedProducts);
      setPagination(response.pagination || null);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      // Silently fail for fetch
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, itemsPerPage]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  const handleAddImage = () => {
    if (currentImageUrl) {
      // Validate max images (5 images total: pending + uploaded + URL)
      const totalImages = pendingFiles.length + uploadedImageUrls.length;
      if (totalImages >= 5) {
        setValidationErrors([{ field: 'images', message: 'Tối đa 5 hình ảnh' }]);
        return;
      }
      // URL images are considered as uploaded (no need to upload again)
      setUploadedImageUrls([...uploadedImageUrls, currentImageUrl]);
      setCurrentImageUrl('');
      setValidationErrors(validationErrors.filter(err => err.field !== 'images'));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate max images (5 images total: pending + uploaded)
    const totalImages = pendingFiles.length + uploadedImageUrls.length;
    if (totalImages >= 5) {
      setValidationErrors([{ field: 'images', message: 'Tối đa 5 hình ảnh' }]);
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    // Validate file using UploadHelper
    const validation = UploadHelper.validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
    });

    if (!validation.valid) {
      setValidationErrors([{ field: 'images', message: validation.error || 'File không hợp lệ' }]);
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    // Create preview and add to pending files
    const preview = UploadHelper.createPreview(file);
    const pendingFile: PendingFile = {
      file,
      preview,
      id: `${Date.now()}-${Math.random()}`,
    };

    setPendingFiles([...pendingFiles, pendingFile]);
    setValidationErrors(validationErrors.filter(err => err.field !== 'images'));

    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = (type: 'pending' | 'uploaded', index: number) => {
    if (type === 'pending') {
      const file = pendingFiles[index];
      // Revoke preview URL to free memory
      UploadHelper.revokePreview(file.preview);
      setPendingFiles(pendingFiles.filter((_, i) => i !== index));
    } else {
      setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index));
    }
  };

  const handleSaveProduct = async () => {
    // Frontend validation using Valibot schema
    const formData: Record<string, unknown> = {
      name: newProductName.trim(),
      sku: newProductSku.trim(),
      price: newProductPrice ? Number(newProductPrice) : 0,
      stock: newProductStock ? Number(newProductStock) : 0,
      categoryId: newProductCategory || '',
      discount: newProductDiscount ? Number(newProductDiscount) : undefined,
      brand: newProductBrand?.trim() || undefined,
      description: newProductDescription || undefined,
      specifications: newProductSpecifications || undefined,
      usageGuide: newProductUsageGuide || undefined,
      warrantyPeriod: newProductWarranty?.trim() || undefined,
      subcategoryId: newProductSubcategory || undefined,
      isOfficial: newProductIsOfficial,
    };

    const result = safeParse(productSchema, formData);
    
    if (!result.success) {
      // Convert Valibot errors to ValidationError format
      const errors: ValidationError[] = result.issues.map((issue) => {
        const field = issue.path?.[0]?.key as string || 'name';
        return {
          field,
          message: issue.message,
        };
      });
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSaving(true);
      setValidationErrors([]);

      // Step 1: Upload pending files (only if there are any)
      let uploadedUrls: string[] = [...uploadedImageUrls];
      
      if (pendingFiles.length > 0) {
        const filesToUpload = pendingFiles.map(pf => pf.file);
        
        // Track upload progress
        const uploadProgress: Record<number, number> = {};
        setUploadingImages(uploadProgress);

        try {
          const uploadResult = await UploadHelper.uploadBatch(
            filesToUpload,
            'product',
            {
              onProgress: (progress, fileIndex) => {
                setUploadingImages(prev => ({ ...prev, [fileIndex]: progress }));
              },
            }
          );

          // Add uploaded URLs to the list
          uploadedUrls = [...uploadedUrls, ...uploadResult.uploaded.map(u => u.url)];

          // Clean up preview URLs
          pendingFiles.forEach(pf => UploadHelper.revokePreview(pf.preview));
        } catch (uploadError: unknown) {
          // Upload failed, show error and stop
          const apiError = extractApiError(uploadError);
          setValidationErrors([{ field: 'images', message: apiError.message || 'Lỗi khi upload hình ảnh' }]);
          return;
        } finally {
          setUploadingImages({});
        }
      }

      // Step 2: Create/Update product with uploaded image URLs
      const productData = {
        name: newProductName,
        description: newProductDescription,
        specifications: newProductSpecifications || undefined,
        usageGuide: newProductUsageGuide || undefined,
        price: Number(newProductPrice),
        discount: newProductDiscount ? Number(newProductDiscount) : undefined,
        stock: Number(newProductStock),
        categoryId: newProductCategory,
        subcategoryId: newProductSubcategory || undefined,
        brand: newProductBrand || undefined,
        sku: newProductSku,
        images: uploadedUrls,
        isOfficial: newProductIsOfficial,
        warrantyPeriod: newProductWarranty || undefined,
      };

      if (editingProduct) {
        await productsService.update(editingProduct.id, productData);
      } else {
        await productsService.create(productData);
      }

      // Step 3: Success - cleanup and close
      setIsAddDialogOpen(false);
      resetForm();
      await fetchProducts();
    } catch (err: unknown) {
      // If product creation fails, uploaded files will remain on server
      // TODO: Implement rollback when backend supports delete endpoint
      const apiError = extractApiError(err);
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
      } else {
        setValidationErrors([{ field: 'name', message: apiError.message }]);
      }
    } finally {
      setIsSaving(false);
      setUploadingImages({});
    }
  };

  const handleEditProduct = async (product: Product) => {
    try {
      setIsLoadingProductDetail(true);
      
      // Reload categories to ensure we have the latest data
      await fetchCategories();
      
      // Fetch full product details from API
      const fullProduct = await productsService.getById(product.id);
      
      setEditingProduct(fullProduct);
      setNewProductName(fullProduct.name);
      setNewProductPrice(fullProduct.price.toString());
      setNewProductDiscount(fullProduct.discount?.toString() || '');
      
      // Find category: can be object { id, name } or string (name)
      let categoryId = '';
      if (typeof fullProduct.category === 'object' && fullProduct.category !== null) {
        // If category is object, use its ID directly
        categoryId = (fullProduct.category as { id: string; name: string }).id || '';
      } else {
        // If category is string (name), find by name
        categoryId = categories.find(c => c.name === fullProduct.category)?.id || '';
      }
      setNewProductCategory(categoryId);
      
      // Handle subcategory: can be Category object (from API) or string (legacy)
      let subcategoryId = '';
      if (fullProduct.subcategory) {
        if (typeof fullProduct.subcategory === 'object' && fullProduct.subcategory !== null) {
          // If subcategory is Category object, get its ID
          subcategoryId = (fullProduct.subcategory as any).id || '';
        } else {
          // If subcategory is string (name), find ID from available subcategories
          const selectedCat = categories.find(c => c.id === categoryId);
          if (selectedCat?.children) {
            const subCat = selectedCat.children.find((child: any) => 
              (typeof child === 'object' ? child.name : child) === fullProduct.subcategory
            );
            subcategoryId = subCat && typeof subCat === 'object' ? subCat.id : '';
          }
        }
      }
      setNewProductSubcategory(subcategoryId);
      setNewProductStock(fullProduct.stock.toString());
      setNewProductBrand(fullProduct.brand || '');
      setNewProductSku(fullProduct.sku || '');
      setNewProductWarranty(fullProduct.warrantyPeriod || '');
      setNewProductIsOfficial(fullProduct.isOfficial || false);
      setNewProductDescription(fullProduct.description || '');
      setNewProductSpecifications(fullProduct.specifications || '');
      setNewProductUsageGuide(fullProduct.usageGuide || '');
      
      // When editing, images are already uploaded URLs
      setUploadedImageUrls(fullProduct.images || (fullProduct.image ? [fullProduct.image] : []));
      setPendingFiles([]);
      setIsAddDialogOpen(true);
    } catch (err: unknown) {
      console.error('Failed to load product details:', err);
      const apiError = extractApiError(err);
      setValidationErrors([{ field: 'name', message: apiError.message || 'Không thể tải thông tin sản phẩm' }]);
    } finally {
      setIsLoadingProductDetail(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productsService.delete(id);
      setProductToDelete(null);
      await fetchProducts();
    } catch (err: unknown) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleToggleIsHidden = async (product: Product) => {
    try {
      const newIsHidden = !product.isHidden;
      await productsService.update(product.id, { isHidden: newIsHidden });
      // Update local state immediately for better UX
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, isHidden: newIsHidden } : p
      ));
    } catch (err: unknown) {
      console.error('Failed to toggle isHidden:', err);
      const apiError = extractApiError(err);
      alert(apiError.message || 'Không thể cập nhật trạng thái ẩn/hiện');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setNewProductName('');
    setNewProductPrice('');
    setNewProductDiscount('');
    setNewProductCategory('');
    setNewProductSubcategory('');
    setNewProductStock('');
    setNewProductBrand('');
    setNewProductSku('');
    setNewProductWarranty('');
    setNewProductIsOfficial(false);
    setNewProductDescription('');
    setNewProductSpecifications('');
    setNewProductUsageGuide('');
    
    // Clean up preview URLs before clearing state
    pendingFiles.forEach(pf => UploadHelper.revokePreview(pf.preview));
    setPendingFiles([]);
    setUploadedImageUrls([]);
    setCurrentImageUrl('');
    setUploadingImages({});
    setValidationErrors([]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sản phẩm</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý danh mục sản phẩm và kho hàng.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? 'Cập nhật thông tin sản phẩm bên dưới.' 
                  : 'Điền thông tin để thêm sản phẩm mới vào danh mục.'}
              </DialogDescription>
            </DialogHeader>
            
            {isLoadingProductDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Đang tải thông tin sản phẩm...</p>
                </div>
              </div>
            ) : (
            <div className="grid gap-6 py-6">
              {/* Images Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Hình ảnh sản phẩm</Label>
                  <span className="text-xs text-muted-foreground">
                    {pendingFiles.length + uploadedImageUrls.length}/5 ảnh (tối đa 5MB mỗi ảnh)
                  </span>
                </div>
                
                {/* Upload Methods */}
                <div className="space-y-3">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="text-sm font-medium">
                      Upload từ máy tính
                    </Label>
                    <Input 
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                      disabled={Object.keys(uploadingImages).length > 0 || (pendingFiles.length + uploadedImageUrls.length) >= 5}
                    />
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="image-url" className="text-sm font-medium">
                      Nhập URL hình ảnh
                    </Label>
                    <div className="flex gap-2">
                      <Input 
                        id="image-url"
                        placeholder="https://example.com/image.jpg" 
                        value={currentImageUrl}
                        onChange={(e) => {
                          setCurrentImageUrl(e.target.value);
                          if (getFieldError(validationErrors, 'images')) {
                            setValidationErrors(validationErrors.filter(err => err.field !== 'images'));
                          }
                        }}
                        disabled={Object.keys(uploadingImages).length > 0 || (pendingFiles.length + uploadedImageUrls.length) >= 5}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleAddImage}
                        disabled={!currentImageUrl || Object.keys(uploadingImages).length > 0 || (pendingFiles.length + uploadedImageUrls.length) >= 5}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                </div>

                {getFieldError(validationErrors, 'images') && (
                  <p className="text-sm text-destructive">
                    {getFieldError(validationErrors, 'images')}
                  </p>
                )}

                {/* Image Preview Grid */}
                {(pendingFiles.length > 0 || uploadedImageUrls.length > 0 || Object.keys(uploadingImages).length > 0) ? (
                  <div className="grid grid-cols-4 gap-4">
                    {/* Pending files (not yet uploaded) */}
                    {pendingFiles.map((pendingFile, index) => (
                      <div key={pendingFile.id} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted border-dashed border-primary/30">
                        <img src={pendingFile.preview} alt={`Pending ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-yellow-500/80 text-white text-xs rounded">
                          Chờ upload
                        </div>
                        <button
                          onClick={() => handleRemoveImage('pending', index)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Uploaded URLs */}
                    {uploadedImageUrls.map((url, index) => (
                      <div key={`uploaded-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img src={url} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveImage('uploaded', index)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Upload progress indicators */}
                    {Object.entries(uploadingImages).map(([index, progress]) => (
                      <div key={`uploading-${index}`} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                        <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
                          <div className="text-xs text-muted-foreground mb-2">Đang upload...</div>
                          <div className="w-3/4 h-1 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/30">
                    <Upload className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">Chưa có hình ảnh</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Tên sản phẩm <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={newProductName}
                    onChange={(e) => {
                      setNewProductName(e.target.value);
                      // Clear error when user starts typing
                      if (getFieldError(validationErrors, 'name')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'name'));
                      }
                    }}
                    placeholder="Ví dụ: Tai nghe không dây"
                    className={getFieldError(validationErrors, 'name') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'name') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'name')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">Mã SKU <span className="text-destructive">*</span></Label>
                  <Input
                    id="sku"
                    value={newProductSku}
                    onChange={(e) => {
                      setNewProductSku(e.target.value);
                      if (getFieldError(validationErrors, 'sku')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'sku'));
                      }
                    }}
                    placeholder="Ví dụ: WH-1000XM4"
                    className={getFieldError(validationErrors, 'sku') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'sku') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'sku')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Thương hiệu</Label>
                  <Input
                    id="brand"
                    value={newProductBrand}
                    onChange={(e) => {
                      setNewProductBrand(e.target.value);
                      if (getFieldError(validationErrors, 'brand')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'brand'));
                      }
                    }}
                    placeholder="Ví dụ: Sony"
                    className={getFieldError(validationErrors, 'brand') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'brand') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'brand')}
                    </p>
                  )}
                </div>

                {/* Pricing & Stock */}
                <div className="space-y-2">
                  <Label htmlFor="price">Giá (VND) <span className="text-destructive">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProductPrice}
                    onChange={(e) => {
                      setNewProductPrice(e.target.value);
                      if (getFieldError(validationErrors, 'price')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'price'));
                      }
                    }}
                    placeholder="0"
                    className={getFieldError(validationErrors, 'price') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'price') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'price')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Giảm giá (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={newProductDiscount}
                    onChange={(e) => {
                      setNewProductDiscount(e.target.value);
                      if (getFieldError(validationErrors, 'discount')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'discount'));
                      }
                    }}
                    placeholder="0"
                    className={getFieldError(validationErrors, 'discount') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'discount') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'discount')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Số lượng tồn kho <span className="text-destructive">*</span></Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProductStock}
                    onChange={(e) => {
                      setNewProductStock(e.target.value);
                      if (getFieldError(validationErrors, 'stock')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'stock'));
                      }
                    }}
                    placeholder="0"
                    className={getFieldError(validationErrors, 'stock') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'stock') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'stock')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục <span className="text-destructive">*</span></Label>
                  <Select 
                    value={newProductCategory} 
                    onValueChange={(value) => {
                      setNewProductCategory(value);
                      setNewProductSubcategory(''); // Reset subcategory when category changes
                      if (getFieldError(validationErrors, 'categoryId')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'categoryId'));
                      }
                    }}
                  >
                    <SelectTrigger className={getFieldError(validationErrors, 'categoryId') ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError(validationErrors, 'categoryId') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'categoryId')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Danh mục con</Label>
                  <Select 
                    value={newProductSubcategory} 
                    onValueChange={setNewProductSubcategory}
                    disabled={!newProductCategory || availableSubcategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !newProductCategory 
                          ? "Chọn danh mục trước" 
                          : availableSubcategories.length === 0 
                            ? "Không có danh mục con" 
                            : "Chọn danh mục con"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubcategories.map((sub: any) => {
                        // sub can be Category object (with id and name) or string (for backward compatibility)
                        const subId = typeof sub === 'object' && sub !== null ? sub.id : sub;
                        const subName = typeof sub === 'object' && sub !== null ? sub.name : sub;
                        return (
                          <SelectItem key={subId} value={subId}>
                            {subName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty Period</Label>
                  <Input
                    id="warranty"
                    value={newProductWarranty}
                    onChange={(e) => setNewProductWarranty(e.target.value)}
                    placeholder="e.g. 12 months"
                  />
                </div>

                {/* Attributes */}
                <div className="space-y-2 flex items-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="official" 
                      checked={newProductIsOfficial}
                      onCheckedChange={(checked: boolean) => setNewProductIsOfficial(checked)}
                    />
                    <Label htmlFor="official" className="font-normal cursor-pointer">
                      Sản phẩm chính hãng (100% Authentic)
                    </Label>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Mô tả sản phẩm</Label>
                  <RichTextEditor
                    value={newProductDescription}
                    onChange={(html) => {
                      setNewProductDescription(html);
                      if (getFieldError(validationErrors, 'description')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'description'));
                      }
                    }}
                    placeholder="Mô tả chi tiết sản phẩm..."
                  />
                  {getFieldError(validationErrors, 'description') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'description')}
                    </p>
                  )}
                </div>

                {/* Specifications */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="specifications">Thông số kỹ thuật</Label>
                  <RichTextEditor
                    value={newProductSpecifications}
                    onChange={(html) => {
                      setNewProductSpecifications(html);
                      if (getFieldError(validationErrors, 'specifications')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'specifications'));
                      }
                    }}
                    placeholder="Nhập thông số kỹ thuật của sản phẩm..."
                  />
                  {getFieldError(validationErrors, 'specifications') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'specifications')}
                    </p>
                  )}
                </div>

                {/* Usage Guide */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="usageGuide">Hướng dẫn sử dụng</Label>
                  <RichTextEditor
                    value={newProductUsageGuide}
                    onChange={(html) => {
                      setNewProductUsageGuide(html);
                      if (getFieldError(validationErrors, 'usageGuide')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'usageGuide'));
                      }
                    }}
                    placeholder="Nhập hướng dẫn sử dụng sản phẩm..."
                  />
                  {getFieldError(validationErrors, 'usageGuide') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'usageGuide')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving || isLoadingProductDetail}>
                Hủy
              </Button>
              <Button type="submit" onClick={handleSaveProduct} disabled={isSaving || isLoadingProductDetail}>
                {isSaving ? 'Đang lưu...' : editingProduct ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10 bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 when search changes
            }}
          />
        </div>
        <Button variant="outline" className="ml-auto">
          <Filter className="mr-2 h-4 w-4" /> Bộ lọc
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Hình ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[100px]">Ẩn/Hiện</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Đang tải sản phẩm...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy sản phẩm
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
              <TableRow key={product.id} className="group">
                <TableCell>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{product.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {product.brand} {product.sku ? `• ${product.sku}` : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {typeof product.category === 'string' ? product.category : (product.category as { name: string })?.name || 'Uncategorized'}
                    </span>
                    {product.subcategory && (
                      <>
                        <span className="text-muted-foreground text-xs">/</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {product.subcategory}
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(product.price)}
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Còn hàng
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Hết hàng
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleToggleIsHidden(product)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        product.isHidden ? 'bg-muted' : 'bg-primary'
                      }`}
                      role="switch"
                      aria-checked={!product.isHidden}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          product.isHidden ? 'translate-x-1' : 'translate-x-6'
                        }`}
                      />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        handleEditProduct(product);
                      }}>
                        <Edit className="mr-2 h-4 w-4" /> Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => {
                          e.preventDefault();
                          setProductToDelete(product.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Trang {pagination.page} / {pagination.totalPages} ({pagination.total} sản phẩm)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isLoading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages || isLoading}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductToDelete(null)}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
