import * as v from 'valibot';

/**
 * Schema for creating/updating a voucher
 */
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
  maxDiscount: v.optional(
    v.pipe(
      v.number(),
      v.minValue(0, 'Giảm tối đa phải >= 0')
    )
  ),
  maxUses: v.optional(
    v.pipe(
      v.number(),
      v.minValue(1, 'Số lượt sử dụng phải >= 1'),
      v.integer('Số lượt sử dụng phải là số nguyên')
    )
  ),
  expiryDate: v.pipe(
    v.string('Ngày hết hạn là bắt buộc'),
    v.minLength(1, 'Vui lòng chọn ngày hết hạn')
  ),
});

export type VoucherFormData = v.InferOutput<typeof voucherSchema>;
