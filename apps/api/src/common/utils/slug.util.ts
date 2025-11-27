import slugify from 'slugify';

/**
 * Generate slug with timestamp from name
 * Example: "Điện Thoại" -> "dien-thoai-1734567890123"
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const baseSlug = slugify(text, {
    locale: 'vi', // Vietnamese locale support
    lower: true, // Convert to lowercase
    strict: true, // Remove special characters
    trim: true, // Remove leading/trailing spaces
  });

  if (!baseSlug) {
    return '';
  }

  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
}

