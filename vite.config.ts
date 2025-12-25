import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/JobFit-AI/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client', 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
  },
  root: path.resolve(__dirname, 'client'),
  build: {
    outDir: process.env.GITHUB_PAGES === 'true'
      ? path.resolve(__dirname, 'docs')
      : path.resolve(__dirname, 'dist/public'),
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor chunks based on module path
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'vendor-react';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // Recharts (visualization)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms';
            }
            // Utility libraries
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-utils';
            }
            // Framer motion
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext ?? '')) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext ?? '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ['**/.*'],
    },
  },
});
