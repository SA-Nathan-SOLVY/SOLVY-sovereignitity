import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/**
 * Serve a public subfolder as truly static files, bypassing Vite's
 * module transform. Needed for onnxruntime-web .mjs/.wasm files and
 * tesseract.js worker/lang files.
 */
function serveStaticPublic(mountPath) {
  const folder = mountPath.replace(/^\//, '')
  return {
    name: `serve-static-${folder}`,
    configureServer(server) {
      server.middlewares.use(mountPath, (req, res, next) => {
        const urlPath = req.url.split('?')[0].replace(/^\//, '')
        const filePath = path.join(process.cwd(), 'public', folder, urlPath)
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath)
          const mimeTypes = {
            '.wasm': 'application/wasm',
            '.mjs': 'application/javascript',
            '.js': 'application/javascript',
            '.traineddata': 'application/octet-stream'
          }
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          fs.createReadStream(filePath).pipe(res)
          return
        }
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    serveStaticPublic('/onnx-wasm'),
    serveStaticPublic('/tessdata')
  ],
  server: {
    port: 3000,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  build: {
    chunkSizeWarningLimit: 1000
  }
})
