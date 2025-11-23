import * as v from 'valibot';

/**
 * Schema for creating/updating a flash sale
 */
export const flashSaleSchema = v.object({
  name: v.pipe(
    v.string('Tên flash sale là bắt buộc'),
    v.minLength(1, 'Tên không được để trống'),
    v.maxLength(200, 'Tên không được vượt quá 200 ký tự')
  ),
  startTime: v.pipe(
    v.string('Thời gian bắt đầu là bắt buộc'),
    v.minLength(1, 'Vui lòng chọn thời gian bắt đầu')
  ),
  endTime: v.pipe(
    v.string('Thời gian kết thúc là bắt buộc'),
    v.minLength(1, 'Vui lòng chọn thời gian kết thúc')
  ),
  discount: v.optional(
    v.pipe(
      v.number(),
      v.minValue(0, 'Giảm giá phải >= 0'),
      v.maxValue(100, 'Giảm giá phải <= 100')
    )
  ),
});

export type FlashSaleFormData = v.InferOutput<typeof flashSaleSchema>;
