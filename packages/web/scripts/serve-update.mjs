import Koa from 'koa';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3456;
const RELEASE_DIR = path.join(__dirname, '../release');

// MIME类型映射
const MIME_TYPES = {
  '.yml': 'text/yaml',
  '.yaml': 'text/yaml',
  '.exe': 'application/x-msdownload',
  '.dmg': 'application/x-apple-diskimage',
  '.AppImage': 'application/x-executable',
  '.deb': 'application/vnd.debian.binary-package',
  '.zip': 'application/zip',
  '.blockmap': 'application/octet-stream',
  '.json': 'application/json',
};

// 获取文件的MIME类型
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
};

// 日志输出
const log = (type, message, details = {}) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  console.log(logMessage);
  if (Object.keys(details).length > 0) {
    console.log('  Details:', details);
  }
};

// 创建Koa应用
const app = new Koa();

// CORS中间件
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Range, Content-Type');
  ctx.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    return;
  }

  await next();
});

// 主处理中间件
app.use(async (ctx) => {
  // 只处理GET和HEAD请求
  if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
    log('WARN', 'Method not allowed', { method: ctx.method, url: ctx.url });
    ctx.status = 405;
    ctx.body = 'Method Not Allowed';
    return;
  }

  // 解析请求路径
  let filePath = path.join(RELEASE_DIR, decodeURIComponent(ctx.path));

  // 防止路径遍历攻击
  if (!filePath.startsWith(RELEASE_DIR)) {
    log('ERROR', 'Path traversal attempt', { url: ctx.url });
    ctx.status = 403;
    ctx.body = 'Forbidden';
    return;
  }

  // 如果是目录，尝试返回index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    log('WARN', 'File not found', { path: filePath, url: ctx.url });
    ctx.status = 404;
    ctx.body = 'File Not Found';
    return;
  }

  // 获取文件信息
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const mimeType = getMimeType(filePath);

  // 解析Range请求头
  const range = ctx.get('range');

  if (range) {
    // 支持Range请求（断点续传）
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;

    log('INFO', 'Range request', {
      file: path.basename(filePath),
      range: `${start}-${end}/${fileSize}`,
      chunkSize: `${(chunkSize / 1024 / 1024).toFixed(2)} MB`
    });

    ctx.status = 206;
    ctx.set('Content-Type', mimeType);
    ctx.set('Content-Length', chunkSize.toString());
    ctx.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    ctx.set('Accept-Ranges', 'bytes');
    ctx.set('Cache-Control', 'no-cache');

    ctx.body = fs.createReadStream(filePath, { start, end });
  } else {
    // 普通请求
    log('INFO', 'Full file request', {
      file: path.basename(filePath),
      size: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
      mimeType
    });

    ctx.set('Content-Type', mimeType);
    ctx.set('Content-Length', fileSize.toString());
    ctx.set('Accept-Ranges', 'bytes');
    ctx.set('Cache-Control', 'no-cache');

    // 如果是HEAD请求，不设置body
    if (ctx.method !== 'HEAD') {
      ctx.body = fs.createReadStream(filePath);
    }
  }
});

// 错误处理
app.on('error', (err, ctx) => {
  log('ERROR', 'Server error', { error: err.message, url: ctx?.url });
});

// 启动服务器
const server = app.listen(PORT, () => {
  log('SUCCESS', `Update server started`, {
    port: PORT,
    releaseDir: RELEASE_DIR,
    url: `http://localhost:${PORT}`
  });
  console.log('\n可用的更新服务器URL:');
  console.log(`  - http://localhost:${PORT}`);
  console.log(`  - http://127.0.0.1:${PORT}`);
  console.log('\n等待更新请求...\n');
});

// 错误处理
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    log('ERROR', `Port ${PORT} is already in use`);
  } else {
    log('ERROR', 'Server error', { error: err.message });
  }
  process.exit(1);
});

// 优雅关闭
process.on('SIGINT', () => {
  log('INFO', 'Shutting down server...');
  server.close(() => {
    log('SUCCESS', 'Server closed');
    process.exit(0);
  });
});
