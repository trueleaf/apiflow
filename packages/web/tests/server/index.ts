import Koa from 'koa'
import Router from '@koa/router'
import { koaBody } from 'koa-body'
import cors from '@koa/cors'
import type { Server } from 'http'
import type { ServerConfig } from './types'
import { logger } from './middleware/logger'
import { registerEchoRoutes } from './routes/echo'
import { registerDelayRoutes } from './routes/delay'
import { registerStatusRoutes } from './routes/status'
import { registerMockRoutes } from './routes/mock'
import { registerUploadRoutes } from './routes/upload'

export function createTestServer(config: ServerConfig = { port: 3100, host: 'localhost' }): Koa {
  const app = new Koa()
  const router = new Router()

  app.use(cors())

  app.use(logger)

  app.use(
    koaBody({
      multipart: false,
      urlencoded: true,
      json: true,
      text: true,
    }),
  )

  registerEchoRoutes(router)
  registerDelayRoutes(router)
  registerStatusRoutes(router)
  registerMockRoutes(router)
  registerUploadRoutes(router)

  app.use(router.routes())
  app.use(router.allowedMethods())

  app.on('error', (err) => {
    console.error('[Test Server Error]', err)
  })

  return app
}

export function startServer(config: ServerConfig = { port: 3100, host: 'localhost' }): Promise<Server> {
  return new Promise((resolve, reject) => {
    const app = createTestServer(config)
    const server = app.listen(config.port, config.host, () => {
      console.log(`[Test Server] Listening on http://${config.host}:${config.port}`)
      resolve(server)
    })

    server.on('error', (err) => {
      reject(err)
    })
  })
}

export function stopServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err)
      } else {
        console.log('[Test Server] Stopped')
        resolve()
      }
    })
  })
}
