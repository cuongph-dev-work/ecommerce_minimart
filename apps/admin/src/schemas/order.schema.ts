import * as v from 'valibot';

export const createOrderSchema = v.object({
  customerName: v.pipe(
    v.string('Tên khách hàng là bắt buộc'),
    v.minLength(1, 'Tên khách hàng không được để trống'),
    v.maxLength(100, 'Tên khách hàng không được vượt quá 100 ký tự')
  ),
  customerPhone: v.pipe(
    v.string('Số điện thoại là bắt buộc'),
    v.regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số')
  ),
  customerEmail: v.pipe(
    v.string('Email là bắt buộc'),
    v.minLength(1, 'Email không được để trống'),
    v.email('Email không hợp lệ')
  ),
  pickupStoreId: v.pipe(
    v.string('Cửa hàng nhận là bắt buộc'),
    v.minLength(1, 'Vui lòng chọn cửa hàng nhận')
  ),
  items: v.pipe(
    v.array(
      v.object({
        productId: v.string(),
        quantity: v.pipe(
          v.number('Số lượng phải là số'),
          v.minValue(1, 'Số lượng phải lớn hơn 0'),
          v.integer('Số lượng phải là số nguyên')
        ),
      })
    ),
    v.minLength(1, 'Vui lòng chọn ít nhất 1 sản phẩm')
  ),
  notes: v.optional(v.string()),
  voucherCode: v.optional(v.string()),
});

export type CreateOrderInput = v.InferInput<typeof createOrderSchema>;
