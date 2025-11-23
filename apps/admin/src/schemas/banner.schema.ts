import * as v from 'valibot';

/**
 * Schema for creating/updating a banner
 */
export const bannerSchema = v.object({
  title: v.pipe(
    v.string('Tiêu đề là bắt buộc'),
    v.minLength(1, 'Tiêu đề không được để trống'),
    v.maxLength(200, 'Tiêu đề không được vượt quá 200 ký tự')
  ),
  image: v.pipe(
    v.string('Hình ảnh là bắt buộc'),
    v.minLength(1, 'Vui lòng chọn hình ảnh')
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'Mô tả không được vượt quá 500 ký tự')
    )
  ),
  link: v.optional(v.string()),
  sortOrder: v.optional(
    v.pipe(
      v.number(),
      v.minValue(1, 'Thứ tự phải >= 1'),
      v.integer('Thứ tự phải là số nguyên')
    )
  ),
  status: v.optional(v.string()),
});

export type BannerFormData = v.InferOutput<typeof bannerSchema>;
