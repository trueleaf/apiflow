import type { Context } from 'koa'
import type Router from '@koa/router'

const statusMessages: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
}

export function registerStatusRoutes(router: Router) {
  router.get('/status/:code', (ctx: Context) => {
    const code = Number.parseInt(ctx.params.code, 10)

    if (Number.isNaN(code) || code < 100 || code > 599) {
      ctx.status = 400
      ctx.body = {
        error: 'Invalid status code. Must be between 100 and 599.',
      }
      return
    }

    ctx.status = code

    if (code === 204) {
      ctx.body = null
    } else {
      ctx.body = {
        code,
        message: statusMessages[code] || 'Unknown Status',
        timestamp: new Date().toISOString(),
      }
    }
  })
}
