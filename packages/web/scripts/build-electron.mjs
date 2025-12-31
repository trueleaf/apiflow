import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

const args = ['--' + platform];

if (isPreRelease) {
  args.push('--config.publish.releaseType=prerelease');
}

const electronBuilder = spawn(
  'electron-builder',
  args,
  {
    cwd: join(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
    }
  }
);

electronBuilder.on('exit', (code) => {
  process.exit(code);
});
