import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

function localSyncBridge(): Plugin {
  let sseClients: ServerResponse[] = []
  let globalState: any = null

  // Heartbeat to keep SSE connections alive over Wi-Fi
  setInterval(() => {
    sseClients.forEach((client) => {
      try {
        client.write(': heartbeat\n\n')
      } catch {
        // client closed
      }
    })
  }, 20000)

  return {
    name: 'autopulse-local-sync-bridge',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
        if (!req.url) return next()

        // Enable CORS for mobile app requests
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Client-Id')

        if (req.method === 'OPTIONS') {
          res.writeHead(204)
          res.end()
          return
        }

        // 1. Server-Sent Events (SSE) Stream
        if (req.url === '/api/sync/events') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          })
          res.write(`data: ${JSON.stringify({ type: 'CONNECTED', serverIp: '192.168.1.5', port: 5173 })}\n\n`)
          sseClients.push(res)

          req.on('close', () => {
            sseClients = sseClients.filter((c) => c !== res)
          })
          return
        }

        // 2. Health & Status Check
        if (req.url === '/api/sync/status') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(
            JSON.stringify({
              status: 'ONLINE',
              serverIp: '192.168.1.5',
              port: 5173,
              activeClients: sseClients.length,
              timestamp: new Date().toISOString(),
            })
          )
          return
        }

        // 3. Receive Mutation from any device (phone or PC) & Broadcast
        if (req.url === '/api/sync/mutation' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const payload = JSON.parse(body)
              const clientId = req.headers['x-client-id'] || 'anonymous'

              // Broadcast mutation to all connected clients except sender
              const broadcastMsg = `data: ${JSON.stringify({
                type: 'MUTATION',
                mutation: payload,
                sender: clientId,
                timestamp: new Date().toISOString(),
              })}\n\n`

              sseClients.forEach((client) => {
                try {
                  client.write(broadcastMsg)
                } catch {}
              })

              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: true, broadcastCount: sseClients.length }))
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, error: err.message }))
            }
          })
          return
        }

        // 4. Initial State Sync
        if (req.url === '/api/sync/state') {
          if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, state: globalState }))
            return
          }
          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })
            req.on('end', () => {
              try {
                globalState = JSON.parse(body)
                const broadcastMsg = `data: ${JSON.stringify({
                  type: 'STATE_REFRESH',
                  state: globalState,
                })}\n\n`
                sseClients.forEach((client) => {
                  try {
                    client.write(broadcastMsg)
                  } catch {}
                })
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: true }))
              } catch (err: any) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: err.message }))
              }
            })
            return
          }
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localSyncBridge()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
