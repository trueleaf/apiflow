import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const values = process.argv.slice(2);
const target = ['pack', 'win', 'mac', 'linux'].includes(values[0]) ? values.shift() : '';
const nameIndex = values.indexOf('--name');
const name = (nameIndex >= 0 ? values[nameIndex + 1] : values[0])?.trim();
if (!name) throw new Error('请输入应用名称：npm run build:clean:win -- --name MyTool');
if (target && target !== 'pack' && { win: 'win32', mac: 'darwin', linux: 'linux' }[target] !== process.platform) throw new Error('请在目标操作系统构建桌面应用');
const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'clean-app';
const temporary = await mkdtemp(path.join(tmpdir(), 'apiflow-clean-build-'));
try {
  const configPath = path.join(temporary, 'tauri.clean.json');
  await writeFile(configPath, JSON.stringify({ productName: name, identifier: `local.${slug}`, bundle: { createUpdaterArtifacts: false }, plugins: { updater: { pubkey: '' } } }));
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/tauri.mjs', 'build', '--config', configPath, ...(target === 'pack' ? ['--no-bundle'] : [])], { stdio: 'inherit', env: { ...process.env, APIFLOW_CLEAN_BUILD: 'true', APIFLOW_BUILD_NAME: name, TAURI_UPDATER_PUBLIC_KEY: '' } });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`构建失败：${code}`)));
  });
} finally {
  if (path.dirname(path.resolve(temporary)) !== path.resolve(tmpdir()) || !path.basename(temporary).startsWith('apiflow-clean-build-')) throw new Error('无效临时目录');
  await rm(temporary, { recursive: true, force: true });
}
