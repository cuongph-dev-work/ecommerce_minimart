
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

  export default defineConfig(({ mode }) => {
    // Load env file from same directory as vite.config.ts (apps/web)
    const env = loadEnv(mode, __dirname, '');
    
    return {
    plugins: [
      react(),
      // Plugin to fetch settings from API and inject into HTML during build
      {
        name: 'html-settings-inject',
        async transformIndexHtml(html: string, context) {
          const apiUrl = env.VITE_API_URL;
          let settings: Record<string, string> = {};
          
          // Only fetch settings during build (not in dev mode)
          // context.server is undefined during build
          const isBuild = !context.server;
          
          if (isBuild && typeof fetch !== 'undefined' && apiUrl) {
            try {
              const response = await fetch(`${apiUrl}/settings`);
              const data = await response.json() as { success: boolean; data?: Record<string, string> };
              if (data.success && data.data) {
                settings = data.data;
                console.log('✓ Fetched settings from API during build');
              }
            } catch (error) {
              console.warn('⚠ Could not fetch settings during build, using defaults:', error instanceof Error ? error.message : error);
            }
          }
          
          // Update title
          const storeName = settings.store_name || 'Little Box';
          html = html.replace(
            /<title>.*?<\/title>/,
            `<title>${storeName}</title>`
          );
          
          // Update meta description
          const description = settings.store_description || '';
          if (description) {
            html = html.replace(
              /<meta name="description" content=".*?" \/>/,
              `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`
            );
          }
          
          // Inject env config as a script tag before the settings preload script
          const envScript = `<script>
            window.__ENV_CONFIG__ = {
              VITE_API_URL: '${apiUrl}'
            };
          </script>`;
          return html.replace(
            '<script>',
            envScript + '\n      <script>'
          );
        },
        configureServer(server) {
          // Also inject in dev mode via middleware
          server.middlewares.use((req, res, next) => {
            if (req.url === '/' || req.url === '/index.html') {
              const originalEnd = res.end.bind(res);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              res.end = function(chunk?: any, encoding?: BufferEncoding | (() => void), cb?: () => void) {
                if (chunk && typeof chunk === 'string') {
                  const apiUrl = env.VITE_API_URL;
                  const envScript = `<script>
            window.__ENV_CONFIG__ = {
              VITE_API_URL: '${apiUrl}'
            };
          </script>`;
                  const modified = chunk.replace(
                    '<script>',
                    envScript + '\n      <script>'
                  );
                  res.setHeader('Content-Length', Buffer.byteLength(modified));
                  return originalEnd(modified, encoding as BufferEncoding, cb);
                }
                return originalEnd(chunk, encoding as BufferEncoding, cb);
              };
            }
            next();
          });
        },
      },
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});