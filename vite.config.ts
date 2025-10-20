import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

<<<<<<< HEAD
// https://vitejs.dev/config/
=======
>>>>>>> 385105deeaeec01a51b29ec67774ee6d4c608afa
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
<<<<<<< HEAD
    mode === 'development' &&
    componentTagger(),
=======
    mode === 'development' && componentTagger(),
>>>>>>> 385105deeaeec01a51b29ec67774ee6d4c608afa
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
