import { useState, useEffect } from 'react';
import { reviewsService } from '@/services/reviews.service';
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
} from '@/components/ui/dialog';
import { Search, Eye, Check, X, Star, MoreHorizontal, MessageSquare } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import axios from 'axios';

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'hidden';
  helpful?: number;
  reply?: string;
}


export function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchReviews(controller.signal);
    return () => controller.abort();
  }, [statusFilter, ratingFilter]);

  const fetchReviews = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reviewsService.getAll({
        isApproved: statusFilter === 'approved' ? true : statusFilter === 'pending' ? false : undefined,
        isHidden: statusFilter === 'hidden' ? true : undefined,
        rating: ratingFilter !== 'all' ? Number(ratingFilter) : undefined,
      }, signal);
      // Transform API response to match frontend Review type
      const transformed = response.reviews.map((r: any) => ({
        ...r,
        userName: r.userName || r.user?.name || 'Anonymous',
        productName: r.productName || r.product?.name || 'Unknown Product',
        date: r.createdAt || r.date,
        status: r.isApproved ? 'approved' : r.isHidden ? 'hidden' : 'pending',
      }));
      setReviews(transformed);
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      setError(err?.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleApprove = async (id: string) => {
    try {
      await reviewsService.approve(id);
      await fetchReviews();
    } catch (err: any) {
      setError(err?.message || 'Không thể duyệt đánh giá');
    }
  };

  const handleHide = async (id: string) => {
    try {
      await reviewsService.hide(id);
      await fetchReviews();
    } catch (err: any) {
      setError(err?.message || 'Không thể ẩn đánh giá');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return;
    try {
      // Note: Backend might not have delete endpoint, so we'll just hide it
      await reviewsService.hide(id);
      await fetchReviews();
    } catch (err: any) {
      setError(err?.message || 'Không thể xóa đánh giá');
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText) return;
    try {
      setIsSaving(true);
      await reviewsService.reply(selectedReview.id, { reply: replyText });
      setIsReplyOpen(false);
      setReplyText('');
      await fetchReviews();
    } catch (err: any) {
      setError(err?.message || 'Không thể phản hồi đánh giá');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600';
      case 'hidden':
        return 'bg-gray-500/10 text-gray-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'hidden':
        return 'Đã ẩn';
      default:
        return status;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'w-4 h-4',
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        )}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Đánh giá sản phẩm</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý đánh giá của khách hàng về sản phẩm
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm đánh giá..."
            className="pl-10 bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="hidden">Đã ẩn</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ratingFilter} onValueChange={(v: any) => setRatingFilter(v)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Số sao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="5">5 sao</SelectItem>
            <SelectItem value="4">4 sao</SelectItem>
            <SelectItem value="3">3 sao</SelectItem>
            <SelectItem value="2">2 sao</SelectItem>
            <SelectItem value="1">1 sao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Đang tải đánh giá...
                </TableCell>
              </TableRow>
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy đánh giá
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
              <TableRow key={review.id} className="group">
                <TableCell className="font-medium">{review.productName}</TableCell>
                <TableCell>{review.userName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground ml-1">({review.rating})</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="text-sm text-muted-foreground truncate">{review.comment}</p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(review.date).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusColor(review.status))}>
                    {getStatusLabel(review.status)}
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
                      <DropdownMenuItem onSelect={() => {
                        setSelectedReview(review);
                        setIsDetailOpen(true);
                      }}>
                        <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                      </DropdownMenuItem>
                      {review.status === 'pending' && (
                        <DropdownMenuItem onSelect={() => handleApprove(review.id)}>
                          <Check className="mr-2 h-4 w-4" /> Duyệt
                        </DropdownMenuItem>
                      )}
                      {review.status === 'approved' && (
                        <DropdownMenuItem onSelect={() => handleHide(review.id)}>
                          <X className="mr-2 h-4 w-4" /> Ẩn
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={() => {
                        setSelectedReview(review);
                        setIsReplyOpen(true);
                      }}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Phản hồi
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => handleDelete(review.id)}
                      >
                        Xóa
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Sản phẩm</Label>
                <p className="font-medium">{selectedReview.productName}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Khách hàng</Label>
                <p className="font-medium">{selectedReview.userName}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Đánh giá</Label>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Nội dung</Label>
                <p className="mt-1">{selectedReview.comment}</p>
              </div>
              {selectedReview.reply && (
                <div>
                  <Label className="text-sm text-muted-foreground">Phản hồi</Label>
                  <p className="mt-1 text-sm bg-muted p-3 rounded-lg">{selectedReview.reply}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
            <DialogDescription>
              Viết phản hồi cho đánh giá của khách hàng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Phản hồi</Label>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Cảm ơn bạn đã đánh giá..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyOpen(false)}>Hủy</Button>
            <Button onClick={handleReply} disabled={isSaving}>
              {isSaving ? 'Đang gửi...' : 'Gửi phản hồi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

