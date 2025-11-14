import type { Context, Next } from 'koa'

export async function logger(ctx: Context, next: Next) {
  const start = Date.now()
  const timestamp = new Date().toISOString()

  await next()

  const ms = Date.now() - start
  const { method, url } = ctx.request
  const { status } = ctx.response

  console.log(`[${timestamp}] ${method} ${url} - ${status} (${ms}ms)`)
}
