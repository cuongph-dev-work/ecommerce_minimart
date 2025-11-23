import * as v from 'valibot';

/**
 * Schema for creating/updating a product
 */
export const productSchema = v.object({
  name: v.pipe(
    v.string('Tên sản phẩm là bắt buộc'),
    v.minLength(1, 'Tên sản phẩm không được để trống'),
    v.maxLength(200, 'Tên sản phẩm không được vượt quá 200 ký tự')
  ),
  sku: v.pipe(
    v.string('Mã SKU là bắt buộc'),
    v.minLength(1, 'Mã SKU không được để trống'),
    v.maxLength(50, 'Mã SKU không được vượt quá 50 ký tự')
  ),
  price: v.pipe(
    v.number('Giá phải là số'),
    v.minValue(0, 'Giá phải lớn hơn hoặc bằng 0')
  ),
  stock: v.pipe(
    v.number('Số lượng tồn kho phải là số'),
    v.minValue(0, 'Số lượng tồn kho phải lớn hơn hoặc bằng 0'),
    v.integer('Số lượng tồn kho phải là số nguyên')
  ),
  categoryId: v.pipe(
    v.string('Danh mục là bắt buộc'),
    v.minLength(1, 'Vui lòng chọn danh mục')
  ),
  brand: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(100, 'Thương hiệu không được vượt quá 100 ký tự')
    )
  ),
  discount: v.optional(
    v.pipe(
      v.number(),
      v.minValue(0, 'Giảm giá phải >= 0'),
      v.maxValue(100, 'Giảm giá phải <= 100')
    )
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(2000, 'Mô tả không được vượt quá 2000 ký tự')
    )
  ),
  warrantyPeriod: v.optional(v.string()),
  subcategoryId: v.optional(v.string()),
  isOfficial: v.optional(v.boolean()),
});

export type ProductFormData = v.InferOutput<typeof productSchema>;
