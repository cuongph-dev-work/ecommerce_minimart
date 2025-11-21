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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Filter, MoreHorizontal, Upload, X } from 'lucide-react';
import { products as initialProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from "@/components/ui/label";
import type { Product } from '@/types';

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

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
  const [newProductImages, setNewProductImages] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const [newProductSubcategory, setNewProductSubcategory] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCategory = categories.find(c => c.id === newProductCategory);
  const availableSubcategories = selectedCategory?.subcategories || [];

  const handleAddImage = () => {
    if (currentImageUrl) {
      setNewProductImages([...newProductImages, currentImageUrl]);
      setCurrentImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewProductImages(newProductImages.filter((_, i) => i !== index));
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? {
              ...p,
              name: newProductName,
              price: Number(newProductPrice),
              category: categories.find(c => c.id === newProductCategory)?.name || 'Uncategorized',
              subcategory: newProductSubcategory,
              stock: Number(newProductStock),
              description: newProductDescription,
              image: newProductImages[0] || p.image,
              images: newProductImages,
              brand: newProductBrand,
              sku: newProductSku,
              warrantyPeriod: newProductWarranty,
              isOfficial: newProductIsOfficial,
              discount: Number(newProductDiscount),
            }
          : p
      ));
    } else {
      // Add new product
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: newProductName,
        price: Number(newProductPrice),
        category: categories.find(c => c.id === newProductCategory)?.name || 'Uncategorized',
        subcategory: newProductSubcategory,
        stock: Number(newProductStock),
        description: newProductDescription,
        image: newProductImages[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        images: newProductImages,
        brand: newProductBrand,
        sku: newProductSku,
        warrantyPeriod: newProductWarranty,
        isOfficial: newProductIsOfficial,
        discount: Number(newProductDiscount),
        featured: false,
      };

      setProducts([newProduct, ...products]);
    }
    
    setIsAddSheetOpen(false);
    resetForm();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProductName(product.name);
    setNewProductPrice(product.price.toString());
    setNewProductDiscount(product.discount?.toString() || '');
    const categoryId = categories.find(c => c.name === product.category)?.id || '';
    setNewProductCategory(categoryId);
    setNewProductSubcategory(product.subcategory || '');
    setNewProductStock(product.stock.toString());
    setNewProductBrand(product.brand || '');
    setNewProductSku(product.sku || '');
    setNewProductWarranty(product.warrantyPeriod || '');
    setNewProductIsOfficial(product.isOfficial || false);
    setNewProductDescription(product.description);
    setNewProductImages(product.images || (product.image ? [product.image] : []));
    setIsAddSheetOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    setProductToDelete(null);
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
    setNewProductImages([]);
    setCurrentImageUrl('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog and inventory.
          </p>
        </div>
        <Sheet open={isAddSheetOpen} onOpenChange={(open) => {
          setIsAddSheetOpen(open);
          if (!open) resetForm();
        }}>
          <SheetTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</SheetTitle>
              <SheetDescription>
                {editingProduct 
                  ? 'Update product details below.' 
                  : 'Fill in the details to add a new product to your catalog.'}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6">
              {/* Images Section */}
              <div className="space-y-4">
                <Label>Product Images</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter image URL" 
                    value={currentImageUrl}
                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddImage}>
                    Add
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {newProductImages.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                      <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {newProductImages.length === 0 && (
                    <div className="col-span-4 h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/30">
                      <Upload className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm">No images added</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Wireless Headphones"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={newProductSku}
                    onChange={(e) => setNewProductSku(e.target.value)}
                    placeholder="e.g. WH-1000XM4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                    placeholder="e.g. Sony"
                  />
                </div>

                {/* Pricing & Stock */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (VND)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={newProductDiscount}
                    onChange={(e) => setNewProductDiscount(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newProductCategory} 
                    onValueChange={(value) => {
                      setNewProductCategory(value);
                      setNewProductSubcategory(''); // Reset subcategory when category changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select 
                    value={newProductSubcategory} 
                    onValueChange={setNewProductSubcategory}
                    disabled={!newProductCategory || availableSubcategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !newProductCategory 
                          ? "Select category first" 
                          : availableSubcategories.length === 0 
                            ? "No subcategories" 
                            : "Select subcategory"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubcategories.map((sub, index) => (
                        <SelectItem key={index} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
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
                      onCheckedChange={(checked) => setNewProductIsOfficial(checked as boolean)}
                    />
                    <Label htmlFor="official" className="font-normal cursor-pointer">
                      Official Product (100% Authentic)
                    </Label>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProductDescription}
                    onChange={(e) => setNewProductDescription(e.target.value)}
                    placeholder="Detailed product description..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsAddSheetOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleSaveProduct}>
                {editingProduct ? 'Update Product' : 'Save Product'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="ml-auto">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {product.category}
                  </span>
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
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Out of Stock
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
                      <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        handleEditProduct(product);
                      }}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => {
                          e.preventDefault();
                          setProductToDelete(product.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
