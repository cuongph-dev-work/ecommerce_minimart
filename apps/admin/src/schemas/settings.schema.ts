import * as v from 'valibot';

/**
 * Schema for updating store settings
 */
export const storeSettingsSchema = v.object({
  store_name: v.pipe(
    v.string('Tên cửa hàng là bắt buộc'),
    v.minLength(1, 'Tên cửa hàng không được để trống'),
    v.maxLength(200, 'Tên cửa hàng không được vượt quá 200 ký tự')
  ),
  store_logo: v.optional(
    v.pipe(
      v.string(),
      v.minLength(1, 'URL logo không hợp lệ')
    )
  ),
  store_phone: v.pipe(
    v.string('Số điện thoại là bắt buộc'),
    v.minLength(1, 'Số điện thoại không được để trống'),
    v.regex(/^[0-9\s\-()]+$/, 'Số điện thoại không hợp lệ')
  ),
  store_email: v.pipe(
    v.string('Email là bắt buộc'),
    v.email('Email không hợp lệ')
  ),
  store_address: v.pipe(
    v.string('Địa chỉ là bắt buộc'),
    v.minLength(1, 'Địa chỉ không được để trống'),
    v.maxLength(500, 'Địa chỉ không được vượt quá 500 ký tự')
  ),
  store_description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(1000, 'Mô tả không được vượt quá 1000 ký tự')
    )
  ),
  facebook_link: v.optional(
    v.pipe(
      v.string(),
      v.url('Link Facebook không hợp lệ')
    )
  ),
  instagram_link: v.optional(
    v.pipe(
      v.string(),
      v.url('Link Instagram không hợp lệ')
    )
  ),
  telegram_link: v.optional(
    v.pipe(
      v.string(),
      v.url('Link Telegram không hợp lệ')
    )
  ),
  youtube_link: v.optional(
    v.pipe(
      v.string(),
      v.url('Link YouTube không hợp lệ')
    )
  ),
  tiktok_link: v.optional(
    v.pipe(
      v.string(),
      v.url('Link TikTok không hợp lệ')
    )
  ),
  working_hours: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(200, 'Giờ làm việc không được vượt quá 200 ký tự')
    )
  ),
});

/**
 * Schema for updating payment settings
 */
export const paymentSettingsSchema = v.object({
  bank_account: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(50, 'Số tài khoản không được vượt quá 50 ký tự')
    )
  ),
  account_name: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(200, 'Tên chủ tài khoản không được vượt quá 200 ký tự')
    )
  ),
  bank_name: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(200, 'Tên ngân hàng không được vượt quá 200 ký tự')
    )
  ),
  bank_branch: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(200, 'Chi nhánh không được vượt quá 200 ký tự')
    )
  ),
  transfer_note: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(200, 'Nội dung chuyển khoản không được vượt quá 200 ký tự')
    )
  ),
});

/**
 * Schema for updating policy settings
 */
export const policySettingsSchema = v.object({
  warranty_policy: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(5000, 'Chính sách bảo hành không được vượt quá 5000 ký tự')
    )
  ),
  return_policy: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(5000, 'Chính sách đổi trả không được vượt quá 5000 ký tự')
    )
  ),
  shopping_guide: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(5000, 'Hướng dẫn mua hàng không được vượt quá 5000 ký tự')
    )
  ),
  faq: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(5000, 'FAQ không được vượt quá 5000 ký tự')
    )
  ),
});

export type StoreSettingsFormData = v.InferOutput<typeof storeSettingsSchema>;
export type PaymentSettingsFormData = v.InferOutput<typeof paymentSettingsSchema>;
export type PolicySettingsFormData = v.InferOutput<typeof policySettingsSchema>;

