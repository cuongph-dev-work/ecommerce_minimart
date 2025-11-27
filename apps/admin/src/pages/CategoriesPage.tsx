import { useState, useEffect, Fragment } from 'react';
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
import { Plus, Search, Edit, Trash2, MoreHorizontal, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as Icons from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Category } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesService } from '@/services/categories.service';
import axios from 'axios';
import { extractApiError, getFieldError, type ValidationError } from '@/lib/error-handler';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const AVAILABLE_ICONS = [
  'Package',
  'Headphones',
  'Watch',
  'Camera',
  'Gamepad2',
  'Home',
  'Monitor',
  'Smartphone',
  'Tablet',
  'Tv',
  'Refrigerator',
  'Activity',
  'Shirt',
  'Footprints',
  'Coffee',
  'Utensils',
];

export function CategoriesPage() {
  useDocumentTitle('Danh mục');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{ id: string, parentId: string, name: string } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Package');
  const [selectedParentId, setSelectedParentId] = useState<string>('none');

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchCategories = async (signal?: AbortSignal, forceRefresh = false) => {
    try {
      setIsLoading(true);
      // Add cache busting timestamp if force refresh
      const params = forceRefresh ? { _t: Date.now() } : {};
      const data = await categoriesService.getAll(signal, params);
      // Transform API response to match frontend Category type
      const transformed = data.map((cat: any) => ({
        ...cat,
        icon: cat.icon || 'Package',
        // Use children from API (subcategories as Category records)
        children: cat.children && Array.isArray(cat.children) ? cat.children : [],
        // Keep subcategories for backward compatibility (array of names)
        subcategories: cat.children && Array.isArray(cat.children) && cat.children.length > 0
          ? cat.children.map((child: any) => child.name)
          : (cat.subcategories && Array.isArray(cat.subcategories) ? cat.subcategories : []),
        productCount: cat.products?.length || cat.productCount || 0,
      }));
      setCategories(transformed);
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      // Silently fail for fetch operations
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    // Check if category name matches
    if (category.name.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Check if any subcategory (child) name matches
    if (category.children && category.children.length > 0) {
      return category.children.some(child => 
        child.name.toLowerCase().includes(searchLower)
      );
    }
    
    return false;
  });

  // Auto-expand categories that have matching subcategories when searching
  useEffect(() => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const categoriesToExpand = categories
        .filter(cat => {
          // Don't expand if category name itself matches
          if (cat.name.toLowerCase().includes(searchLower)) return false;
          // Expand if any subcategory matches
          return cat.children?.some(child => 
            child.name.toLowerCase().includes(searchLower)
          );
        })
        .map(cat => cat.id);
      
      if (categoriesToExpand.length > 0) {
        setExpandedCategories(prev => {
          const combined = [...new Set([...prev, ...categoriesToExpand])];
          return combined;
        });
      }
    } else {
      // Clear expanded categories when search is cleared
      setExpandedCategories([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSaveCategory = async () => {
    // Frontend validation
    if (!newCategoryName || newCategoryName.trim().length === 0) {
      setValidationErrors([{ field: 'name', message: 'Tên danh mục không được để trống' }]);
      return;
    }

    if (newCategoryName.length > 100) {
      setValidationErrors([{ field: 'name', message: 'Tên danh mục không được vượt quá 100 ký tự' }]);
      return;
    }

    if (newCategoryDescription && newCategoryDescription.length > 500) {
      setValidationErrors([{ field: 'description', message: 'Mô tả không được vượt quá 500 ký tự' }]);
      return;
    }

    try {
      setIsSaving(true);
      setValidationErrors([]);

      if (editingSubcategory) {
        // Subcategory editing - update subcategory as a Category record
        await categoriesService.update(editingSubcategory.id, {
          name: newCategoryName,
        });
        setEditingSubcategory(null);
      } else if (editingCategory) {
        // Edit existing category (parent cannot be changed)
        await categoriesService.update(editingCategory.id, {
          name: newCategoryName,
          description: newCategoryDescription,
          icon: newCategoryIcon,
        });
        setEditingCategory(null);
      } else {
        // Add new category
        await categoriesService.create({
          name: newCategoryName,
          description: newCategoryDescription,
          icon: newCategoryIcon,
          parentId: selectedParentId !== 'none' ? selectedParentId : undefined,
        });
      }

      setIsAddDialogOpen(false);
      resetForm();
      // Force refresh to bypass cache
      await fetchCategories(undefined, true);
    } catch (err: any) {
      const apiError = extractApiError(err);
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
      } else {
        // If no specific field errors, show general error in name field
        setValidationErrors([{ field: 'name', message: apiError.message }]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (category: Category) => {
    // Reset subcategory editing state when editing a category
    setEditingSubcategory(null);
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setNewCategoryIcon(category.icon);
    // Set parentId if category has a parent (check if it's a subcategory)
    // We need to find the parent by checking if any category has this as a child
    const parentCategory = categories.find(cat => 
      cat.children?.some(child => child.id === category.id)
    );
    setSelectedParentId(parentCategory?.id || 'none');
    setIsAddDialogOpen(true);
  };

  const handleEditSubcategory = (subcategoryId: string, parentId: string, name: string) => {
    setEditingSubcategory({ id: subcategoryId, parentId, name });
    setNewCategoryName(name);
    setSelectedParentId(parentId); // Set parent to show context, though we might hide the select
    setIsAddDialogOpen(true);
  };

  const handleDeleteSubcategory = async (id: string) => {
    try {
      await categoriesService.delete(id);
      setSubcategoryToDelete(null);
      // Force refresh to bypass cache
      await fetchCategories(undefined, true);
    } catch (err: any) {
      // Silently fail or show toast notification
      console.error('Failed to delete subcategory:', err);
    }
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await categoriesService.delete(id);
      setCategoryToDelete(null);
      // Force refresh to bypass cache
      await fetchCategories(undefined, true);
    } catch (err: any) {
      // Silently fail or show toast notification
      console.error('Failed to delete category:', err);
    }
  };

  const resetForm = () => {
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryIcon('Package');
    setSelectedParentId('none');
    setEditingCategory(null);
    setEditingSubcategory(null);
    setValidationErrors([]);
  };

  // Helper to render dynamic icon
  const renderIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Package;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Danh mục</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý danh mục sản phẩm và danh mục con.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (open) {
            // Reset form when opening dialog to ensure clean state for "Add" mode
            resetForm();
          }
          setIsAddDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory ? 'Sửa danh mục con' : editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
              </DialogTitle>
              <DialogDescription>
                {editingSubcategory ? 'Cập nhật tên danh mục con.' : editingCategory ? 'Cập nhật thông tin danh mục.' : 'Tạo danh mục hoặc danh mục con mới.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {!editingCategory && !editingSubcategory && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">
                    Danh mục cha
                  </Label>
                  <div className="col-span-3">
                    <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục cha" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không (Cấp cao nhất)</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên <span className="text-destructive">*</span>
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className={getFieldError(validationErrors, 'name') ? 'border-destructive' : 'col-span-3'}
                    placeholder={selectedParentId !== 'none' && !editingCategory ? "Tên danh mục con" : "Tên danh mục"}
                  />
                  {getFieldError(validationErrors, 'name') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'name')}
                    </p>
                  )}
                </div>
              </div>
              
              {!editingSubcategory && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Mô tả
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="description"
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                        className={getFieldError(validationErrors, 'description') ? 'border-destructive' : ''}
                      />
                      {getFieldError(validationErrors, 'description') && (
                        <p className="text-sm text-destructive mt-1">
                          {getFieldError(validationErrors, 'description')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="icon" className="text-right">
                      Biểu tượng
                    </Label>
                    <div className="col-span-3">
                      <Select value={newCategoryIcon} onValueChange={setNewCategoryIcon}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn biểu tượng" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ICONS.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center gap-2">
                                {renderIcon(icon)}
                                <span>{icon}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                Hủy
              </Button>
              <Button type="submit" onClick={handleSaveCategory} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm danh mục..."
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
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[80px]">Biểu tượng</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục con</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
              <Fragment key={category.id}>
                <TableRow className="group hover:bg-muted/30">
                  <TableCell>
                    {category.children && category.children.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => toggleExpand(category.id)}
                      >
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {renderIcon(category.icon)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{category.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {category.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(category.children || []).slice(0, 3).map((child) => (
                        <span key={child.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                          {child.name}
                        </span>
                      ))}
                      {category.children && category.children.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                          +{category.children.length - 3} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                      {category.productCount} Products
                    </span>
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
                          handleEditClick(category);
                        }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            setCategoryToDelete(category.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <AnimatePresence>
                  {expandedCategories.includes(category.id) && category.children && category.children.length > 0 && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={6} className="p-0">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pl-16 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {category.children.map((child) => (
                              <div key={child.id} className="group/sub flex items-center justify-between gap-2 text-sm text-muted-foreground p-2 rounded-md hover:bg-background border border-transparent hover:border-border transition-colors">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                  {child.name}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => handleEditSubcategory(child.id, category.id, child.name)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={() => setSubcategoryToDelete({ id: child.id, name: child.name })}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </Fragment>
            ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => categoryToDelete && handleDeleteClick(categoryToDelete)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Confirmation Dialog */}
      <Dialog open={!!subcategoryToDelete} onOpenChange={(open) => !open && setSubcategoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa danh mục con</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục con "{subcategoryToDelete?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubcategoryToDelete(null)}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => subcategoryToDelete && handleDeleteSubcategory(subcategoryToDelete.id)}
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
