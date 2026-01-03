import Koa from 'koa';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Throttle } from 'stream-throttle';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3456;
const RELEASE_DIR = path.join(__dirname, '../release');

// ✅ 下载限速：单位 bytes/sec（单连接限速）
// 例如：
// 512KB/s = 512 * 1024
// 1MB/s   = 1 * 1024 * 1024
// 2MB/s   = 2 * 1024 * 1024
const DOWNLOAD_RATE = 2 * 1024 * 1024;

// MIME类型映射
const MIME_TYPES = {
  '.yml': 'text/yaml',
  '.yaml': 'text/yaml',
  '.exe': 'application/x-msdownload',
  '.dmg': 'application/x-apple-diskimage',
  '.appimage': 'application/x-executable',
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

  // HEAD 请求只返回 header，不返回 body（避免无意义限速）
  const shouldSendBody = ctx.method !== 'HEAD';

  if (range) {
    // 支持Range请求（断点续传）
    const parts = range.replace(/bytes=/, '').split('-');

    // 兼容 "bytes=-500" 这种写法（取最后 N 字节）
    let start;
    let end;

    if (parts[0] === '') {
      const lastN = parseInt(parts[1], 10);
      end = fileSize - 1;
      start = Math.max(0, fileSize - lastN);
    } else {
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    }

    // 防御：非法 range
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
      log('WARN', 'Invalid range', { range, fileSize });
      ctx.status = 416; // Range Not Satisfiable
      ctx.set('Content-Range', `bytes */${fileSize}`);
      return;
    }

    end = Math.min(end, fileSize - 1);
    const chunkSize = end - start + 1;

    log('INFO', 'Range request', {
      file: path.basename(filePath),
      range: `${start}-${end}/${fileSize}`,
      chunkSize: `${(chunkSize / 1024 / 1024).toFixed(2)} MB`,
      rate: `${(DOWNLOAD_RATE / 1024 / 1024).toFixed(2)} MB/s`
    });

    ctx.status = 206;
    ctx.set('Content-Type', mimeType);
    ctx.set('Content-Length', String(chunkSize));
    ctx.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    ctx.set('Accept-Ranges', 'bytes');
    ctx.set('Cache-Control', 'no-cache');

    if (shouldSendBody) {
      const fileStream = fs.createReadStream(filePath, { start, end });
      const throttle = new Throttle({ rate: DOWNLOAD_RATE });

      // 客户端取消/断开时及时释放资源
      ctx.req.on('close', () => {
        fileStream.destroy();
        throttle.destroy();
      });

      // 可选：记录错误
      fileStream.on('error', (err) => {
        log('ERROR', 'File stream error', { error: err.message, filePath });
      });

      ctx.body = fileStream.pipe(throttle);
    }
  } else {
    // 普通请求
    log('INFO', 'Full file request', {
      file: path.basename(filePath),
      size: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
      mimeType,
      rate: `${(DOWNLOAD_RATE / 1024 / 1024).toFixed(2)} MB/s`
    });

    ctx.status = 200;
    ctx.set('Content-Type', mimeType);
    ctx.set('Content-Length', String(fileSize));
    ctx.set('Accept-Ranges', 'bytes');
    ctx.set('Cache-Control', 'no-cache');

    if (shouldSendBody) {
      const fileStream = fs.createReadStream(filePath);
      const throttle = new Throttle({ rate: DOWNLOAD_RATE });

      ctx.req.on('close', () => {
        fileStream.destroy();
        throttle.destroy();
      });

      fileStream.on('error', (err) => {
        log('ERROR', 'File stream error', { error: err.message, filePath });
      });

      ctx.body = fileStream.pipe(throttle);
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
