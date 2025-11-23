import { useForm } from '@tanstack/react-form';
import { valibotValidator } from '@tanstack/valibot-form-adapter';
import * as v from 'valibot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categorySchema, subcategorySchema, type CategoryFormData } from '@/schemas/category.schema';
import type { Category } from '@/types';
import * as Icons from 'lucide-react';
import { Package } from 'lucide-react';

const AVAILABLE_ICONS = [
  'Package',
  'Headphones',
  'Watch',
  'Camera',
  'Gamepad2',
  'Home',
  'Monitor',
  'Smartphone',
  'Tablet',
  'Tv',
  'Refrigerator',
  'Activity',
  'Shirt',
  'Footprints',
  'Coffee',
  'Utensils',
];

interface CategoryFormProps {
  mode: 'create' | 'edit' | 'edit-subcategory';
  initialData?: Partial<CategoryFormData> & { id?: string };
  categories?: Category[];
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  editingSubcategory?: { parentId: string; index: number; name: string } | null;
}

export function CategoryForm({
  mode,
  initialData,
  categories = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  editingSubcategory,
}: CategoryFormProps) {
  const isSubcategoryMode = mode === 'edit-subcategory' || (mode === 'create' && initialData?.parentId && initialData.parentId !== 'none');
  
  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      icon: initialData?.icon || 'Package',
      parentId: initialData?.parentId || 'none',
    } as CategoryFormData & { parentId: string },
    onSubmit: async ({ value }) => {
      const submitData: CategoryFormData = {
        name: value.name,
        description: value.description,
        icon: value.icon,
      };
      
      // Only add parentId if it's not 'none'
      if (value.parentId && value.parentId !== 'none') {
        submitData.parentId = value.parentId;
      }
      
      await onSubmit(submitData);
    },
    validatorAdapter: valibotValidator(),
  });

  const renderIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Package;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="grid gap-4 py-4"
    >
      {/* Parent Category Selection - Only show when creating new */}
      {mode === 'create' && !editingSubcategory && (
        <form.Field
          name="parentId"
          children={(field) => (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent" className="text-right">
                Danh mục cha
              </Label>
              <div className="col-span-3">
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục cha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không (Cấp cao nhất)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        />
      )}

      {/* Name Field */}
      <form.Field
        name="name"
        validators={{
          onChange: isSubcategoryMode
            ? subcategorySchema.entries.name
            : categorySchema.entries.name,
        }}
        children={(field) => (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tên {field.state.meta.errors.length > 0 && <span className="text-destructive">*</span>}
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={
                  isSubcategoryMode ? 'Tên danh mục con' : 'Tên danh mục'
                }
                className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive mt-1">
                  {field.state.meta.errors[0]?.toString()}
                </p>
              )}
            </div>
          </div>
        )}
      />

      {/* Description Field - Only for top-level categories */}
      {!isSubcategoryMode && (
        <form.Field
          name="description"
          validators={{
            onChange: categorySchema.entries.description,
          }}
          children={(field) => (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Mô tả
              </Label>
              <div className="col-span-3">
                <Input
                  id="description"
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive mt-1">
                    {field.state.meta.errors[0]?.toString()}
                  </p>
                )}
              </div>
            </div>
          )}
        />
      )}

      {/* Icon Field - Only for top-level categories */}
      {!isSubcategoryMode && (
        <form.Field
          name="icon"
          children={(field) => (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Biểu tượng
              </Label>
              <div className="col-span-3">
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn biểu tượng" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          {renderIcon(icon)}
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        />
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmittingForm]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting || isSubmittingForm}>
              {isSubmitting || isSubmittingForm ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
