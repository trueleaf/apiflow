import { ViteDevServer } from 'vite';
import { spawn, ChildProcess, exec } from 'child_process';
import esbuild from 'esbuild';
import electron from 'electron';
import path from 'path'
import fs from 'fs'
import chokidar from 'chokidar';
import type { AddressInfo } from 'net';
import { debounce } from 'lodash-es';

const processWithElectron: NodeJS.Process & {
  electronProcess?: ChildProcess
} = process;

let isKilling = false;
const buildElectron = (mode: string, command: 'build' | 'serve') => {
  esbuild.buildSync({
    entryPoints: ['./src/main/**'],
    bundle: true,
    platform: 'node',
    outdir: 'dist/main',
    format: 'esm',
    outExtension: {
      '.js': '.mjs',
    },
    packages: 'external',
    external: ['electron'],
    define: {
      __MODE__: JSON.stringify(mode),
      __COMMAND__: JSON.stringify(command),
    },
    alias: {
      '@src': path.resolve(process.cwd(), './src'),
    }
  });
  const sourcePackage = path.resolve(process.cwd(), './package.json');
  const targetPackage = path.resolve(process.cwd(), './dist/main/package.json');
  const pkgContent = JSON.parse(fs.readFileSync(sourcePackage, 'utf-8'));
  pkgContent.main = 'main.mjs';
  fs.writeFileSync(targetPackage, JSON.stringify(pkgContent, null, 2));
  const devUpdateYml = path.resolve(process.cwd(), './dist/main/dev-app-update.yml');
  fs.writeFileSync(devUpdateYml, 'provider: generic\nurl: http://127.0.0.1/release');
}
const startElectronProcess = (server: ViteDevServer,) => {
  const addressInfo = server.httpServer?.address() as AddressInfo;
  const httpAddress = `http://${addressInfo?.address}:${addressInfo?.port}`;
  processWithElectron.electronProcess?.removeAllListeners()
  processWithElectron.electronProcess = spawn(electron.toString(), ['.', httpAddress], {
    cwd: path.resolve(process.cwd(), './dist/main'),
    stdio: 'inherit',
  });
  processWithElectron.electronProcess.on('exit', () => {
    server?.close();
    process?.exit();
  });
  processWithElectron.electronProcess.on('error', (err) => {
    console.error(err)
  })
  isKilling = false;
}
export const viteElectronPlugin = (mode: string, command: 'build' | 'serve') => {
  const debounceReloadMain = debounce((server: ViteDevServer) => {
    if (processWithElectron.electronProcess?.pid && !isKilling) {
      buildElectron(mode, command)
      console.log('重启主进程中...')
      isKilling = true;
      process.kill(processWithElectron.electronProcess.pid);
      startElectronProcess(server);
    }
  })
  return {
    name: 'vite-electron-plugn',
    configureServer(server: ViteDevServer) {
      if (processWithElectron.electronProcess?.pid) {
        process.kill(processWithElectron.electronProcess.pid)
        processWithElectron.electronProcess.removeAllListeners()
        processWithElectron.electronProcess = undefined;
      }
      server.httpServer?.once('listening', () => {
        buildElectron(mode, command)
        startElectronProcess(server);
        const watcher = chokidar.watch(
          path.resolve(process.cwd(), './src/main'),
          {
            persistent: true,
            depth: 10,
          }
        );
        watcher.on('change', debounceReloadMain)
      });
    },
    closeBundle() {
      if (command === 'build') {
        buildElectron(mode, command);
      }
    }
  };
};
