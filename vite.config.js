import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        mac: 'mac.html',
        ipad: 'ipad.html',
        iphone: 'iphone.html',
        watch: 'watch.html',
        airpods: 'airpods.html',
        store: 'store.html'
      }
    }
  }
})