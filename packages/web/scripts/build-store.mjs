import { spawn } from 'node:child_process';
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

if (process.platform !== 'win32') throw new Error('Microsoft Store 包必须在 Windows 构建');
const architecture = process.argv.includes('--arm64') ? 'arm64' : 'x64';
const target = architecture === 'arm64' ? 'aarch64-pc-windows-msvc' : 'x86_64-pc-windows-msvc';
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const version = packageJson.version.split('-')[0].split('.');
if (version.length !== 3 || version.some(value => !/^\d+$/.test(value) || Number(value) > 65535)) throw new Error('无效的 Store 版本号');
const sdkDirectory = path.join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Windows Kits/10/bin');
const sdkVersions = (await readdir(sdkDirectory)).filter(value => /^10\./.test(value)).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
const makeAppx = sdkVersions.flatMap(value => [path.join(sdkDirectory, value, `${process.arch === 'arm64' ? 'arm64' : 'x64'}/makeappx.exe`), path.join(sdkDirectory, value, 'x64/makeappx.exe')]).find(existsSync);
if (!makeAppx) throw new Error('请安装包含 MakeAppx 的 Windows SDK');
const temporary = await mkdtemp(path.join(tmpdir(), 'apiflow-store-build-'));
const runtimeLink = path.resolve('src-tauri/WebView2');
let runtimeLinkCreated = false;
try {
  const payloadDirectory = path.join(temporary, 'package');
  await mkdir(payloadDirectory);
  let runtimeDirectory = process.env.APIFLOW_WEBVIEW2_RUNTIME;
  if (!runtimeDirectory) {
    const page = await fetch('https://developer.microsoft.com/en-us/microsoft-edge/webview2/');
    if (!page.ok) throw new Error(`无法获取 WebView2 官方下载目录：${page.status}`);
    const html = (await page.text()).replaceAll('\\u002F', '/');
    const candidates = [...new Set(html.match(/https:\/\/msedge\.sf\.dl\.delivery\.mp\.microsoft\.com\/[^"\s<>]+\.cab/g) || [])]
      .filter(url => url.endsWith(`.${architecture}.cab`)).sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));
    candidates.sort((left, right) => (right.match(/Runtime\.([\d.]+)\./)?.[1] || '').localeCompare(left.match(/Runtime\.([\d.]+)\./)?.[1] || '', undefined, { numeric: true }));
    if (!candidates[0]) throw new Error('官方目录未提供匹配架构的固定版 WebView2，可设置 APIFLOW_WEBVIEW2_RUNTIME 指向已解压的官方运行时');
    const archive = path.join(temporary, 'runtime.cab');
    const response = await fetch(candidates[0]);
    if (!response.ok || !response.body) throw new Error(`WebView2 下载失败：${response.status}`);
    await pipeline(Readable.fromWeb(response.body), createWriteStream(archive));
    const extractionDirectory = path.join(temporary, 'runtime');
    await mkdir(extractionDirectory);
    await new Promise((resolve, reject) => {
      const child = spawn(path.join(process.env.SystemRoot || 'C:/Windows', 'System32/expand.exe'), [archive, '-F:*', extractionDirectory], { stdio: ['ignore', 'ignore', 'inherit'], windowsHide: true });
      child.on('error', reject);
      child.on('exit', code => code === 0 ? resolve() : reject(new Error(`WebView2 解压失败：${code}`)));
    });
    const executable = (await readdir(extractionDirectory, { recursive: true })).find(name => path.basename(name) === 'msedgewebview2.exe');
    if (!executable) throw new Error('运行时中未找到 msedgewebview2.exe');
    runtimeDirectory = path.dirname(path.join(extractionDirectory, executable));
  }
  if (!existsSync(path.join(runtimeDirectory, 'msedgewebview2.exe'))) throw new Error('APIFLOW_WEBVIEW2_RUNTIME 必须指向官方固定版运行时目录');
  await cp(runtimeDirectory, path.join(payloadDirectory, 'WebView2'), { recursive: true });
  if (existsSync(runtimeLink)) throw new Error('src-tauri/WebView2 已存在，不能覆盖构建资源');
  await symlink(runtimeDirectory, runtimeLink, 'junction');
  runtimeLinkCreated = true;
  const configPath = path.join(temporary, 'store.json');
  await writeFile(configPath, JSON.stringify({ bundle: { active: false, createUpdaterArtifacts: false, windows: { webviewInstallMode: { type: 'fixedRuntime', path: 'WebView2' } } } }));
  const targetArguments = architecture === process.arch ? [] : ['--target', target];
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/tauri.mjs', 'build', '--no-bundle', '--features', 'app-store', ...targetArguments, '--config', configPath], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`构建失败：${code}`)));
  });
  const buildDirectory = path.resolve('src-tauri/target', ...(targetArguments.length ? [target] : []), 'release');
  await cp(path.join(buildDirectory, 'apiflow-desktop.exe'), path.join(payloadDirectory, 'ApiFlow.exe'));
  for (const name of await readdir(buildDirectory)) { if (name.endsWith('.dll')) await cp(path.join(buildDirectory, name), path.join(payloadDirectory, name)); }
  await cp('src/static', path.join(payloadDirectory, 'static'), { recursive: true });
  await cp('build/appx', path.join(payloadDirectory, 'Assets'), { recursive: true });
  const manifest = `<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10" xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10" xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities" IgnorableNamespaces="uap rescap">
  <Identity Name="TrueLeaf.ApiFlow" Publisher="CN=21922134-321C-42D0-80D1-D57E1992206A" Version="${version.join('.')}.0" ProcessorArchitecture="${architecture}" />
  <Properties><DisplayName>ApiFlow</DisplayName><PublisherDisplayName>orange pig</PublisherDisplayName><Logo>Assets/StoreLogo.png</Logo></Properties>
  <Resources><Resource Language="zh-CN"/><Resource Language="en-US"/></Resources>
  <Dependencies><TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.19041.0" MaxVersionTested="10.0.26100.0"/></Dependencies>
  <Applications><Application Id="TrueLeaf.ApiFlow" Executable="ApiFlow.exe" EntryPoint="Windows.FullTrustApplication"><uap:VisualElements DisplayName="ApiFlow" Description="Visual API design and testing tool" BackgroundColor="transparent" Square150x150Logo="Assets/Square150x150Logo.png" Square44x44Logo="Assets/Square44x44Logo.png"><uap:DefaultTile Wide310x150Logo="Assets/Wide310x150Logo.png"/><uap:SplashScreen Image="Assets/SplashScreen.png"/></uap:VisualElements></Application></Applications>
  <Capabilities><rescap:Capability Name="runFullTrust"/></Capabilities>
</Package>`;
  await writeFile(path.join(payloadDirectory, 'AppxManifest.xml'), manifest);
  await mkdir('release', { recursive: true });
  await new Promise((resolve, reject) => {
    const child = spawn(makeAppx, ['pack', '/d', payloadDirectory, '/p', path.resolve('release', `ApiFlow-${packageJson.version}-${architecture}.msix`), '/o'], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`MSIX 打包失败：${code}`)));
  });
} finally {
  if (runtimeLinkCreated) {
    if (!(await lstat(runtimeLink)).isSymbolicLink()) throw new Error('拒绝删除非链接的 WebView2 资源');
    await rm(runtimeLink);
  }
  if (path.dirname(path.resolve(temporary)) !== path.resolve(tmpdir()) || !path.basename(temporary).startsWith('apiflow-store-build-')) throw new Error('无效临时目录');
  await rm(temporary, { recursive: true, force: true });
}
