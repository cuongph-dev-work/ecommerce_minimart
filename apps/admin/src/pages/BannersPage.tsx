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
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Image as ImageIcon, X } from 'lucide-react';
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

export interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  startDate?: string;
  endDate?: string;
}

const initialBanners: Banner[] = [
  {
    id: '1',
    title: 'FLASH SALE 12.12',
    description: 'Giảm đến 50% cho tất cả sản phẩm - Mua ngay kẻo lỡ!',
    image: 'https://images.unsplash.com/photo-1759153820384-12c9ddf8bd8d?w=1080&q=80',
    link: '/products',
    status: 'active',
    sortOrder: 1,
  },
  {
    id: '2',
    title: 'Freeship toàn quốc',
    description: 'Miễn phí vận chuyển cho đơn hàng từ 500K - Giao nhanh 2H',
    image: 'https://images.unsplash.com/photo-1760463921642-eef64776c3bf?w=1080&q=80',
    link: '/products',
    status: 'active',
    sortOrder: 2,
  },
];

export function BannersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  // Form state
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerDescription, setNewBannerDescription] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');
  const [newBannerImageFile, setNewBannerImageFile] = useState<File | null>(null);
  const [newBannerImagePreview, setNewBannerImagePreview] = useState<string>('');
  const [newBannerLink, setNewBannerLink] = useState('');
  const [newBannerStatus, setNewBannerStatus] = useState<'active' | 'inactive'>('active');
  const [newBannerSortOrder, setNewBannerSortOrder] = useState('1');

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewBannerImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewBannerImagePreview(result);
        setNewBannerImage(result); // Tạm thời dùng base64, sau này sẽ upload lên server
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewBannerImageFile(null);
    setNewBannerImagePreview('');
    setNewBannerImage('');
  };

  const handleSaveBanner = () => {
    // TODO: Upload file lên server nếu có newBannerImageFile
    // const imageUrl = await uploadImage(newBannerImageFile);
    
    if (editingBanner) {
      setBanners(banners.map(b =>
        b.id === editingBanner.id
          ? {
              ...b,
              title: newBannerTitle,
              description: newBannerDescription,
              image: newBannerImage,
              link: newBannerLink,
              status: newBannerStatus,
              sortOrder: Number(newBannerSortOrder),
            }
          : b
      ));
    } else {
      const newBanner: Banner = {
        id: Math.random().toString(36).substr(2, 9),
        title: newBannerTitle,
        description: newBannerDescription,
        image: newBannerImage,
        link: newBannerLink,
        status: newBannerStatus,
        sortOrder: Number(newBannerSortOrder),
      };
      setBanners([newBanner, ...banners]);
    }
    setIsAddSheetOpen(false);
    resetForm();
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setNewBannerTitle(banner.title);
    setNewBannerDescription(banner.description);
    setNewBannerImage(banner.image);
    setNewBannerImagePreview(banner.image);
    setNewBannerLink(banner.link);
    setNewBannerStatus(banner.status);
    setNewBannerSortOrder(banner.sortOrder.toString());
    setIsAddSheetOpen(true);
  };

  const handleDeleteBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
    setBannerToDelete(null);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setNewBannerTitle('');
    setNewBannerDescription('');
    setNewBannerImage('');
    setNewBannerImageFile(null);
    setNewBannerImagePreview('');
    setNewBannerLink('');
    setNewBannerStatus('active');
    setNewBannerSortOrder('1');
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
        <Sheet open={isAddSheetOpen} onOpenChange={(open) => {
          setIsAddSheetOpen(open);
          if (!open) resetForm();
        }}>
          <SheetTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Thêm Banner
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}</SheetTitle>
              <SheetDescription>
                {editingBanner ? 'Cập nhật thông tin banner' : 'Thêm banner mới vào slider trang chủ'}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {(newBannerImagePreview || newBannerImage) && (
                    <div className="relative mt-2 rounded-lg overflow-hidden border border-border">
                      <img 
                        src={newBannerImagePreview || newBannerImage} 
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
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tiêu đề</Label>
                <Input
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  placeholder="FLASH SALE 12.12"
                />
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  value={newBannerDescription}
                  onChange={(e) => setNewBannerDescription(e.target.value)}
                  placeholder="Giảm đến 50% cho tất cả sản phẩm..."
                  className="min-h-[80px]"
                />
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
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsAddSheetOpen(false)}>Hủy</Button>
              <Button onClick={handleSaveBanner}>
                {editingBanner ? 'Cập nhật' : 'Lưu'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
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
            {filteredBanners.map((banner) => (
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
            ))}
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

