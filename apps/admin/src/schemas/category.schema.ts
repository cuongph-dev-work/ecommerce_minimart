import * as v from 'valibot';

/**
 * Schema for creating/updating a category
 */
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
  icon: v.optional(v.string()),
  parentId: v.optional(v.string()),
});

/**
 * Schema for creating/updating a subcategory
 */
export const subcategorySchema = v.object({
  name: v.pipe(
    v.string('Tên danh mục con là bắt buộc'),
    v.minLength(1, 'Tên danh mục con không được để trống'),
    v.maxLength(100, 'Tên danh mục con không được vượt quá 100 ký tự')
  ),
  parentId: v.pipe(
    v.string('Danh mục cha là bắt buộc'),
    v.minLength(1, 'Vui lòng chọn danh mục cha')
  ),
});

export type CategoryFormData = v.InferOutput<typeof categorySchema>;
export type SubcategoryFormData = v.InferOutput<typeof subcategorySchema>;
