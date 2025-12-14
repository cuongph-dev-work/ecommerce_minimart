import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'motion/react';
import { Save, Store, CreditCard, FileText, Upload, X, Search } from 'lucide-react';
import { settingsService } from '@/services/settings.service';
import { extractApiError, getFieldError, type ValidationError } from '@/lib/error-handler';
import { storeSettingsSchema, paymentSettingsSchema, policySettingsSchema } from '@/schemas/settings.schema';
import { safeParse } from 'valibot';
import { UploadHelper, type PendingFile } from '@/lib/upload-helper';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function SettingsPage() {
  useDocumentTitle('Cài đặt');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Logo upload state
  const [pendingLogoFile, setPendingLogoFile] = useState<PendingFile | null>(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string>('');
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState<number | null>(null);

  const fetchSettings = useCallback(async (_signal?: AbortSignal) => {
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
      setStoreLogo(settingsMap.store_logo || '');
      setUploadedLogoUrl(settingsMap.store_logo || '');
      setStorePhone(settingsMap.store_phone || '');
      setStoreEmail(settingsMap.store_email || '');
      setStoreAddress(settingsMap.store_address || '');
      setStoreDescription(settingsMap.store_description || '');
      setFacebookLink(settingsMap.facebook_link || '');
      setInstagramLink(settingsMap.instagram_link || '');
      setTelegramLink(settingsMap.telegram_link || '');
      setYoutubeLink(settingsMap.youtube_link || '');
      setTiktokLink(settingsMap.tiktok_link || '');
      setWorkingHours(settingsMap.working_hours || '');
      setBankAccount(settingsMap.bank_account || '');
      setAccountName(settingsMap.account_name || '');
      setBankName(settingsMap.bank_name || '');
      setBankBranch(settingsMap.bank_branch || '');
      setTransferNote(settingsMap.transfer_note || '');
      setDeliveryFee(settingsMap.deliveryFee || '30000');
      setWarrantyPolicy(settingsMap.warranty_policy || '');
      setReturnPolicy(settingsMap.return_policy || '');
      setShoppingGuide(settingsMap.shopping_guide || '');
      setFaq(settingsMap.faq || '');
      // SEO Settings
      setSeoKeywords(settingsMap.seo_keywords || '');
      setSeoAuthor(settingsMap.seo_author || '');
      setSeoCreator(settingsMap.seo_creator || '');
      setSeoPublisher(settingsMap.seo_publisher || '');
      setSeoTwitterHandle(settingsMap.seo_twitter_handle || '');
      setSeoGoogleVerification(settingsMap.seo_google_verification || '');
      setSeoHomeTitle(settingsMap.seo_home_title || '');
      setSeoHomeDescription(settingsMap.seo_home_description || '');
      setSeoHomeKeywords(settingsMap.seo_home_keywords || '');
      setSeoProductsTitle(settingsMap.seo_products_title || '');
      setSeoProductsDescription(settingsMap.seo_products_description || '');
      setSeoProductsKeywords(settingsMap.seo_products_keywords || '');
      setSeoContactTitle(settingsMap.seo_contact_title || '');
      setSeoContactDescription(settingsMap.seo_contact_description || '');
      setSeoContactKeywords(settingsMap.seo_contact_keywords || '');
      setSeoStoresTitle(settingsMap.seo_stores_title || '');
      setSeoStoresDescription(settingsMap.seo_stores_description || '');
      setSeoStoresKeywords(settingsMap.seo_stores_keywords || '');
    } catch (err: unknown) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSettings(controller.signal);
    return () => controller.abort();
  }, [fetchSettings]);

  // Store Info
  const [storeName, setStoreName] = useState(settings.store_name || '');
  const [storeLogo, setStoreLogo] = useState('');
  const [storePhone, setStorePhone] = useState(settings.store_phone || '');
  const [storeEmail, setStoreEmail] = useState(settings.store_email || '');
  const [storeAddress, setStoreAddress] = useState(settings.store_address || '');
  const [storeDescription, setStoreDescription] = useState(settings.store_description || '');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [tiktokLink, setTiktokLink] = useState('');
  const [workingHours, setWorkingHours] = useState('');


  // Payment
  const [bankAccount, setBankAccount] = useState('');
  const [accountName, setAccountName] = useState('Công ty TNHH...');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankBranch, setBankBranch] = useState('Chi nhánh HCM');
  const [transferNote, setTransferNote] = useState('Nội dung: [Mã đơn hàng]');
  const [deliveryFee, setDeliveryFee] = useState('30000');

  // Policies
  const [warrantyPolicy, setWarrantyPolicy] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [shoppingGuide, setShoppingGuide] = useState('');
  const [faq, setFaq] = useState('');

  // SEO Settings - Global
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoAuthor, setSeoAuthor] = useState('');
  const [seoCreator, setSeoCreator] = useState('');
  const [seoPublisher, setSeoPublisher] = useState('');
  const [seoTwitterHandle, setSeoTwitterHandle] = useState('');
  const [seoGoogleVerification, setSeoGoogleVerification] = useState('');

  // SEO Settings - Per Page
  const [seoHomeTitle, setSeoHomeTitle] = useState('');
  const [seoHomeDescription, setSeoHomeDescription] = useState('');
  const [seoHomeKeywords, setSeoHomeKeywords] = useState('');
  const [seoProductsTitle, setSeoProductsTitle] = useState('');
  const [seoProductsDescription, setSeoProductsDescription] = useState('');
  const [seoProductsKeywords, setSeoProductsKeywords] = useState('');
  const [seoContactTitle, setSeoContactTitle] = useState('');
  const [seoContactDescription, setSeoContactDescription] = useState('');
  const [seoContactKeywords, setSeoContactKeywords] = useState('');
  const [seoStoresTitle, setSeoStoresTitle] = useState('');
  const [seoStoresDescription, setSeoStoresDescription] = useState('');
  const [seoStoresKeywords, setSeoStoresKeywords] = useState('');

  const handleAddLogoUrl = () => {
    if (currentLogoUrl) {
      if (pendingLogoFile) {
        UploadHelper.revokePreview(pendingLogoFile.preview);
        setPendingLogoFile(null);
      }
      setUploadedLogoUrl(currentLogoUrl);
      setStoreLogo(currentLogoUrl);
      setCurrentLogoUrl('');
      setValidationErrors(validationErrors.filter(err => err.field !== 'store_logo'));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = UploadHelper.validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
    });

    if (!validation.valid) {
      setValidationErrors([{ field: 'store_logo', message: validation.error || 'File không hợp lệ' }]);
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    const preview = UploadHelper.createPreview(file);
    const pending: PendingFile = {
      file,
      preview,
      id: `${Date.now()}-${Math.random()}`,
    };

    setUploadedLogoUrl('');
    setStoreLogo('');
    setPendingLogoFile(pending);
    setValidationErrors(validationErrors.filter(err => err.field !== 'store_logo'));

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveLogo = () => {
    if (pendingLogoFile) {
      UploadHelper.revokePreview(pendingLogoFile.preview);
      setPendingLogoFile(null);
    }
    setUploadedLogoUrl('');
    setStoreLogo('');
    setCurrentLogoUrl('');
    setValidationErrors(validationErrors.filter(err => err.field !== 'store_logo'));
  };

  const handleSave = async (tab: 'store' | 'seo' | 'payment' | 'policies' = 'store') => {
    try {
      setIsSaving(true);
      setError(null);
      setValidationErrors([]);

      let settingsToUpdate: Array<{ key: string; value: string }> = [];
      let formData: Record<string, unknown> = {};

      if (tab === 'store') {
        // Upload logo if there's a pending file
        let logoUrl = uploadedLogoUrl || storeLogo;

        if (pendingLogoFile) {
          setUploadingLogo(0);
          try {
            const uploadResult = await UploadHelper.uploadBatch(
              [pendingLogoFile.file],
              'store',
              {
                onProgress: (progress) => {
                  setUploadingLogo(progress);
                },
              }
            );

            logoUrl = uploadResult.uploaded[0]?.url || '';
            if (!logoUrl) {
              setValidationErrors([{ field: 'store_logo', message: 'Lỗi khi upload logo' }]);
              return;
            }

            UploadHelper.revokePreview(pendingLogoFile.preview);
            setPendingLogoFile(null);
          } catch (uploadError: unknown) {
            const apiError = extractApiError(uploadError);
            setValidationErrors([{ field: 'store_logo', message: apiError.message || 'Lỗi khi upload logo' }]);
            return;
          } finally {
            setUploadingLogo(null);
          }
        }

        formData = {
          store_name: storeName.trim(),
          store_logo: logoUrl || undefined,
          store_phone: storePhone.trim(),
          store_email: storeEmail.trim(),
          store_address: storeAddress.trim(),
          store_description: storeDescription?.trim() || undefined,
          facebook_link: facebookLink?.trim() || undefined,
          instagram_link: instagramLink?.trim() || undefined,
          telegram_link: telegramLink?.trim() || undefined,
          youtube_link: youtubeLink?.trim() || undefined,
          tiktok_link: tiktokLink?.trim() || undefined,
          working_hours: workingHours?.trim() || undefined,
        };

        const result = safeParse(storeSettingsSchema, formData);
        if (!result.success) {
          const errors: ValidationError[] = result.issues.map((issue) => {
            const field = issue.path?.[0]?.key as string || 'store_name';
            return { field, message: issue.message };
          });
          setValidationErrors(errors);
          return;
        }

        settingsToUpdate = [
          { key: 'store_name', value: storeName.trim() },
          { key: 'store_logo', value: logoUrl || '' },
          { key: 'store_phone', value: storePhone.trim() },
          { key: 'store_email', value: storeEmail.trim() },
          { key: 'store_address', value: storeAddress.trim() },
          { key: 'store_description', value: storeDescription?.trim() || '' },
          { key: 'facebook_link', value: facebookLink?.trim() || '' },
          { key: 'instagram_link', value: instagramLink?.trim() || '' },
          { key: 'telegram_link', value: telegramLink?.trim() || '' },
          { key: 'youtube_link', value: youtubeLink?.trim() || '' },
          { key: 'tiktok_link', value: tiktokLink?.trim() || '' },
          { key: 'working_hours', value: workingHours?.trim() || '' },
        ];
      } else if (tab === 'seo') {
        settingsToUpdate = [
          { key: 'seo_keywords', value: seoKeywords?.trim() || '' },
          { key: 'seo_author', value: seoAuthor?.trim() || '' },
          { key: 'seo_creator', value: seoCreator?.trim() || '' },
          { key: 'seo_publisher', value: seoPublisher?.trim() || '' },
          { key: 'seo_twitter_handle', value: seoTwitterHandle?.trim() || '' },
          { key: 'seo_google_verification', value: seoGoogleVerification?.trim() || '' },
          { key: 'seo_home_title', value: seoHomeTitle?.trim() || '' },
          { key: 'seo_home_description', value: seoHomeDescription?.trim() || '' },
          { key: 'seo_home_keywords', value: seoHomeKeywords?.trim() || '' },
          { key: 'seo_products_title', value: seoProductsTitle?.trim() || '' },
          { key: 'seo_products_description', value: seoProductsDescription?.trim() || '' },
          { key: 'seo_products_keywords', value: seoProductsKeywords?.trim() || '' },
          { key: 'seo_contact_title', value: seoContactTitle?.trim() || '' },
          { key: 'seo_contact_description', value: seoContactDescription?.trim() || '' },
          { key: 'seo_contact_keywords', value: seoContactKeywords?.trim() || '' },
          { key: 'seo_stores_title', value: seoStoresTitle?.trim() || '' },
          { key: 'seo_stores_description', value: seoStoresDescription?.trim() || '' },
          { key: 'seo_stores_keywords', value: seoStoresKeywords?.trim() || '' },
        ];
      } else if (tab === 'payment') {
        // Validate delivery fee
        const deliveryFeeNum = Number(deliveryFee);
        if (isNaN(deliveryFeeNum) || deliveryFeeNum < 0) {
          setValidationErrors([{ field: 'deliveryFee', message: 'Phí giao hàng phải là số dương' }]);
          return;
        }

        formData = {
          bank_account: bankAccount?.trim() || undefined,
          account_name: accountName?.trim() || undefined,
          bank_name: bankName?.trim() || undefined,
          bank_branch: bankBranch?.trim() || undefined,
          transfer_note: transferNote?.trim() || undefined,
        };

        const result = safeParse(paymentSettingsSchema, formData);
        if (!result.success) {
          const errors: ValidationError[] = result.issues.map((issue) => {
            const field = issue.path?.[0]?.key as string || 'bank_account';
            return { field, message: issue.message };
          });
          setValidationErrors(errors);
          return;
        }

        settingsToUpdate = [
          { key: 'bank_account', value: bankAccount?.trim() || '' },
          { key: 'account_name', value: accountName?.trim() || '' },
          { key: 'bank_name', value: bankName?.trim() || '' },
          { key: 'bank_branch', value: bankBranch?.trim() || '' },
          { key: 'transfer_note', value: transferNote?.trim() || '' },
          { key: 'deliveryFee', value: deliveryFee },
        ];
      } else if (tab === 'policies') {
        formData = {
          warranty_policy: warrantyPolicy?.trim() || undefined,
          return_policy: returnPolicy?.trim() || undefined,
          shopping_guide: shoppingGuide?.trim() || undefined,
          faq: faq?.trim() || undefined,
        };

        const result = safeParse(policySettingsSchema, formData);
        if (!result.success) {
          const errors: ValidationError[] = result.issues.map((issue) => {
            const field = issue.path?.[0]?.key as string || 'warranty_policy';
            return { field, message: issue.message };
          });
          setValidationErrors(errors);
          return;
        }

        settingsToUpdate = [
          { key: 'warranty_policy', value: warrantyPolicy?.trim() || '' },
          { key: 'return_policy', value: returnPolicy?.trim() || '' },
          { key: 'shopping_guide', value: shoppingGuide?.trim() || '' },
          { key: 'faq', value: faq?.trim() || '' },
        ];
      }

      // Batch update all settings in one API call
      const settingsMap: Record<string, string> = {};
      settingsToUpdate.forEach(({ key, value }) => {
        settingsMap[key] = value;
      });

      await settingsService.batchUpdate({ settings: settingsMap });

      await fetchSettings();
    } catch (err: unknown) {
      const apiError = extractApiError(err);
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
      } else {
        setError(apiError.message || 'Failed to save settings');
      }
    } finally {
      setIsSaving(false);
      setUploadingLogo(null);
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
            <TabsTrigger value="seo">
              <Search className="w-4 h-4 mr-2" />
              SEO
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
                  <Label>Tên cửa hàng <span className="text-destructive">*</span></Label>
                  <Input
                    value={storeName}
                    onChange={(e) => {
                      setStoreName(e.target.value);
                      if (getFieldError(validationErrors, 'store_name')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'store_name'));
                      }
                    }}
                    className={getFieldError(validationErrors, 'store_name') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'store_name') && (
                    <p className="text-sm text-destructive">
                      {getFieldError(validationErrors, 'store_name')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="space-y-2">
                    {/* Upload Button */}
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={uploadingLogo !== null}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={uploadingLogo !== null}
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Chọn file
                          </span>
                        </Button>
                      </label>
                    </div>

                    {/* URL Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/logo.jpg"
                        value={currentLogoUrl}
                        onChange={(e) => {
                          setCurrentLogoUrl(e.target.value);
                          if (getFieldError(validationErrors, 'store_logo')) {
                            setValidationErrors(validationErrors.filter(err => err.field !== 'store_logo'));
                          }
                        }}
                        disabled={uploadingLogo !== null}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddLogoUrl}
                        disabled={!currentLogoUrl || uploadingLogo !== null}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>

                  {getFieldError(validationErrors, 'store_logo') && (
                    <p className="text-sm text-destructive">
                      {getFieldError(validationErrors, 'store_logo')}
                    </p>
                  )}

                  {/* Logo Preview */}
                  {(pendingLogoFile || uploadedLogoUrl || uploadingLogo !== null) ? (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      {uploadingLogo !== null ? (
                        <div className="w-full h-32 flex flex-col items-center justify-center bg-muted/50">
                          <div className="text-sm text-muted-foreground mb-2">Đang upload...</div>
                          <div className="w-3/4 h-1 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${uploadingLogo}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={pendingLogoFile?.preview || uploadedLogoUrl}
                            alt="Logo preview"
                            className="w-full h-32 object-contain bg-muted/30"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {pendingLogoFile && (
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-yellow-500/80 text-white text-xs rounded">
                              Chờ upload
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/30">
                      <Upload className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm">Chưa có logo</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Số điện thoại hotline <span className="text-destructive">*</span></Label>
                  <Input
                    value={storePhone}
                    onChange={(e) => {
                      setStorePhone(e.target.value);
                      if (getFieldError(validationErrors, 'store_phone')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'store_phone'));
                      }
                    }}
                    className={getFieldError(validationErrors, 'store_phone') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'store_phone') && (
                    <p className="text-sm text-destructive">
                      {getFieldError(validationErrors, 'store_phone')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email liên hệ <span className="text-destructive">*</span></Label>
                  <Input
                    type="email"
                    value={storeEmail}
                    onChange={(e) => {
                      setStoreEmail(e.target.value);
                      if (getFieldError(validationErrors, 'store_email')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'store_email'));
                      }
                    }}
                    className={getFieldError(validationErrors, 'store_email') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'store_email') && (
                    <p className="text-sm text-destructive">
                      {getFieldError(validationErrors, 'store_email')}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Địa chỉ <span className="text-destructive">*</span></Label>
                <Textarea
                  value={storeAddress}
                  onChange={(e) => {
                    setStoreAddress(e.target.value);
                    if (getFieldError(validationErrors, 'store_address')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'store_address'));
                    }
                  }}
                  className={`min-h-[80px] ${getFieldError(validationErrors, 'store_address') ? 'border-destructive' : ''}`}
                />
                {getFieldError(validationErrors, 'store_address') && (
                  <p className="text-sm text-destructive">
                    {getFieldError(validationErrors, 'store_address')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Mô tả ngắn</Label>
                <Textarea
                  value={storeDescription}
                  onChange={(e) => {
                    setStoreDescription(e.target.value);
                    if (getFieldError(validationErrors, 'store_description')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'store_description'));
                    }
                  }}
                  className={`min-h-[100px] ${getFieldError(validationErrors, 'store_description') ? 'border-destructive' : ''}`}
                />
                {getFieldError(validationErrors, 'store_description') && (
                  <p className="text-sm text-destructive">
                    {getFieldError(validationErrors, 'store_description')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Giờ làm việc</Label>
                <Input
                  value={workingHours}
                  onChange={(e) => {
                    setWorkingHours(e.target.value);
                    if (getFieldError(validationErrors, 'working_hours')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'working_hours'));
                    }
                  }}
                  placeholder="VD: T2-T6: 8:00-17:00, T7-CN: 9:00-18:00"
                  className={getFieldError(validationErrors, 'working_hours') ? 'border-destructive' : ''}
                />
                {getFieldError(validationErrors, 'working_hours') && (
                  <p className="text-sm text-destructive">
                    {getFieldError(validationErrors, 'working_hours')}
                  </p>
                )}
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
                  <div className="space-y-2">
                    <Label className="text-sm">TikTok</Label>
                    <Input
                      value={tiktokLink}
                      onChange={(e) => setTiktokLink(e.target.value)}
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave('store')} className="w-full sm:w-auto" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6">
              <h3 className="text-xl font-semibold">Cấu hình SEO</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Cài đặt SEO chung</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tiêu đề mặc định</Label>
                      <Input
                        value={storeName || ''}
                        readOnly
                        className="bg-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tự động lấy từ <strong>Tên cửa hàng</strong> trong tab "Thông tin cửa hàng"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Template tiêu đề</Label>
                      <Input
                        value={storeName ? `%s | ${storeName}` : '%s | Minimart'}
                        readOnly
                        className="bg-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        %s sẽ được thay thế bằng tiêu đề trang. Tự động tạo từ <strong>Tên cửa hàng</strong>
                      </p>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Mô tả mặc định</Label>
                      <Textarea
                        value={storeDescription || ''}
                        readOnly
                        className="min-h-[80px] bg-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tự động lấy từ <strong>Mô tả ngắn</strong> trong tab "Thông tin cửa hàng"
                      </p>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Từ khóa (phân cách bằng dấu phẩy)</Label>
                      <Input
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        placeholder="minimart, ecommerce, online shopping"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tác giả</Label>
                      <Input
                        value={seoAuthor}
                        onChange={(e) => setSeoAuthor(e.target.value)}
                        placeholder="Tên tác giả"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Người tạo</Label>
                      <Input
                        value={seoCreator}
                        onChange={(e) => setSeoCreator(e.target.value)}
                        placeholder="Tên người tạo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Nhà xuất bản</Label>
                      <Input
                        value={seoPublisher}
                        onChange={(e) => setSeoPublisher(e.target.value)}
                        placeholder="Tên nhà xuất bản"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Twitter Handle</Label>
                      <Input
                        value={seoTwitterHandle}
                        onChange={(e) => setSeoTwitterHandle(e.target.value)}
                        placeholder="@minimart"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Google Verification Code</Label>
                      <Input
                        value={seoGoogleVerification}
                        onChange={(e) => setSeoGoogleVerification(e.target.value)}
                        placeholder="Verification code từ Google Search Console"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">SEO theo trang</h4>
                  <div className="space-y-6">
                    {/* Home Page */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <h5 className="font-medium">Trang chủ</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tiêu đề</Label>
                          <Input
                            value={seoHomeTitle}
                            onChange={(e) => setSeoHomeTitle(e.target.value)}
                            placeholder="Để trống sẽ dùng mặc định"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Từ khóa</Label>
                          <Input
                            value={seoHomeKeywords}
                            onChange={(e) => setSeoHomeKeywords(e.target.value)}
                            placeholder="keyword1, keyword2"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Mô tả</Label>
                          <Textarea
                            value={seoHomeDescription}
                            onChange={(e) => setSeoHomeDescription(e.target.value)}
                            className="min-h-[60px]"
                            placeholder="Để trống sẽ dùng mặc định"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Products Page */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <h5 className="font-medium">Trang sản phẩm</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tiêu đề</Label>
                          <Input
                            value={seoProductsTitle}
                            onChange={(e) => setSeoProductsTitle(e.target.value)}
                            placeholder="Để trống sẽ dùng mặc định"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Từ khóa</Label>
                          <Input
                            value={seoProductsKeywords}
                            onChange={(e) => setSeoProductsKeywords(e.target.value)}
                            placeholder="products, shopping, ecommerce"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Mô tả</Label>
                          <Textarea
                            value={seoProductsDescription}
                            onChange={(e) => setSeoProductsDescription(e.target.value)}
                            className="min-h-[60px]"
                            placeholder="Để trống sẽ dùng mặc định"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Page */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <h5 className="font-medium">Trang liên hệ</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tiêu đề</Label>
                          <Input
                            value={seoContactTitle}
                            onChange={(e) => setSeoContactTitle(e.target.value)}
                            placeholder="Để trống sẽ dùng mặc định"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Từ khóa</Label>
                          <Input
                            value={seoContactKeywords}
                            onChange={(e) => setSeoContactKeywords(e.target.value)}
                            placeholder="contact, support, help"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Mô tả</Label>
                          <Textarea
                            value={seoContactDescription}
                            onChange={(e) => setSeoContactDescription(e.target.value)}
                            className="min-h-[60px]"
                            placeholder="Để trống sẽ dùng mặc định"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stores Page */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <h5 className="font-medium">Trang cửa hàng</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tiêu đề</Label>
                          <Input
                            value={seoStoresTitle}
                            onChange={(e) => setSeoStoresTitle(e.target.value)}
                            placeholder="Để trống sẽ dùng mặc định"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Từ khóa</Label>
                          <Input
                            value={seoStoresKeywords}
                            onChange={(e) => setSeoStoresKeywords(e.target.value)}
                            placeholder="stores, locations, find store"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Mô tả</Label>
                          <Textarea
                            value={seoStoresDescription}
                            onChange={(e) => setSeoStoresDescription(e.target.value)}
                            className="min-h-[60px]"
                            placeholder="Để trống sẽ dùng mặc định"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave('seo')} className="w-full sm:w-auto" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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

                <div className="space-y-2">
                  <Label>Phí giao hàng (VND) <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    value={deliveryFee}
                    onChange={(e) => {
                      setDeliveryFee(e.target.value);
                      if (getFieldError(validationErrors, 'deliveryFee')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'deliveryFee'));
                      }
                    }}
                    placeholder="30000"
                    className={getFieldError(validationErrors, 'deliveryFee') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'deliveryFee') && (
                    <p className="text-sm text-destructive">
                      {getFieldError(validationErrors, 'deliveryFee')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Phí giao hàng áp dụng cho đơn "Giao hàng tận nơi". Mặc định: 30,000 VND
                  </p>
                </div>
              </div>

              <Button onClick={() => handleSave('payment')} className="w-full sm:w-auto" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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

              <Button onClick={() => handleSave('policies')} className="w-full sm:w-auto" disabled={isSaving}>
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

