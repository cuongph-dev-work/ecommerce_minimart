// Environment configuration
// This file exports env variables that can be used in both client and build time

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Make it available globally for inline scripts
if (typeof window !== 'undefined') {
  (window as any).__API_URL__ = API_URL;
}

