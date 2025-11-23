import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'motion/react';
import { Save, Store, CreditCard, FileText } from 'lucide-react';
import { settingsService } from '@/services/settings.service';

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    fetchSettings(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getAll();
      // API trả về object Record<string, any>, không phải array
      const settingsMap: Record<string, string> = Array.isArray(data) 
        ? data.reduce((acc: Record<string, string>, setting: any) => {
            acc[setting.key] = setting.value;
            return acc;
          }, {})
        : (data as Record<string, string>);
      setSettings(settingsMap);
      // Initialize form state from settings
      setStoreName(settingsMap.store_name || '');
      setStorePhone(settingsMap.store_phone || '');
      setStoreEmail(settingsMap.store_email || '');
      setStoreAddress(settingsMap.store_address || '');
      setStoreDescription(settingsMap.store_description || '');
      setFacebookLink(settingsMap.facebook_link || '');
      setInstagramLink(settingsMap.instagram_link || '');
      setTelegramLink(settingsMap.telegram_link || '');
      setYoutubeLink(settingsMap.youtube_link || '');
      setBankAccount(settingsMap.bank_account || '');
      setAccountName(settingsMap.account_name || '');
      setBankName(settingsMap.bank_name || '');
      setBankBranch(settingsMap.bank_branch || '');
      setTransferNote(settingsMap.transfer_note || '');
      setWarrantyPolicy(settingsMap.warranty_policy || '');
      setReturnPolicy(settingsMap.return_policy || '');
      setShoppingGuide(settingsMap.shopping_guide || '');
      setFaq(settingsMap.faq || '');
    } catch (err: any) {
      setError(err?.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const settingsToUpdate = [
        { key: 'store_name', value: storeName },
        { key: 'store_phone', value: storePhone },
        { key: 'store_email', value: storeEmail },
        { key: 'store_address', value: storeAddress },
        { key: 'store_description', value: storeDescription },
        { key: 'facebook_link', value: facebookLink },
        { key: 'instagram_link', value: instagramLink },
        { key: 'telegram_link', value: telegramLink },
        { key: 'youtube_link', value: youtubeLink },
        { key: 'bank_account', value: bankAccount },
        { key: 'account_name', value: accountName },
        { key: 'bank_name', value: bankName },
        { key: 'bank_branch', value: bankBranch },
        { key: 'transfer_note', value: transferNote },
        { key: 'warranty_policy', value: warrantyPolicy },
        { key: 'return_policy', value: returnPolicy },
        { key: 'shopping_guide', value: shoppingGuide },
        { key: 'faq', value: faq },
      ];

      // Update all settings
      await Promise.all(
        settingsToUpdate.map(({ key, value }) =>
          settingsService.update(key, { value })
        )
      );

      await fetchSettings();
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading settings...
        </div>
      ) : (
      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store">
            <Store className="w-4 h-4 mr-2" />
            Thông tin cửa hàng
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

            <Button onClick={handleSave} className="w-full sm:w-auto" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      )}
    </motion.div>
  );
}

