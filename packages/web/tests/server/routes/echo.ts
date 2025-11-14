import type { Context } from 'koa'
import type Router from '@koa/router'
import type { EchoResponse } from '../types'

export function registerEchoRoutes(router: Router) {
  const handler = (ctx: Context) => {
    const response: EchoResponse = {
      method: ctx.method,
      url: ctx.url,
      headers: ctx.headers,
      query: ctx.query,
      body: ctx.request.body,
      timestamp: new Date().toISOString(),
    }

    ctx.status = 200
    ctx.body = response
  }

  router.get('/echo', handler)
  router.post('/echo', handler)
  router.put('/echo', handler)
  router.delete('/echo', handler)
  router.patch('/echo', handler)
}
