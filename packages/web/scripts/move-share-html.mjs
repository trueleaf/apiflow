import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distIndexPath = path.resolve(__dirname, '../build/share/dist/index.html');
const publicSharePath = path.resolve(__dirname, '../public/share.html');

try {
  if (!fs.existsSync(distIndexPath)) {
    console.error('错误: build/share/dist/index.html 不存在');
    process.exit(1);
  }
  const publicDir = path.dirname(publicSharePath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.copyFileSync(distIndexPath, publicSharePath);
  console.log('成功: build/share/dist/index.html 已复制到 public/share.html');
  fs.unlinkSync(distIndexPath);
  console.log('成功: build/share/dist/index.html 已删除');
} catch (error) {
  console.error('移动文件时出错:', error.message);
  process.exit(1);
}
