import { useState } from 'react';
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
import { categories as initialCategories } from '@/data/categories';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{ parentId: string, index: number, name: string } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  // Form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Package');
  const [selectedParentId, setSelectedParentId] = useState<string>('none');

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSaveCategory = () => {
    if (editingSubcategory) {
      // Edit existing subcategory
      setCategories(categories.map(cat => {
        if (cat.id === editingSubcategory.parentId) {
          const newSubcategories = [...(cat.subcategories || [])];
          if (newSubcategories[editingSubcategory.index] !== undefined) {
            newSubcategories[editingSubcategory.index] = newCategoryName;
          }
          return { ...cat, subcategories: newSubcategories };
        }
        return cat;
      }));
      setEditingSubcategory(null);
    } else if (editingCategory) {
      // Edit existing category
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { 
              ...cat, 
              name: newCategoryName, 
              description: newCategoryDescription, 
              icon: newCategoryIcon 
            } 
          : cat
      ));
      setEditingCategory(null);
    } else {
      // Add new category
      if (selectedParentId && selectedParentId !== 'none') {
        // Add as subcategory
        setCategories(categories.map(cat => {
          if (cat.id === selectedParentId) {
            return {
              ...cat,
              subcategories: [...(cat.subcategories || []), newCategoryName]
            };
          }
          return cat;
        }));
      } else {
        // Add as new parent category
        const newCategory: Category = {
          id: Math.random().toString(36).substr(2, 9),
          name: newCategoryName,
          slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
          description: newCategoryDescription,
          icon: newCategoryIcon,
          productCount: 0,
          subcategories: [],
        };
        setCategories([newCategory, ...categories]);
      }
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setNewCategoryIcon(category.icon);
    setSelectedParentId('none'); // Editing top-level categories for now
    setIsAddDialogOpen(true);
  };

  const handleEditSubcategory = (parentId: string, index: number, name: string) => {
    setEditingSubcategory({ parentId, index, name });
    setNewCategoryName(name);
    setSelectedParentId(parentId); // Set parent to show context, though we might hide the select
    setIsAddDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    setCategoryToDelete(null);
  };

  const resetForm = () => {
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryIcon('Package');
    setSelectedParentId('none');
    setEditingCategory(null);
    setEditingSubcategory(null);
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
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1">
            Manage product categories and subcategories.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory ? 'Edit Subcategory' : editingCategory ? 'Edit Category' : 'Add Category'}
              </DialogTitle>
              <DialogDescription>
                {editingSubcategory ? 'Update subcategory name.' : editingCategory ? 'Update category details.' : 'Create a new category or subcategory.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {!editingCategory && !editingSubcategory && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">
                    Parent
                  </Label>
                  <div className="col-span-3">
                    <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
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
                  Name
                </Label>
                <Input
                  id="name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="col-span-3"
                  placeholder={selectedParentId !== 'none' && !editingCategory ? "Subcategory Name" : "Category Name"}
                />
              </div>
              
              {(selectedParentId === 'none' || editingCategory) && !editingSubcategory && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="icon" className="text-right">
                      Icon
                    </Label>
                    <div className="col-span-3">
                      <Select value={newCategoryIcon} onValueChange={setNewCategoryIcon}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
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
              <Button type="submit" onClick={handleSaveCategory}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
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
              <TableHead className="w-[80px]">Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subcategories</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <>
                <TableRow key={category.id} className="group hover:bg-muted/30">
                  <TableCell>
                    {category.subcategories && category.subcategories.length > 0 && (
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
                      {category.subcategories?.slice(0, 3).map((sub, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                          {sub}
                        </span>
                      ))}
                      {category.subcategories && category.subcategories.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                          +{category.subcategories.length - 3} more
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
                  {expandedCategories.includes(category.id) && category.subcategories && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={6} className="p-0">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pl-16 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {category.subcategories.map((sub, idx) => (
                              <div key={idx} className="group/sub flex items-center justify-between gap-2 text-sm text-muted-foreground p-2 rounded-md hover:bg-background border border-transparent hover:border-border transition-colors">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                  {sub}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 opacity-0 group-hover/sub:opacity-100 transition-opacity"
                                  onClick={() => handleEditSubcategory(category.id, idx, sub)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
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
              className="bg-rose-600 hover:bg-rose-700"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
