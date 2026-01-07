import Koa from 'koa';
import { koaBody } from 'koa-body';
import http from 'http';
import { execFile } from 'child_process';
import type { Server } from 'http';
import type { Files, File } from 'formidable';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.MOCK_SERVER_PORT || '3456');
let server: Server | null = null;
let startPromise: Promise<Server> | null = null;
let wsServer: WebSocketServer | null = null;

type FileInfo = {
  fieldName: string;
  fileName: string;
  size: number;
  mimeType: string;
};
// 延迟
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
// 判断服务是否监听
const isListening = (srv: Server | null): srv is Server => Boolean(srv && srv.listening);
// 关闭 WebSocket 服务
const stopWebSocketServer = async (): Promise<void> => {
  if (!wsServer) return;
  const currentWsServer = wsServer;
  wsServer = null;
  currentWsServer.clients.forEach((client) => client.terminate());
  await new Promise<void>((resolve) => currentWsServer.close(() => resolve()));
};
// 请求本地 mock 服务器
const requestMockEcho = (port: number): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/echo',
      method: 'GET',
      timeout: 800,
      headers: { accept: 'application/json' },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const bodyText = Buffer.concat(chunks).toString('utf-8');
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(bodyText));
          } catch {
            reject(new Error('mock 响应不是合法 JSON'));
          }
          return;
        }
        reject(new Error(`mock 响应状态码异常: ${String(res.statusCode)}`));
      });
    });
    req.on('timeout', () => {
      req.destroy(new Error('mock 请求超时'));
    });
    req.on('error', reject);
    req.end();
  });
};
// 判断占用端口的是否为当前 mock
const isMockServerOnPort = async (port: number): Promise<boolean> => {
  try {
    const data = await requestMockEcho(port);
    if (!data || typeof data !== 'object') return false;
    const record = data as Record<string, unknown>;
    return typeof record.method === 'string' && typeof record.path === 'string' && typeof record.timestamp === 'number';
  } catch {
    return false;
  }
};
// 结束占用端口的旧 mock 进程（Windows）
const killMockProcessOnWindows = async (port: number): Promise<boolean> => {    
  const isWindows = process.platform === 'win32';
  if (!isWindows) return false;
  const currentPid = String(process.pid);
  const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    execFile('netstat', ['-ano', '-p', 'tcp'], { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout: String(stdout), stderr: String(stderr) });
    });
  });
  const lines = result.stdout.split(/\r?\n/);
  const pids = new Set<string>();
  const portText = `:${String(port)}`;
  for (const line of lines) {
    if (!line.includes(portText) || !line.includes('LISTENING')) continue;
    const match = line.trim().match(/\sLISTENING\s+(\d+)$/);
    if (match?.[1] && match[1] !== currentPid) pids.add(match[1]);
  }
  if (pids.size === 0) return false;
  for (const pid of pids) {
    await new Promise<void>((resolve) => {
      execFile('taskkill', ['/PID', pid, '/T', '/F'], { windowsHide: true }, () => resolve());
    });
  }
  return true;
};
// 解析文件信息
const parseFiles = (files: Files | undefined): FileInfo[] => {
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
};
// 获取原始 body 字符串
const getRawBody = (ctx: Koa.Context): string => {
  const body = ctx.request.body;
  const files = (ctx.request as any).files as Files | undefined;
  const contentType = ctx.get('content-type') || '';

  // ===== 1️⃣ 基础类型兜底（最重要） =====
  if (
    body === null ||
    typeof body === 'string' ||
    typeof body === 'number' ||
    typeof body === 'boolean'
  ) {
    return String(body);
  }

  if (!body && !files) return '';

  // ===== 2️⃣ multipart/form-data =====
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
            parts.push(
              `${fieldName}=[File: ${f.originalFilename || f.newFilename}, ${f.size} bytes]`
            );
          }
        }
      }
    }

    return parts.join('&');
  }

  // ===== 3️⃣ application/x-www-form-urlencoded =====
  if (
    contentType.includes('application/x-www-form-urlencoded') &&
    body &&
    typeof body === 'object' &&
    !Array.isArray(body)
  ) {
    try {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(body)) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
      return params.toString();
    } catch {
      return String(body);
    }
  }

  // ===== 4️⃣ application/json / 其他 =====
  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
};

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
export const createMockServer = (): Koa => {
  const app = new Koa();
  const koaBodyOptions = {
    multipart: true,
    urlencoded: true,
    json: true,
    jsonStrict: false,
    text: true,
    includeUnparsed: true,
    // parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE', 'GET', 'HEAD', 'OPTIONS'],
    extendTypes: {
      text: [
        'text/plain',
        'text/html',
        'text/xml',
        'application/xml',
        'application/*+xml',
        'application/x-yaml',
        'text/yaml',
        'application/graphql',
        'application/octet-stream',
      ],
    },
    formidable: {
      maxFileSize: 100 * 1024 * 1024,
      keepExtensions: true,
    },
    jsonLimit: '10mb',
    formLimit: '10mb',
    textLimit: '10mb',
  } as Parameters<typeof koaBody>[0];
  // 自定义中间件：处理 koa-body 无法解析的特殊 content-type（如 XML）
  const xmlBodyMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    const contentType = ctx.get('content-type') || '';
    const isXmlType = contentType.includes('xml');
    if (isXmlType) {
      const chunks: Buffer[] = [];
      for await (const chunk of ctx.req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString('utf-8');
      (ctx.request as any).body = rawBody;
      (ctx.request as any).rawBody = rawBody;
    }
    await next();
  };
  // 条件性使用中间件：XML 类型使用自定义中间件，其他类型使用 koa-body
  app.use(async (ctx, next) => {
    const contentType = ctx.get('content-type') || '';
    const isXmlType = contentType.includes('xml');
    if (isXmlType) {
      await xmlBodyMiddleware(ctx, next);
    } else {
      await koaBody(koaBodyOptions)(ctx, next);
    }
  });
  // Echo 路由 - 返回完整请求信息
  app.use(async (ctx) => {
    const files = (ctx.request as any).files as Files | undefined;
    if (ctx.path === '/set-cookie') {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      ctx.set('Set-Cookie', `af_set_cookie=1; Path=/; Expires=${expires}`);
      ctx.body = { ok: true, type: 'set-cookie' };
      return;
    }
    if (ctx.path === '/set-cookie/basic') {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      ctx.set('Set-Cookie', `af_basic=basic_value; Path=/; Expires=${expires}`);
      ctx.body = { ok: true, type: 'basic' };
      return;
    }
    if (ctx.path === '/set-cookie/path') {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      ctx.set('Set-Cookie', `af_path=path_value; Path=/echo/path-only; Expires=${expires}`);
      ctx.body = { ok: true, type: 'path' };
      return;
    }
    if (ctx.path === '/set-cookie/expired') {
      ctx.set('Set-Cookie', 'af_expired=expired_value; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      ctx.body = { ok: true, type: 'expired' };
      return;
    }
    if (ctx.path.startsWith('/set-cookie/override/')) {
      const value = decodeURIComponent(ctx.path.replace('/set-cookie/override/', ''));
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      ctx.set('Set-Cookie', `af_override=${value}; Path=/; Expires=${expires}`);
      ctx.body = { ok: true, type: 'override', value };
      return;
    }
    if (ctx.path === '/set-cookie/delete-basic') {
      ctx.set('Set-Cookie', 'af_basic=; Path=/; Max-Age=0');
      ctx.body = { ok: true, type: 'delete-basic' };
      return;
    }
    if (ctx.path === '/set-cookie/domain-mismatch') {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      ctx.set('Set-Cookie', `af_domain_mismatch=1; Domain=localhost; Path=/; Expires=${expires}`);
      ctx.body = { ok: true, type: 'domain-mismatch' };
      return;
    }
    if (ctx.path === '/set-cookie/order') {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      ctx.append('Set-Cookie', `af_order=short; Path=/echo; Expires=${expires}`);
      ctx.append('Set-Cookie', `af_order=long; Path=/echo/path-only; Expires=${expires}`);
      ctx.body = { ok: true, type: 'order' };
      return;
    }
    if (ctx.path === '/set-cookie/default-path/dir/leaf' || ctx.path === '/echo/set-cookie/default-path/dir/leaf') {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      ctx.set('Set-Cookie', `af_default_path=1; Expires=${expires}`);
      ctx.body = { ok: true, type: 'default-path' };
      return;
    }
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
};
// 启动服务器
export const startServer = async (): Promise<Server> => {
  if (isListening(server)) return server;
  if (startPromise) return startPromise;
  startPromise = (async () => {
    if (server) await stopServer();
    const app = createMockServer();
    const listenOnce = (): Promise<Server> => {
      return new Promise((resolve, reject) => {
        const nextServer = app.listen(PORT);
        const onError = (error: unknown) => {
          nextServer.off('listening', onListening);
          reject(error);
        };
        const onListening = () => {
          nextServer.off('error', onError);
          resolve(nextServer);
        };
        nextServer.once('error', onError);
        nextServer.once('listening', onListening);
      });
    };
    try {
      const nextServer = await listenOnce();
      server = nextServer;
      if (!wsServer) {
        wsServer = new WebSocketServer({ server: nextServer, path: '/ws' });
        wsServer.on('connection', (socket) => {
          socket.on('message', (data, isBinary) => {
            const messageText = typeof data === 'string' ? data : data.toString('utf-8');
            if (messageText === 'ping') {
              socket.send('pong');
              return;
            }
            socket.send(data, { binary: isBinary });
          });
        });
      }
      return nextServer;
    } catch (error) {
      const errnoError = error as NodeJS.ErrnoException;
      if (errnoError.code !== 'EADDRINUSE') throw error;
      const isMock = await isMockServerOnPort(PORT);
      if (!isMock) {
        throw new Error(`端口 ${String(PORT)} 已被其他进程占用，无法启动 mock 服务`);
      }
      await killMockProcessOnWindows(PORT);
      await sleep(200);
      const retryServer = await listenOnce();
      server = retryServer;
      if (!wsServer) {
        wsServer = new WebSocketServer({ server: retryServer, path: '/ws' });
        wsServer.on('connection', (socket) => {
          socket.on('message', (data, isBinary) => {
            const messageText = typeof data === 'string' ? data : data.toString('utf-8');
            if (messageText === 'ping') {
              socket.send('pong');
              return;
            }
            socket.send(data, { binary: isBinary });
          });
        });
      }
      return retryServer;
    }
  })().finally(() => {
    startPromise = null;
  });
  return startPromise;
};
// 关闭服务器
export const stopServer = (): Promise<void> => {
  return new Promise((resolve) => {
    stopWebSocketServer().finally(() => {
    if (server) {
      const currentServer = server;
      currentServer.close(() => {
        if (server === currentServer) server = null;
        resolve();
      });
      return;
    }
    resolve();
    });
  });
};
// Playwright 全局 setup
const globalSetup = async () => {
  console.log('🚀 启动 Mock 服务器...');
  await startServer();
  console.log(`✅ Mock 服务器已在端口 ${PORT} 上成功启动`);
  // 验证服务器是否可访问
  try {
    await requestMockEcho(PORT);
    console.log('✅ Mock 服务器健康检查通过');
  } catch (error) {
    console.error('❌ Mock 服务器健康检查失败:', error);
    throw error;
  }
  return async () => {
    console.log('🛑 关闭 Mock 服务器...');
    await stopServer();
    console.log('✅ Mock 服务器已关闭');
  };
};
// Playwright 全局 teardown
export const globalTeardown = async () => {
  await stopServer();
};
export { PORT };
export default globalSetup;
