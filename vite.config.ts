import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 5173,
    cors: true,
    hmr: {
      port: 5173,
    },
  },
  plugins: [
    react({
      fastRefresh: false,
      include: "**/*.{jsx,tsx}",
      jsxRuntime: 'automatic',
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true,
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-router': ['react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          // Feature chunks
          'analytics': ['./src/hooks/useProductAnalytics.ts', './src/hooks/useAnalytics.ts'],
          'auth': ['./src/hooks/useAuth.ts', './src/contexts/AuthContext.tsx'],
          'board': ['./src/hooks/useIssues.ts', './src/hooks/useBoardFilters.ts'],
          'sprints': ['./src/hooks/useSprints.ts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
