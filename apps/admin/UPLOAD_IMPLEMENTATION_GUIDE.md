# Upload Implementation Guide

## Tổng quan

Guide này mô tả cách triển khai upload ảnh tối ưu cho các form trong admin panel. Logic upload được thiết kế để:

1. **Tránh tạo file rác**: Chỉ upload khi form pass validate và API submit thành công
2. **Hỗ trợ rollback**: Tự động xóa files đã upload nếu có lỗi
3. **Preview trước khi upload**: Cho phép user xem preview ảnh trước khi submit
4. **Progress tracking**: Hiển thị tiến trình upload

## Kiến trúc

### 1. UploadHelper Utility (`lib/upload-helper.ts`)

Utility class cung cấp các helper functions:

- `validateFile()`: Validate file trước khi upload
- `createPreview()`: Tạo preview URL từ File object
- `revokePreview()`: Giải phóng memory của preview URL
- `uploadBatch()`: Upload nhiều files với rollback support
- `rollbackUploads()`: Xóa files đã upload nếu có lỗi

### 2. State Management

Form cần quản lý 2 loại state:

```typescript
// Files chưa upload (pending)
const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

// URLs đã upload hoặc từ URL input
const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
```

**PendingFile Interface:**
```typescript
interface PendingFile {
  file: File;           // File object
  preview: string;      // Blob URL for preview
  id: string;          // Unique ID
}
```

## Triển khai Step-by-Step

### Step 1: Import Dependencies

```typescript
import { UploadHelper, type PendingFile } from '@/lib/upload-helper';
```

### Step 2: Setup State

```typescript
const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
const [currentImageUrl, setCurrentImageUrl] = useState('');
const [uploadingImages, setUploadingImages] = useState<Record<number, number>>({});
```

### Step 3: Handle File Selection

Khi user chọn file, **KHÔNG upload ngay**, chỉ validate và tạo preview:

```typescript
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate max images
  const totalImages = pendingFiles.length + uploadedImageUrls.length;
  if (totalImages >= 5) {
    setValidationErrors([{ field: 'images', message: 'Tối đa 5 hình ảnh' }]);
    return;
  }

  // Validate file
  const validation = UploadHelper.validateFile(file, {
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  if (!validation.valid) {
    setValidationErrors([{ field: 'images', message: validation.error }]);
    return;
  }

  // Create preview and add to pending files
  const preview = UploadHelper.createPreview(file);
  const pendingFile: PendingFile = {
    file,
    preview,
    id: `${Date.now()}-${Math.random()}`,
  };

  setPendingFiles([...pendingFiles, pendingFile]);
  
  // Reset input
  if (e.target) {
    e.target.value = '';
  }
};
```

### Step 4: Handle URL Input

URL images không cần upload, chỉ cần lưu vào state:

```typescript
const handleAddImage = () => {
  if (currentImageUrl) {
    const totalImages = pendingFiles.length + uploadedImageUrls.length;
    if (totalImages >= 5) {
      setValidationErrors([{ field: 'images', message: 'Tối đa 5 hình ảnh' }]);
      return;
    }
    setUploadedImageUrls([...uploadedImageUrls, currentImageUrl]);
    setCurrentImageUrl('');
  }
};
```

### Step 5: Handle Remove Image

```typescript
const handleRemoveImage = (type: 'pending' | 'uploaded', index: number) => {
  if (type === 'pending') {
    const file = pendingFiles[index];
    // Revoke preview URL to free memory
    UploadHelper.revokePreview(file.preview);
    setPendingFiles(pendingFiles.filter((_, i) => i !== index));
  } else {
    setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index));
  }
};
```

### Step 6: Handle Form Submit

**Đây là phần quan trọng nhất** - Upload chỉ khi form pass validate:

```typescript
const handleSave = async () => {
  // Step 1: Frontend validation
  const result = safeParse(schema, formData);
  if (!result.success) {
    setValidationErrors(/* map errors */);
    return; // Stop here, don't upload
  }

  try {
    setIsSaving(true);
    setValidationErrors([]);

    // Step 2: Upload pending files (only if there are any)
    let uploadedUrls: string[] = [...uploadedImageUrls];
    
    if (pendingFiles.length > 0) {
      const filesToUpload = pendingFiles.map(pf => pf.file);
      
      // Track upload progress
      const uploadProgress: Record<number, number> = {};
      setUploadingImages(uploadProgress);

      try {
        const uploadResult = await UploadHelper.uploadBatch(
          filesToUpload,
          'product', // or 'banner', 'category', 'store'
          {
            onProgress: (progress, fileIndex) => {
              setUploadingImages(prev => ({ ...prev, [fileIndex]: progress }));
            },
          }
        );

        // Add uploaded URLs
        uploadedUrls = [...uploadedUrls, ...uploadResult.uploaded.map(u => u.url)];

        // Clean up preview URLs
        pendingFiles.forEach(pf => UploadHelper.revokePreview(pf.preview));
      } catch (uploadError) {
        // Upload failed - stop here, don't create entity
        const apiError = extractApiError(uploadError);
        setValidationErrors([{ field: 'images', message: apiError.message }]);
        return; // Stop here
      } finally {
        setUploadingImages({});
      }
    }

    // Step 3: Create/Update entity with uploaded URLs
    const entityData = {
      ...formData,
      images: uploadedUrls,
    };

    await entityService.create(entityData); // or update()

    // Step 4: Success - cleanup and close
    setIsAddSheetOpen(false);
    resetForm();
    await fetchEntities();
  } catch (err) {
    // If entity creation fails, uploaded files remain on server
    // TODO: Implement rollback when backend supports delete endpoint
    const apiError = extractApiError(err);
    setValidationErrors(/* handle errors */);
  } finally {
    setIsSaving(false);
    setUploadingImages({});
  }
};
```

### Step 7: Reset Form

Clean up preview URLs khi reset form:

```typescript
const resetForm = () => {
  // Clean up preview URLs before clearing state
  pendingFiles.forEach(pf => UploadHelper.revokePreview(pf.preview));
  setPendingFiles([]);
  setUploadedImageUrls([]);
  setCurrentImageUrl('');
  setUploadingImages({});
  setValidationErrors([]);
  // ... other fields
};
```

### Step 8: UI Display

Hiển thị pending files và uploaded URLs riêng biệt:

```typescript
{/* Pending files (not yet uploaded) */}
{pendingFiles.map((pendingFile, index) => (
  <div key={pendingFile.id} className="relative group">
    <img src={pendingFile.preview} alt={`Pending ${index + 1}`} />
    <div className="badge">Chờ upload</div>
    <button onClick={() => handleRemoveImage('pending', index)}>
      <X />
    </button>
  </div>
))}

{/* Uploaded URLs */}
{uploadedImageUrls.map((url, index) => (
  <div key={`uploaded-${index}`} className="relative group">
    <img src={url} alt={`Uploaded ${index + 1}`} />
    <button onClick={() => handleRemoveImage('uploaded', index)}>
      <X />
    </button>
  </div>
))}

{/* Upload progress */}
{Object.entries(uploadingImages).map(([index, progress]) => (
  <div key={`uploading-${index}`}>
    <div>Đang upload... {progress}%</div>
    <ProgressBar value={progress} />
  </div>
))}
```

## Best Practices

### 1. Memory Management

Luôn revoke preview URLs khi không cần nữa:

```typescript
// When removing pending file
UploadHelper.revokePreview(file.preview);

// When resetting form
pendingFiles.forEach(pf => UploadHelper.revokePreview(pf.preview));
```

### 2. Error Handling

- Validate file trước khi thêm vào pending
- Validate form trước khi upload
- Handle upload errors và rollback nếu có thể
- Show clear error messages

### 3. User Experience

- Show preview ngay khi chọn file
- Display upload progress
- Distinguish pending vs uploaded images
- Disable form khi đang upload

### 4. Performance

- Upload files sequentially (not parallel) để dễ rollback
- Clean up preview URLs để tránh memory leak
- Limit số lượng files (e.g., max 5)

## Rollback Implementation

Hiện tại `rollbackUploads()` chỉ log warnings. Để implement đầy đủ:

1. **Backend**: Tạo DELETE endpoint cho images
   ```typescript
   DELETE /upload/images/:url
   ```

2. **Frontend**: Update `rollbackUploads()`:
   ```typescript
   static async rollbackUploads(uploaded: UploadResponse[]): Promise<void> {
     for (const upload of uploaded) {
       try {
         await uploadService.deleteImage(upload.url);
       } catch (error) {
         console.error('Failed to delete:', upload.url, error);
       }
     }
   }
   ```

3. **Upload Service**: Thêm delete method:
   ```typescript
   async deleteImage(url: string): Promise<void> {
     await apiClient.delete('/upload/images', { 
       params: { url } 
     });
   }
   ```

## Ví dụ hoàn chỉnh

Xem implementation trong:
- `apps/admin/src/pages/ProductsPage.tsx` - Product form với upload
- `apps/admin/src/lib/upload-helper.ts` - UploadHelper utility

## Checklist khi triển khai module mới

- [ ] Import `UploadHelper` và types
- [ ] Setup state: `pendingFiles`, `uploadedImageUrls`
- [ ] Implement `handleImageUpload` (validate + preview, không upload)
- [ ] Implement `handleAddImage` (URL input)
- [ ] Implement `handleRemoveImage` (cleanup preview)
- [ ] Update `handleSave` để upload trước khi create/update
- [ ] Update `resetForm` để cleanup preview URLs
- [ ] Update UI để hiển thị pending vs uploaded
- [ ] Test error scenarios (upload fail, create fail)
- [ ] Test memory cleanup (check DevTools)

## Troubleshooting

### Memory Leak

**Symptom**: Browser memory tăng khi chọn nhiều files

**Solution**: Đảm bảo revoke preview URLs:
```typescript
pendingFiles.forEach(pf => UploadHelper.revokePreview(pf.preview));
```

### Files không upload

**Symptom**: Files ở trạng thái "Chờ upload" mãi

**Solution**: Kiểm tra:
- Form validation có pass không?
- `handleSave` có được gọi không?
- Upload API có hoạt động không?

### Upload fail nhưng files vẫn trên server

**Symptom**: Files đã upload nhưng entity không được tạo

**Solution**: Implement rollback (xem phần Rollback Implementation)

## Notes

- Logic này đảm bảo không có file rác trên server
- Files chỉ được upload khi form pass validate
- Nếu upload fail, không tạo entity
- Nếu entity creation fail, files vẫn trên server (cần rollback endpoint)

