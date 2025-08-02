import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'ProSub',
        short_name: 'ProSub',
        description: '你的私人代理订阅与节点管理中心',
        theme_color: '#00b96b'
        icons: [ // <-- 添加 icons 数组
          {
            src: 'logo-192.svg', // 确保这个文件在 public 目录下
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'logo-512.svg', // 确保这个文件在 public 目录下
            sizes: '512x512',
            type: 'image/svg+xml',
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,json}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      },
      injectRegister: 'auto'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './packages/shared'),
    },
  },
  server: {
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})