import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [ vue({
        template: {
            compilerOptions: {
                isCustomElement: tag => tag.startsWith('pippy-')
            }
        }
    }) ],
    server: {
        port: 8091,
        cors: { credentials: true, origin: true, preflightContinue: true }
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true
            }
        }
    },
    build: {
        sourcemap: false,
        target: "esnext"
    },
    resolve: {
        dedupe: [ 'vue', 'vue-router' ]
    }
})
