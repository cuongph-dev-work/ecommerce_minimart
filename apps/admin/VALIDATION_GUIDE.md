# Hướng dẫn Setup Validation với TanStack Form + Valibot

## Tổng quan

Đã setup validation cho admin panel sử dụng:
- **Valibot**: Schema validation library nhẹ và type-safe
- **TanStack Form**: Form management library mạnh mẽ
- **Custom Error Handler**: Xử lý và hiển thị lỗi từ API một cách chi tiết

## Cấu trúc đã tạo

### 1. Error Handler (`/src/lib/error-handler.ts`)

Utility để xử lý lỗi từ API:

```typescript
// Extract lỗi từ API response
const apiError = extractApiError(error);
setError(apiError.message);
if (apiError.errors) {
  setValidationErrors(apiError.errors);
}

// Lấy lỗi cho một field cụ thể
const nameError = getFieldError(validationErrors, 'name');
```

### 2. Validation Schemas (`/src/schemas/`)

Định nghĩa schema validation cho từng module:

```typescript
// category.schema.ts
export const categorySchema = v.object({
  name: v.pipe(
    v.string('Tên danh mục là bắt buộc'),
    v.minLength(1, 'Tên danh mục không được để trống'),
    v.maxLength(100, 'Tên danh mục không được vượt quá 100 ký tự')
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'Mô tả không được vượt quá 500 ký tự')
    )
  ),
});
```

### 3. Form Components (`/src/components/forms/`)

Component form riêng sử dụng TanStack Form (tùy chọn - có thể dùng inline validation)

## Cách áp dụng cho module Categories (Đã hoàn thành)

### Bước 1: Thêm state cho validation errors

```typescript
const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
```

### Bước 2: Thêm frontend validation trong handleSave

```typescript
const handleSaveCategory = async () => {
  // Frontend validation
  if (!newCategoryName || newCategoryName.trim().length === 0) {
    setError('Tên danh mục là bắt buộc');
    setValidationErrors([{ field: 'name', message: 'Tên danh mục không được để trống' }]);
    return;
  }

  if (newCategoryName.length > 100) {
    setError('Tên danh mục quá dài');
    setValidationErrors([{ field: 'name', message: 'Tên danh mục không được vượt quá 100 ký tự' }]);
    return;
  }

  try {
    setIsSaving(true);
    setError(null);
    setValidationErrors([]);
    
    // API call...
    
  } catch (err: any) {
    const apiError = extractApiError(err);
    setError(apiError.message);
    if (apiError.errors) {
      setValidationErrors(apiError.errors);
    }
  }
};
```

### Bước 3: Hiển thị lỗi trong UI

```tsx
// Inline error cho từng field
<div className="col-span-3">
  <Input
    value={newCategoryName}
    onChange={(e) => setNewCategoryName(e.target.value)}
    className={getFieldError(validationErrors, 'name') ? 'border-destructive' : ''}
  />
  {getFieldError(validationErrors, 'name') && (
    <p className="text-sm text-destructive mt-1">
      {getFieldError(validationErrors, 'name')}
    </p>
  )}
</div>

// Error summary
{error && (
  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
    <p className="font-medium">{error}</p>
    {validationErrors.length > 0 && (
      <ul className="mt-2 list-disc list-inside space-y-1">
        {validationErrors.map((err, idx) => (
          <li key={idx}>
            <span className="font-medium">{err.field}:</span> {err.message}
          </li>
        ))}
      </ul>
    )}
  </div>
)}
```

## Cách áp dụng cho các module khác

### Products Module

1. Tạo `/src/schemas/product.schema.ts`:

```typescript
import * as v from 'valibot';

export const productSchema = v.object({
  name: v.pipe(
    v.string('Tên sản phẩm là bắt buộc'),
    v.minLength(1, 'Tên sản phẩm không được để trống'),
    v.maxLength(200, 'Tên sản phẩm không được vượt quá 200 ký tự')
  ),
  price: v.pipe(
    v.number('Giá phải là số'),
    v.minValue(0, 'Giá phải lớn hơn hoặc bằng 0')
  ),
  stock: v.pipe(
    v.number('Số lượng phải là số'),
    v.minValue(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
    v.integer('Số lượng phải là số nguyên')
  ),
  categoryId: v.pipe(
    v.string('Danh mục là bắt buộc'),
    v.minLength(1, 'Vui lòng chọn danh mục')
  ),
  sku: v.pipe(
    v.string('SKU là bắt buộc'),
    v.minLength(1, 'SKU không được để trống')
  ),
  description: v.optional(v.string()),
  discount: v.optional(
    v.pipe(
      v.number(),
      v.minValue(0, 'Giảm giá phải >= 0'),
      v.maxValue(100, 'Giảm giá phải <= 100')
    )
  ),
});
```

2. Áp dụng validation tương tự trong ProductsPage

### Users Module

```typescript
export const userSchema = v.object({
  name: v.pipe(
    v.string('Tên là bắt buộc'),
    v.minLength(1, 'Tên không được để trống')
  ),
  email: v.pipe(
    v.string('Email là bắt buộc'),
    v.email('Email không hợp lệ')
  ),
  phone: v.optional(
    v.pipe(
      v.string(),
      v.regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
    )
  ),
});
```

### Vouchers Module

```typescript
export const voucherSchema = v.object({
  code: v.pipe(
    v.string('Mã voucher là bắt buộc'),
    v.minLength(3, 'Mã voucher phải có ít nhất 3 ký tự'),
    v.maxLength(20, 'Mã voucher không được vượt quá 20 ký tự'),
    v.regex(/^[A-Z0-9]+$/, 'Mã voucher chỉ được chứa chữ in hoa và số')
  ),
  discount: v.pipe(
    v.number('Giá trị giảm giá là bắt buộc'),
    v.minValue(0, 'Giá trị giảm giá phải >= 0')
  ),
  minPurchase: v.pipe(
    v.number('Đơn hàng tối thiểu là bắt buộc'),
    v.minValue(0, 'Đơn hàng tối thiểu phải >= 0')
  ),
  expiryDate: v.pipe(
    v.string('Ngày hết hạn là bắt buộc'),
    v.minLength(1, 'Vui lòng chọn ngày hết hạn')
  ),
});
```

## Best Practices

1. **Validation 2 lớp**: 
   - Frontend validation: Kiểm tra ngay lập tức, UX tốt hơn
   - Backend validation: Đảm bảo data integrity

2. **Error Messages rõ ràng**:
   - Sử dụng tiếng Việt
   - Cụ thể về lỗi gì và cách sửa

3. **Hiển thị lỗi**:
   - Inline error cho từng field (màu đỏ border + text)
   - Summary error ở cuối form (danh sách tất cả lỗi)

4. **Clear errors**:
   - Clear errors khi user bắt đầu sửa
   - Clear errors khi submit thành công

## Packages đã cài đặt

```json
{
  "@tanstack/react-form": "latest",
  "valibot": "latest",
  "@tanstack/valibot-form-adapter": "latest"
}
```

## Next Steps

- [ ] Áp dụng validation cho ProductsPage
- [ ] Áp dụng validation cho UsersPage
- [ ] Áp dụng validation cho VouchersPage
- [ ] Áp dụng validation cho BannersPage
- [ ] Áp dụng validation cho StoresPage
- [ ] Áp dụng validation cho FlashSalesPage
- [ ] Áp dụng validation cho OrdersPage (nếu cần)
- [ ] Áp dụng validation cho ReviewsPage (nếu cần)
