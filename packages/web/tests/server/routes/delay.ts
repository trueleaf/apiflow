import type { Context } from 'koa'
import type Router from '@koa/router'

export function registerDelayRoutes(router: Router) {
  router.get('/delay/:seconds', async (ctx: Context) => {
    const seconds = Number.parseInt(ctx.params.seconds, 10)

    if (Number.isNaN(seconds) || seconds < 0 || seconds > 30) {
      ctx.status = 400
      ctx.body = {
        error: 'Invalid delay seconds. Must be between 0 and 30.',
      }
      return
    }

    await new Promise((resolve) => setTimeout(resolve, seconds * 1000))

    ctx.status = 200
    ctx.body = {
      message: `Delayed for ${seconds} seconds`,
      timestamp: new Date().toISOString(),
    }
  })
}
