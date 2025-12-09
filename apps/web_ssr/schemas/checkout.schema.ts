import * as v from 'valibot';

export const checkoutSchema = v.object({
  name: v.pipe(
    v.string('Tên khách hàng là bắt buộc'),
    v.minLength(1, 'Tên khách hàng không được để trống'),
    v.maxLength(100, 'Tên khách hàng không được vượt quá 100 ký tự')
  ),
  phone: v.optional(
    v.union([
      v.literal(''),
      v.pipe(
        v.string(),
        v.regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số')
      )
    ])
  ),
  email: v.pipe(
    v.string('Email là bắt buộc'),
    v.email('Email không hợp lệ')
  ),
  storeId: v.pipe(
    v.string('Địa điểm nhận hàng là bắt buộc'),
    v.minLength(1, 'Vui lòng chọn địa điểm nhận hàng')
  ),
  notes: v.optional(v.string()),
  expressDelivery: v.optional(v.boolean()),
});


export type CheckoutFormData = v.InferOutput<typeof checkoutSchema>;

