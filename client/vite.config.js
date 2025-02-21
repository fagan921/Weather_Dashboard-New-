import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Specify build output directory
  build: {
    outDir: path.resolve(__dirname, 'dist'), // Correcting this to ensure it outputs to the client/dist folder
    emptyOutDir: true, // Ensure the directory is emptied before building
  },
  
  // Development server configuration
  server: {
    port: 3000,  // Default port for dev server
    open: true,  // Automatically open the browser
    proxy: {
      // Proxy for API calls (this will only be active during development)
      '/api': {
        target: 'http://localhost:3001', // Backend running on port 3001
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Production settings (optional but useful for deployment)
  plugins: [
    // Add any plugins you might need for production or development
  ],
});
