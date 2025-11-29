// Environment configuration for Next.js
export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};
