import type { Context } from 'koa'
import type Router from '@koa/router'
import type { MockUser } from '../types'

export function registerMockRoutes(router: Router) {
  router.get('/mock/user', (ctx: Context) => {
    const user: MockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
    }

    ctx.status = 200
    ctx.body = user
  })

  router.get('/mock/users', (ctx: Context) => {
    const users: MockUser[] = [
      { id: 1, name: 'Alice', email: 'alice@example.com', age: 25 },
      { id: 2, name: 'Bob', email: 'bob@example.com', age: 30 },
      { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35 },
    ]

    ctx.status = 200
    ctx.body = {
      data: users,
      total: users.length,
      page: 1,
      pageSize: 10,
    }
  })

  router.post('/mock/create', (ctx: Context) => {
    const body = ctx.request.body as Record<string, unknown>

    ctx.status = 201
    ctx.body = {
      success: true,
      message: 'Resource created successfully',
      data: {
        id: Math.floor(Math.random() * 10000),
        ...body,
        createdAt: new Date().toISOString(),
      },
    }
  })

  router.put('/mock/update/:id', (ctx: Context) => {
    const id = ctx.params.id
    const body = ctx.request.body as Record<string, unknown>

    ctx.status = 200
    ctx.body = {
      success: true,
      message: 'Resource updated successfully',
      data: {
        id: Number.parseInt(id, 10),
        ...body,
        updatedAt: new Date().toISOString(),
      },
    }
  })

  router.delete('/mock/delete/:id', (ctx: Context) => {
    const id = ctx.params.id

    ctx.status = 200
    ctx.body = {
      success: true,
      message: `Resource ${id} deleted successfully`,
    }
  })
}
