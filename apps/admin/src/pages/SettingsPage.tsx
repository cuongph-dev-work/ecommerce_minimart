import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'motion/react';
import { Save, Store, Truck, CreditCard, FileText } from 'lucide-react';

export function SettingsPage() {
  // Store Info
  const [storeName, setStoreName] = useState('M Tech Store');
  const [storeLogo, setStoreLogo] = useState('');
  const [storePhone, setStorePhone] = useState('1900 xxxx');
  const [storeEmail, setStoreEmail] = useState('support@store.vn');
  const [storeAddress, setStoreAddress] = useState('123 Nguyễn Huệ, Quận 1, TP.HCM');
  const [storeDescription, setStoreDescription] = useState('Cửa hàng công nghệ uy tín, cam kết hàng chính hãng và bảo hành tốt nhất.');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');

  // Pickup Locations
  const [preparationTime, setPreparationTime] = useState('1-2 ngày làm việc');
  const [autoNotify, setAutoNotify] = useState(true);

  // Payment
  const [bankAccount, setBankAccount] = useState('');
  const [accountName, setAccountName] = useState('Công ty TNHH...');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankBranch, setBankBranch] = useState('Chi nhánh HCM');
  const [transferNote, setTransferNote] = useState('Nội dung: [Mã đơn hàng]');

  // Policies
  const [warrantyPolicy, setWarrantyPolicy] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [shoppingGuide, setShoppingGuide] = useState('');
  const [faq, setFaq] = useState('');

  const handleSave = () => {
    // Save logic here
    console.log('Settings saved');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cấu hình hệ thống</h2>
        <p className="text-muted-foreground mt-1">
          Quản lý các cấu hình chung của hệ thống
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="store">
            <Store className="w-4 h-4 mr-2" />
            Thông tin cửa hàng
          </TabsTrigger>
          <TabsTrigger value="pickup">
            <Truck className="w-4 h-4 mr-2" />
            Địa điểm nhận hàng
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Thanh toán
          </TabsTrigger>
          <TabsTrigger value="policies">
            <FileText className="w-4 h-4 mr-2" />
            Chính sách
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-6">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6">
            <h3 className="text-xl font-semibold">Thông tin cửa hàng</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên cửa hàng</Label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Logo (URL)</Label>
                <Input
                  value={storeLogo}
                  onChange={(e) => setStoreLogo(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Số điện thoại hotline</Label>
                <Input
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email liên hệ</Label>
                <Input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Textarea
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả ngắn</Label>
              <Textarea
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <Label>Mạng xã hội</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Facebook</Label>
                  <Input
                    value={facebookLink}
                    onChange={(e) => setFacebookLink(e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Instagram</Label>
                  <Input
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Telegram</Label>
                  <Input
                    value={telegramLink}
                    onChange={(e) => setTelegramLink(e.target.value)}
                    placeholder="https://t.me/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">YouTube</Label>
                  <Input
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="pickup" className="space-y-6">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6">
            <h3 className="text-xl font-semibold">Cấu hình địa điểm nhận hàng</h3>
            
            <div className="space-y-2">
              <Label>Thời gian chuẩn bị hàng dự kiến</Label>
              <Input
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                placeholder="1-2 ngày làm việc"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoNotify"
                checked={autoNotify}
                onChange={(e) => setAutoNotify(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="autoNotify" className="font-normal cursor-pointer">
                Thông báo tự động khi hàng sẵn sàng
              </Label>
            </div>

            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6">
            <h3 className="text-xl font-semibold">Cấu hình thanh toán</h3>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Lưu ý:</strong> Hệ thống không hỗ trợ thanh toán online, chỉ hỗ trợ thanh toán offline (COD).
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Thông tin chuyển khoản (nếu khách muốn chuyển khoản trước)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số tài khoản</Label>
                  <Input
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tên chủ tài khoản</Label>
                  <Input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tên ngân hàng</Label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Chi nhánh</Label>
                  <Input
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nội dung chuyển khoản (mẫu)</Label>
                <Input
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Nội dung: [Mã đơn hàng]"
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6">
            <h3 className="text-xl font-semibold">Chính sách và nội dung</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Chính sách bảo hành</Label>
                <Textarea
                  value={warrantyPolicy}
                  onChange={(e) => setWarrantyPolicy(e.target.value)}
                  className="min-h-[150px]"
                  placeholder="Nhập nội dung chính sách bảo hành..."
                />
              </div>

              <div className="space-y-2">
                <Label>Chính sách đổi trả</Label>
                <Textarea
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  className="min-h-[150px]"
                  placeholder="Nhập nội dung chính sách đổi trả..."
                />
              </div>

              <div className="space-y-2">
                <Label>Hướng dẫn mua hàng</Label>
                <Textarea
                  value={shoppingGuide}
                  onChange={(e) => setShoppingGuide(e.target.value)}
                  className="min-h-[150px]"
                  placeholder="Nhập hướng dẫn mua hàng..."
                />
              </div>

              <div className="space-y-2">
                <Label>Câu hỏi thường gặp (FAQ)</Label>
                <Textarea
                  value={faq}
                  onChange={(e) => setFaq(e.target.value)}
                  className="min-h-[150px]"
                  placeholder="Nhập câu hỏi thường gặp..."
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

