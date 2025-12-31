import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isPreRelease = process.env.IS_PRE_RELEASE === 'true';
const platform = process.argv[2]; // win, mac, linux

if (!platform || !['win', 'mac', 'linux'].includes(platform)) {
  console.error('请指定平台: win, mac, 或 linux');
  process.exit(1);
}

console.log(`构建平台: ${platform}`);
console.log(`预发布版本: ${isPreRelease}`);
console.log(`版本号: ${process.env.APP_VERSION || 'unknown'}`);
console.log(`GH_TOKEN: ${process.env.GH_TOKEN ? '已设置' : '未设置'}`);

// 临时修改 package.json 以设置 releaseType
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const originalPackageJson = JSON.stringify(packageJson, null, 2);

if (packageJson.build && packageJson.build.publish) {
  packageJson.build.publish[0].releaseType = isPreRelease ? 'prerelease' : 'release';
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`设置 releaseType: ${packageJson.build.publish[0].releaseType}`);
}

// 关键：添加 --publish always 参数强制发布
const args = ['--' + platform, '--publish', 'always'];

console.log('electron-builder 参数:', args);
console.log('开始构建和发布...\n');

const electronBuilder = spawn(
  'electron-builder',
  args,
  {
    cwd: join(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      // 确保 GITHUB_TOKEN 设置正确
      GITHUB_TOKEN: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
      GH_TOKEN: process.env.GH_TOKEN || process.env.GITHUB_TOKEN,
    }
  }
);

electronBuilder.on('exit', (code) => {
  // 恢复原始 package.json
  writeFileSync(packageJsonPath, originalPackageJson);
  console.log('已恢复 package.json');
  process.exit(code);
});

// 处理中断信号
process.on('SIGINT', () => {
  writeFileSync(packageJsonPath, originalPackageJson);
  process.exit(1);
});
