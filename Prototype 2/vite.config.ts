import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import type { AddressInfo } from 'node:net'
import os from 'node:os'

const VIRTUAL_IFACE_PATTERN = /vethernet|wsl|virtualbox|vmware|docker|hyper-v|loopback|tailscale|zerotier/i
const MAX_BODY_BYTES = 2 * 1024 * 1024

function resolveLocalIpv4(): string {
  const nets = os.networkInterfaces()
  const candidates: { name: string; address: string; priority: number }[] = []

  for (const [name, entries] of Object.entries(nets)) {
    if (!entries) continue
    for (const net of entries) {
      if (net.family !== 'IPv4' || net.internal) continue
      const isVirtual = VIRTUAL_IFACE_PATTERN.test(name)
      const isLan192 = net.address.startsWith('192.168.')
      const isLan10 = net.address.startsWith('10.')
      let priority = 3
      if (!isVirtual && isLan192) priority = 0
      else if (!isVirtual && isLan10) priority = 1
      else if (!isVirtual) priority = 2
      candidates.push({ name, address: net.address, priority })
    }
  }

  candidates.sort((a, b) => a.priority - b.priority)
  return candidates[0]?.address ?? '127.0.0.1'
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = ''
    let bytes = 0
    req.on('data', (chunk: Buffer | string) => {
      bytes += typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error('Payload too large'))
        req.destroy()
        return
      }
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', (err) => reject(err))
  })
}

function localSyncBridge(): Plugin {
  let sseClients: ServerResponse[] = []
  let globalState: unknown = null
  const serverIp = resolveLocalIpv4()

  const broadcastToSse = (msg: string): number => {
    const alive: ServerResponse[] = []
    for (const client of sseClients) {
      if (client.writableEnded || client.destroyed) continue
      try {
        client.write(msg)
        alive.push(client)
      } catch {
        // drop dead socket
      }
    }
    sseClients = alive
    return alive.length
  }

  const attachBridge = (
    middlewares: Connect.Server,
    httpServer: { address?: () => string | AddressInfo | null; on: (ev: string, cb: () => void) => void } | null,
    fallbackPort: number
  ) => {
    const getActivePort = (req: IncomingMessage): number => {
      const addr = httpServer?.address?.()
      if (addr && typeof addr === 'object' && addr.port) {
        return addr.port
      }
      const hostHeader = req.headers.host
      if (hostHeader) {
        const portPart = hostHeader.split(':')[1]
        const parsed = Number(portPart)
        if (Number.isFinite(parsed) && parsed > 0) return parsed
      }
      return fallbackPort
    }

    // Heartbeat to keep SSE connections alive over local Wi-Fi
    const heartbeat = setInterval(() => {
      broadcastToSse(': heartbeat\n\n')
    }, 20000)
    heartbeat.unref()

    httpServer?.on('close', () => {
      clearInterval(heartbeat)
      sseClients = []
    })

    middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
      if (!req.url) return next()

      let pathname = ''
      try {
        pathname = new URL(req.url, 'http://localhost').pathname
      } catch {
        return next()
      }

      if (!pathname.startsWith('/api/sync/')) {
        return next()
      }

      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Client-Id')

      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
      }

      const activePort = getActivePort(req)

      // 1. Server-Sent Events (SSE) Stream
      if (pathname === '/api/sync/events' && req.method === 'GET') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        })
        res.write(`data: ${JSON.stringify({ type: 'CONNECTED', serverIp, port: activePort })}\n\n`)
        sseClients.push(res)

        req.on('close', () => {
          sseClients = sseClients.filter((c) => c !== res)
        })
        return
      }

      // 2. Health & Status Check
      if (pathname === '/api/sync/status' && req.method === 'GET') {
        sseClients = sseClients.filter((c) => !c.writableEnded && !c.destroyed)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            status: 'ONLINE',
            serverIp,
            port: activePort,
            activeClients: sseClients.length,
            timestamp: new Date().toISOString(),
          })
        )
        return
      }

      // 3. Receive Mutation from any device & Broadcast
      if (pathname === '/api/sync/mutation' && req.method === 'POST') {
        void readJsonBody(req)
          .then((payload) => {
            const clientId = req.headers['x-client-id'] || 'anonymous'
            const broadcastMsg = `data: ${JSON.stringify({
              type: 'MUTATION',
              mutation: payload,
              sender: clientId,
              timestamp: new Date().toISOString(),
            })}\n\n`

            const broadcastCount = broadcastToSse(broadcastMsg)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, broadcastCount }))
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : 'Invalid JSON payload'
            const status = message === 'Payload too large' ? 413 : 400
            if (!res.writableEnded) {
              res.writeHead(status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, error: message }))
            }
          })
        return
      }

      // 4. Full State Snapshot Sync
      if (pathname === '/api/sync/state') {
        if (req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true, state: globalState }))
          return
        }
        if (req.method === 'POST') {
          void readJsonBody(req)
            .then((parsed) => {
              globalState = parsed
              const broadcastMsg = `data: ${JSON.stringify({
                type: 'STATE_REFRESH',
                state: globalState,
              })}\n\n`
              broadcastToSse(broadcastMsg)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: true }))
            })
            .catch((err: unknown) => {
              const message = err instanceof Error ? err.message : 'Invalid state payload'
              const status = message === 'Payload too large' ? 413 : 400
              if (!res.writableEnded) {
                res.writeHead(status, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: message }))
              }
            })
          return
        }
      }

      next()
    })
  }

  return {
    name: 'autopulse-local-sync-bridge',
    configureServer(server) {
      attachBridge(
        server.middlewares,
        server.httpServer,
        server.config.server.port ?? 5173
      )
    },
    configurePreviewServer(server) {
      attachBridge(
        server.middlewares,
        server.httpServer,
        server.config.preview.port ?? 4173
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), localSyncBridge()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
