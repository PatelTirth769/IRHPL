import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const frontendEnv = loadEnv(mode, process.cwd(), '');
  const backendDir = path.resolve(import.meta.dirname, '../backend');
  const backendEnvFile = path.resolve(backendDir, '.env');

  // Load the backend .env file to dynamically get PORT as the single source of truth for dev
  const backendEnv = loadEnv(mode, backendDir, '');
  const backendPort = backendEnv.PORT || 5000;

  // Default to relative '/api/v1' so requests work seamlessly:
  // - In local dev: Vite's server.proxy forwards '/api' to http://localhost:${backendPort}
  // - In live production: Nginx / reverse proxy forwards '/api' to backend
  const defaultApiUrl = '/api/v1';
  const apiUrl = frontendEnv.VITE_API_URL || process.env.VITE_API_URL || defaultApiUrl;

  process.env.VITE_API_URL = apiUrl;

  return {
    plugins: [
      react(),
      {
        name: 'watch-backend-env',
        configureServer(server) {
          // Watch backend/.env so Vite automatically restarts if PORT changes in backend/.env
          server.watcher.add(backendEnvFile);
          server.watcher.on('change', (changedPath) => {
            if (path.resolve(changedPath) === backendEnvFile) {
              console.log('\n[vite] backend/.env changed. Automatically restarting dev server with new port configuration...');
              server.restart();
            }
          });
        },
      },
    ],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    server: {
      allowedHosts: true,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
