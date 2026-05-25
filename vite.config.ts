import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy libraries into their own chunks so the initial
          // bundle stays small and they can be cached independently.
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          d3: ['d3'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-raw'],
        },
      },
    },
  },
})
