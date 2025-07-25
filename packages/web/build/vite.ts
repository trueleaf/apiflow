import { ViteDevServer } from 'vite';
import { spawn, ChildProcess, exec } from 'child_process';
import esbuild from 'esbuild';
import electron from 'electron';
import path from 'path'
import chokidar from 'chokidar';
import type { AddressInfo } from 'net';
import { debounce } from 'lodash-es';

const processWithElectron: NodeJS.Process & {
  electronProcess?: ChildProcess
} = process;

let isKilling = false;
const buildElectron = () => {
  esbuild.buildSync({
    entryPoints: ['./src/main/**'],
    bundle: true,
    platform: 'node',
    outdir: 'dist',
    format: 'esm',
    outExtension: {
      '.js': '.mjs',
    },
    external: ['electron'],
  });
}
const startElectronProcess = (server: ViteDevServer,) => {
  const addressInfo = server.httpServer?.address() as AddressInfo;
  const httpAddress = `http://${addressInfo?.address}:${addressInfo?.port}`;
  processWithElectron.electronProcess?.removeAllListeners()
  processWithElectron.electronProcess = spawn(electron.toString(), ['./dist/main.mjs', httpAddress], {
    cwd: process.cwd(),
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
export const viteElectronPlugin = () => {
  const debounceReloadMain = debounce((server: ViteDevServer) => {
    if (processWithElectron.electronProcess?.pid && !isKilling) {
      buildElectron()
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
        buildElectron()
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
  };
};
