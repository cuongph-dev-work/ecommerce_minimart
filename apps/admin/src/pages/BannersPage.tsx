import { useState, useEffect } from 'react';
import { bannersService } from '@/services/banners.service';
import axios from 'axios';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, MoreHorizontal, X } from 'lucide-react';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractApiError, getFieldError, type ValidationError } from '@/lib/error-handler';
import { bannerSchema } from '@/schemas/banner.schema';
import { safeParse } from 'valibot';
import { UploadHelper, type PendingFile } from '@/lib/upload-helper';
import { Upload } from 'lucide-react';
import type { Banner } from '@/services/banners.service';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

// Banner interface is now imported from service

export function BannersPage() {
  useDocumentTitle('Banner');
  const [searchTerm, setSearchTerm] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const fetchBanners = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const response = await bannersService.getAll({ 
        page: 1, 
        limit: 100,
        search: searchTerm || undefined,
      }, signal);
      setBanners(response.banners || []);
    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        return;
      }
      // Silently fail for fetch
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchBanners(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);


  // Form state
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerDescription, setNewBannerDescription] = useState('');
  const [newBannerLink, setNewBannerLink] = useState('');
  const [newBannerStatus, setNewBannerStatus] = useState<'active' | 'inactive'>('active');
  const [newBannerSortOrder, setNewBannerSortOrder] = useState('1');
  
  // Image upload state
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddImageUrl = () => {
    if (currentImageUrl) {
      if (pendingFile) {
        UploadHelper.revokePreview(pendingFile.preview);
        setPendingFile(null);
      }
      setUploadedImageUrl(currentImageUrl);
      setCurrentImageUrl('');
      setValidationErrors(validationErrors.filter(err => err.field !== 'image'));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file using UploadHelper
    const validation = UploadHelper.validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
    });

    if (!validation.valid) {
      setValidationErrors([{ field: 'image', message: validation.error || 'File không hợp lệ' }]);
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    // Create preview and add to pending files
    const preview = UploadHelper.createPreview(file);
    const pending: PendingFile = {
      file,
      preview,
      id: `${Date.now()}-${Math.random()}`,
    };

    // Clear uploaded URL if exists
    setUploadedImageUrl('');
    setPendingFile(pending);
    setValidationErrors(validationErrors.filter(err => err.field !== 'image'));

    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    if (pendingFile) {
      UploadHelper.revokePreview(pendingFile.preview);
      setPendingFile(null);
    }
    setUploadedImageUrl('');
    setCurrentImageUrl('');
    setValidationErrors(validationErrors.filter(err => err.field !== 'image'));
  };


  const handleSaveBanner = async () => {
    // Frontend validation using Valibot schema
    const formData: Record<string, unknown> = {
      title: newBannerTitle.trim(),
      description: newBannerDescription?.trim() || undefined,
      link: newBannerLink?.trim() || undefined,
      status: newBannerStatus,
      sortOrder: newBannerSortOrder ? Number(newBannerSortOrder) : undefined,
      // Image will be set after upload
    };

    // Check if image is available
    if (!pendingFile && !uploadedImageUrl) {
      setValidationErrors([{ field: 'image', message: 'Hình ảnh là bắt buộc' }]);
      return;
    }

    const result = safeParse(bannerSchema, {
      ...formData,
      image: uploadedImageUrl || 'placeholder', // Will be replaced after upload
    });
    
    if (!result.success) {
      // Convert Valibot errors to ValidationError format
      const errors: ValidationError[] = result.issues.map((issue) => {
        const field = issue.path?.[0]?.key as string || 'title';
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

      // Step 1: Upload image if there's a pending file
      let imageUrl = uploadedImageUrl;
      
      if (pendingFile) {
        setUploadingImage(0);
        try {
          const uploadResult = await UploadHelper.uploadBatch(
            [pendingFile.file],
            'banner',
            {
              onProgress: (progress) => {
                setUploadingImage(progress);
              },
            }
          );

          imageUrl = uploadResult.uploaded[0]?.url || '';
          if (!imageUrl) {
            setValidationErrors([{ field: 'image', message: 'Lỗi khi upload hình ảnh' }]);
            return;
          }

          // Clean up preview URL
          UploadHelper.revokePreview(pendingFile.preview);
        } catch (uploadError: unknown) {
          const apiError = extractApiError(uploadError);
          setValidationErrors([{ field: 'image', message: apiError.message || 'Lỗi khi upload hình ảnh' }]);
          return;
        } finally {
          setUploadingImage(null);
        }
      }

      // Step 2: Create/Update banner with uploaded image URL
      const bannerData = {
        title: newBannerTitle,
        description: newBannerDescription || undefined,
        image: imageUrl,
        link: newBannerLink || undefined,
        status: newBannerStatus,
        sortOrder: newBannerSortOrder ? Number(newBannerSortOrder) : undefined,
      };

      if (editingBanner) {
        await bannersService.update(editingBanner.id, bannerData);
      } else {
        await bannersService.create(bannerData);
      }

      setIsAddDialogOpen(false);
      resetForm();
      await fetchBanners();
    } catch (err: unknown) {
      const apiError = extractApiError(err);
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
      } else {
        setValidationErrors([{ field: 'title', message: apiError.message }]);
      }
    } finally {
      setIsSaving(false);
      setUploadingImage(null);
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setNewBannerTitle(banner.title);
    setNewBannerDescription(banner.description || '');
    setNewBannerLink(banner.link || '');
    setNewBannerStatus(banner.status as 'active' | 'inactive');
    setNewBannerSortOrder(banner.sortOrder.toString());
    // When editing, image is already uploaded URL
    setUploadedImageUrl(banner.image);
    setPendingFile(null);
    setCurrentImageUrl('');
    setIsAddDialogOpen(true);
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await bannersService.delete(id);
      setBannerToDelete(null);
      await fetchBanners();
    } catch (err: unknown) {
      console.error('Failed to delete banner:', err);
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setNewBannerTitle('');
    setNewBannerDescription('');
    setNewBannerLink('');
    setNewBannerStatus('active');
    setNewBannerSortOrder('1');
    
    // Clean up image state
    if (pendingFile) {
      UploadHelper.revokePreview(pendingFile.preview);
    }
    setPendingFile(null);
    setUploadedImageUrl('');
    setCurrentImageUrl('');
    setUploadingImage(null);
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
          <h2 className="text-3xl font-bold tracking-tight">Banners</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý banner slider trên trang chủ
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Thêm Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}</DialogTitle>
              <DialogDescription>
                {editingBanner ? 'Cập nhật thông tin banner' : 'Thêm banner mới vào slider trang chủ'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              {/* Image Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Hình ảnh banner <span className="text-destructive">*</span></Label>
                  <span className="text-xs text-muted-foreground">
                    Tối đa 5MB
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
                      disabled={uploadingImage !== null}
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
                          if (getFieldError(validationErrors, 'image')) {
                            setValidationErrors(validationErrors.filter(err => err.field !== 'image'));
                          }
                        }}
                        disabled={uploadingImage !== null}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleAddImageUrl}
                        disabled={!currentImageUrl || uploadingImage !== null}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                </div>

                {getFieldError(validationErrors, 'image') && (
                  <p className="text-sm text-destructive">
                    {getFieldError(validationErrors, 'image')}
                  </p>
                )}

                {/* Image Preview */}
                {(pendingFile || uploadedImageUrl || uploadingImage !== null) ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    {uploadingImage !== null ? (
                      <div className="w-full h-48 flex flex-col items-center justify-center bg-muted/50">
                        <div className="text-sm text-muted-foreground mb-2">Đang upload...</div>
                        <div className="w-3/4 h-1 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadingImage}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <img 
                          src={pendingFile?.preview || uploadedImageUrl} 
                          alt="Preview" 
                          className="w-full h-48 object-cover" 
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {pendingFile && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-yellow-500/80 text-white text-xs rounded">
                            Chờ upload
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/30">
                    <Upload className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">Chưa có hình ảnh</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={newBannerTitle}
                  onChange={(e) => {
                    setNewBannerTitle(e.target.value);
                    if (getFieldError(validationErrors, 'title')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'title'));
                    }
                  }}
                  placeholder="FLASH SALE 12.12"
                  className={getFieldError(validationErrors, 'title') ? 'border-destructive' : ''}
                />
                {getFieldError(validationErrors, 'title') && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError(validationErrors, 'title')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={newBannerDescription}
                  onChange={(e) => {
                    setNewBannerDescription(e.target.value);
                    if (getFieldError(validationErrors, 'description')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'description'));
                    }
                  }}
                  placeholder="Giảm đến 50% cho tất cả sản phẩm..."
                  className={`min-h-[80px] ${getFieldError(validationErrors, 'description') ? 'border-destructive' : ''}`}
                />
                {getFieldError(validationErrors, 'description') && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError(validationErrors, 'description')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Link chuyển hướng</Label>
                <Input
                  value={newBannerLink}
                  onChange={(e) => setNewBannerLink(e.target.value)}
                  placeholder="/products"
                />
              </div>

              <div className="space-y-2">
                <Label>Thứ tự hiển thị</Label>
                <Input
                  type="number"
                  value={newBannerSortOrder}
                  onChange={(e) => setNewBannerSortOrder(e.target.value)}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={newBannerStatus} onValueChange={(v: 'active' | 'inactive') => setNewBannerStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hiển thị</SelectItem>
                    <SelectItem value="inactive">Ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                Hủy
              </Button>
              <Button onClick={handleSaveBanner} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : editingBanner ? 'Cập nhật' : 'Lưu'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm banner..."
            className="pl-10 bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Hình ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading banners...
                </TableCell>
              </TableRow>
            ) : filteredBanners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No banners found
                </TableCell>
              </TableRow>
            ) : (
              filteredBanners.map((banner) => (
              <TableRow key={banner.id} className="group">
                <TableCell>
                  <div className="w-20 h-12 rounded-lg overflow-hidden bg-muted border border-border">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{banner.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {banner.description}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{banner.link}</TableCell>
                <TableCell>{banner.sortOrder}</TableCell>
                <TableCell>
                  {banner.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Hiển thị
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                      Ẩn
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleEditBanner(banner)}>
                        <Edit className="mr-2 h-4 w-4" /> Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setBannerToDelete(banner.id)}
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
      </div>

      <Dialog open={!!bannerToDelete} onOpenChange={(open) => !open && setBannerToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa banner</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBannerToDelete(null)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={() => bannerToDelete && handleDeleteBanner(bannerToDelete)}
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

