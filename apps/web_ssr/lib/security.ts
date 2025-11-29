/**
 * Security utilities for URL validation and sanitization
 */

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    // Only allow http, https, mailto, tel protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL by validating it and returning a safe URL or null
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  // Validate URL
  if (!isValidUrl(trimmed)) return null;
  
  // Additional checks for common attack vectors
  if (trimmed.includes('javascript:') || 
      trimmed.includes('data:') || 
      trimmed.includes('vbscript:') ||
      trimmed.toLowerCase().includes('<script')) {
    return null;
  }
  
  return trimmed;
}

/**
 * Sanitizes an email address for mailto: links
 */
export function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email || typeof email !== 'string') return null;
  
  const trimmed = email.trim();
  if (!trimmed) return null;
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return null;
  
  // Prevent email injection
  if (trimmed.includes('\n') || trimmed.includes('\r') || trimmed.includes('%0a') || trimmed.includes('%0d')) {
    return null;
  }
  
  return trimmed;
}

/**
 * Sanitizes HTML content by removing potentially dangerous tags and attributes
 * This is a basic sanitizer - for production, consider using DOMPurify
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  
  return sanitized;
}

/**
 * Validates image URL - only allows http/https URLs
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const trimmed = url.trim();
  if (!trimmed) return false;
  
  try {
    const parsed = new URL(trimmed);
    // Only allow http and https for images
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    // Allow relative URLs for images
    return !trimmed.startsWith('javascript:') && 
           !trimmed.startsWith('data:') && 
           !trimmed.includes('<script');
  }
}

/**
 * Sanitizes image URL
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  if (!isValidImageUrl(trimmed)) return null;
  
  return trimmed;
}

