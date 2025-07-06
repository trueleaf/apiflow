import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置路径 - 从当前脚本位置计算到项目根目录的public/font
const fontDir = path.resolve(__dirname, '../../../src/renderer/assets/font');
const outputFile = path.resolve(fontDir, 'inline-font.css');

// 读取原始 CSS 内容
const cssContent = fs.readFileSync(path.join(fontDir, 'iconfont.css'), 'utf8');

const toBase64 = (filename) => {
  const filePath = path.join(fontDir, filename);
  const fontData = fs.readFileSync(filePath);
  return fontData.toString('base64');
};

// 替换 @font-face 中的 URL 为内联 base64
const inlineCSS = cssContent.replace(
  /@font-face\s*\{[\s\S]*?src:\s*url\('iconfont\.woff2\?t=[^']*'\)\s*format\('woff2'\),\s*url\('iconfont\.woff\?t=[^']*'\)\s*format\('woff'\),\s*url\('iconfont\.ttf\?t=[^']*'\)\s*format\('truetype'\);[\s\S]*?\}/,
  `@font-face {
  font-family: "iconfont";
  src: url('data:font/woff2;charset=utf-8;base64,${toBase64('iconfont.woff2')}') format('woff2'),
       url('data:font/woff;charset=utf-8;base64,${toBase64('iconfont.woff')}') format('woff'),
       url('data:font/ttf;charset=utf-8;base64,${toBase64('iconfont.ttf')}') format('truetype');
}`
);

// 保存文件
fs.writeFileSync(outputFile, inlineCSS);
console.log('✅ 内联字体 CSS 生成成功');