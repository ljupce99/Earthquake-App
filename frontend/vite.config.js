import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
    const proxyTarget = process.env.VITE_API_TARGET || 'http://localhost:8080'

    return {
        plugins: [react()],
        server: {
            host: '0.0.0.0',
            port: 3005,
            proxy: {
                '/api': {
                    target: proxyTarget,
                    changeOrigin: true,
                }
            }
        }
    }
})
