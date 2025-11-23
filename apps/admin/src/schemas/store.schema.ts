import * as v from 'valibot';

/**
 * Schema for creating/updating a store
 */
export const storeSchema = v.object({
  name: v.pipe(
    v.string('Tên chi nhánh là bắt buộc'),
    v.minLength(1, 'Tên chi nhánh không được để trống'),
    v.maxLength(200, 'Tên chi nhánh không được vượt quá 200 ký tự')
  ),
  address: v.pipe(
    v.string('Địa chỉ là bắt buộc'),
    v.minLength(1, 'Địa chỉ không được để trống'),
    v.maxLength(500, 'Địa chỉ không được vượt quá 500 ký tự')
  ),
  phone: v.pipe(
    v.string('Số điện thoại là bắt buộc'),
    v.minLength(1, 'Số điện thoại không được để trống'),
    v.regex(/^[0-9\s\-()]+$/, 'Số điện thoại không hợp lệ')
  ),
  email: v.optional(
    v.pipe(
      v.string(),
      v.email('Email không hợp lệ')
    )
  ),
  lat: v.optional(
    v.pipe(
      v.number(),
      v.minValue(-90, 'Latitude phải từ -90 đến 90'),
      v.maxValue(90, 'Latitude phải từ -90 đến 90')
    )
  ),
  lng: v.optional(
    v.pipe(
      v.number(),
      v.minValue(-180, 'Longitude phải từ -180 đến 180'),
      v.maxValue(180, 'Longitude phải từ -180 đến 180')
    )
  ),
  workingHours: v.optional(
    v.object({
      weekdays: v.object({
        start: v.string(),
        end: v.string(),
      }),
      weekends: v.object({
        start: v.string(),
        end: v.string(),
      }),
    })
  ),
  services: v.optional(v.array(v.string())),
  allowPickup: v.optional(v.boolean()),
  preparationTime: v.optional(v.string()),
  status: v.optional(v.picklist(['active', 'inactive'], 'Trạng thái không hợp lệ')),
});

export type StoreFormData = v.InferOutput<typeof storeSchema>;
