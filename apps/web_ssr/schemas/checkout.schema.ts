import * as v from 'valibot';

export const checkoutSchema = v.object({
  name: v.pipe(
    v.string('Customer name is required'),
    v.minLength(1, 'Customer name cannot be empty'),
    v.maxLength(100, 'Customer name cannot exceed 100 characters')
  ),
  phone: v.optional(
    v.union([
      v.literal(''),
      v.pipe(
        v.string(),
        v.regex(/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits')
      )
    ])
  ),
  email: v.pipe(
    v.string('Email is required'),
    v.email('Invalid email')
  ),
  deliveryType: v.optional(
    v.union([
      v.literal('pickup'),
      v.literal('delivery')
    ])
  ),
  storeId: v.optional(v.string()),
  deliveryAddress: v.optional(v.string()),
  notes: v.optional(v.string()),
  expressDelivery: v.optional(v.boolean()),
});


export type CheckoutFormData = v.InferOutput<typeof checkoutSchema>;

