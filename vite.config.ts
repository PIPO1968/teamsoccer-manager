
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = process.env.VITE_IS_DEVELOPMENT === 'true';
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Make sure environment variables are available
      'import.meta.env.VITE_IS_DEVELOPMENT': JSON.stringify(process.env.VITE_IS_DEVELOPMENT || 'false'),
    },
    build: {
      // Configure build options based on development mode
      minify: !isDevelopment ? 'terser' : false,
      sourcemap: isDevelopment, // Generate sourcemaps in development
      terserOptions: !isDevelopment ? {
        compress: {
          drop_console: true, // Remove console.log statements in production
          drop_debugger: true, // Remove debugger statements
        },
        mangle: true, // Mangle variable names for smaller bundle size
        format: {
          comments: false, // Remove comments
        },
      } : undefined,
      rollupOptions: {
        output: {
          // Only mangle in production
          manualChunks: !isDevelopment ? {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-slot'],
          } : undefined,
        },
      },
    },
  };
});
