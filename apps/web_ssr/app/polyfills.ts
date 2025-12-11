// Import core-js polyfills for older browsers
import 'core-js/stable/promise';
import 'core-js/stable/array/from';
import 'core-js/stable/array/includes';
import 'core-js/stable/object/assign';
import 'core-js/stable/object/entries';
import 'core-js/stable/object/values';
import 'core-js/stable/string/includes';
import 'core-js/stable/string/starts-with';
import 'core-js/stable/string/ends-with';

// Polyfill for ResizeObserver (for older iOS browsers)
if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  import('@juggle/resize-observer').then((module) => {
    (window as any).ResizeObserver = module.ResizeObserver;
  }).catch(() => {
    // Silently fail if polyfill cannot be loaded
  });
}

export {};
