import Koa from 'koa';
import { koaBody } from 'koa-body';
import type { Server } from 'http';
import type { Files, File } from 'formidable';

const PORT = 3456;
let server: Server | null = null;

type FileInfo = {
  fieldName: string;
  fileName: string;
  size: number;
  mimeType: string;
};
// 解析文件信息
function parseFiles(files: Files | undefined): FileInfo[] {
  if (!files) return [];
  const result: FileInfo[] = [];
  for (const [fieldName, fileOrFiles] of Object.entries(files)) {
    const fileArray = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    for (const file of fileArray) {
      if (file) {
        result.push({
          fieldName,
          fileName: (file as File).originalFilename || (file as File).newFilename || 'unknown',
          size: (file as File).size || 0,
          mimeType: (file as File).mimetype || 'application/octet-stream',
        });
      }
    }
  }
  return result;
}
// 获取原始 body 字符串
function getRawBody(ctx: Koa.Context): string {
  const body = ctx.request.body;
  const files = (ctx.request as any).files as Files | undefined;
  const contentType = ctx.get('content-type') || '';
  if (!body && !files) return '';
  // multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    const parts: string[] = [];
    if (body && typeof body === 'object') {
      for (const [key, value] of Object.entries(body)) {
        if (Array.isArray(value)) {
          value.forEach(v => parts.push(`${key}=${String(v)}`));
        } else {
          parts.push(`${key}=${String(value)}`);
        }
      }
    }
    if (files) {
      for (const [fieldName, fileOrFiles] of Object.entries(files)) {
        const fileArray = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
        for (const file of fileArray) {
          if (file) {
            const f = file as File;
            parts.push(`${fieldName}=[File: ${f.originalFilename || f.newFilename}, ${f.size} bytes]`);
          }
        }
      }
    }
    return parts.join('&');
  }
  if (!body) return '';
  // 字符串直接返回
  if (typeof body === 'string') return body;
  // application/x-www-form-urlencoded
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    }
    return params.toString();
  }
  // application/json 或其他
  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
}
// 解析路径参数
const parsePathParams = (pattern: string, path: string): Record<string, string> | null => {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
};
// 创建 Mock 服务器
export function createMockServer(): Koa {
  const app = new Koa();
  app.use(koaBody({
    multipart: true,
    urlencoded: true,
    json: true,
    text: true,
  }));
  // Echo 路由 - 返回完整请求信息
  app.use(async (ctx) => {
    const files = (ctx.request as any).files as Files | undefined;
    // 重定向路由 - 返回301重定向
    if (ctx.path === '/redirect-301') {
      ctx.status = 301;
      ctx.redirect(`http://localhost:${PORT}/echo`);
      return;
    }
    // 重定向路由 - 返回302重定向
    if (ctx.path === '/redirect-302') {
      ctx.status = 302;
      ctx.redirect(`http://localhost:${PORT}/echo`);
      return;
    }
    // 多次重定向路由 - 链式重定向
    if (ctx.path.startsWith('/redirect-chain/')) {
      const match = ctx.path.match(/\/redirect-chain\/(\d+)/);
      if (match) {
        const count = parseInt(match[1], 10);
        if (count > 1) {
          ctx.status = 302;
          ctx.redirect(`http://localhost:${PORT}/redirect-chain/${count - 1}`);
          return;
        } else {
          ctx.status = 302;
          ctx.redirect(`http://localhost:${PORT}/echo`);
          return;
        }
      }
    }
    // 状态码测试路由 - 返回指定状态码
    if (ctx.path.startsWith('/status/')) {
      const match = ctx.path.match(/\/status\/(\d+)/);
      if (match) {
        const statusCode = parseInt(match[1], 10);
        ctx.status = statusCode;
        ctx.body = { statusCode, message: `Status ${statusCode}` };
        return;
      }
    }
    // 延迟响应路由 - 用于测试响应时长
    if (ctx.path.startsWith('/delay/')) {
      const match = ctx.path.match(/\/delay\/(\d+)/);
      if (match) {
        const delay = parseInt(match[1], 10);
        await new Promise(resolve => setTimeout(resolve, delay));
        ctx.body = { delayed: delay, message: `Delayed ${delay}ms` };
        return;
      }
    }
    // 大数据响应路由 - 用于测试响应大小
    if (ctx.path.startsWith('/size/')) {
      const match = ctx.path.match(/\/size\/(\d+)/);
      if (match) {
        const size = parseInt(match[1], 10);
        ctx.body = { data: 'x'.repeat(size), size };
        return;
      }
    }
    // 检查是否匹配 /echo 或 /echo/* 路径
    if (ctx.path === '/echo' || ctx.path.startsWith('/echo/')) {
      // 尝试匹配带 path 参数的路由模式
      const pathPatterns = [
        '/echo/users/:userId',
        '/echo/users/:userId/posts/:postId',
        '/echo/users/:userId/posts/:postId/comments/:commentId',
        '/echo/items/:id',
        '/echo/:param',
      ];
      let pathParams: Record<string, string> = {};
      for (const pattern of pathPatterns) {
        const params = parsePathParams(pattern, ctx.path);
        if (params) {
          pathParams = params;
          break;
        }
      }
      ctx.body = {
        method: ctx.method,
        url: ctx.url,
        path: ctx.path,
        pathParams,
        query: ctx.query,
        headers: ctx.headers,
        contentType: ctx.get('content-type') || '',
        body: ctx.request.body,
        files: parseFiles(files),
        rawBody: getRawBody(ctx),
        ip: ctx.ip,
        timestamp: Date.now(),
      };
      return;
    }
    ctx.status = 404;
    ctx.body = { error: 'Not Found' };
  });
  return app;
}
// 启动服务器
export function startServer(): Promise<Server> {
  return new Promise((resolve, reject) => {
    const app = createMockServer();
    server = app.listen(PORT, () => {
      console.log(`Mock server started on port ${PORT}`);
      resolve(server!);
    });
    server.on('error', reject);
  });
}
// 关闭服务器
export function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('Mock server stopped');
        server = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}
// Playwright 全局 setup
export default async function globalSetup() {
  await startServer();
}
// Playwright 全局 teardown
export async function globalTeardown() {
  await stopServer();
}
export { PORT };
