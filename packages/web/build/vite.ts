import { ViteDevServer } from 'vite';
import { spawn, ChildProcess } from 'child_process';
import { rolldown } from 'rolldown';
import { replacePlugin } from 'rolldown/plugins';
import path from 'path'
import chokidar from 'chokidar';
import type { AddressInfo } from 'net';
import { debounce } from 'lodash-es';
import glob from 'fast-glob';
import { builtinModules } from 'module';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

const processWithElectron: NodeJS.Process & {
  electronProcess?: ChildProcess
} = process;

let isKilling = false;
const buildElectron = async (mode: string, command: 'build' | 'serve') => {
  const entryPoints = await glob(['./src/main/**'], {
    cwd: process.cwd(),
    ignore: ['**/*.d.ts'],
    absolute: true,
    onlyFiles: true
  });
  const input = entryPoints.filter(f => /\.(ts|js|mjs|cjs)$/.test(f));
  const bundle = await rolldown({
    input,
    platform: 'node',
    external: [
      'electron',
      ...builtinModules,
      ...builtinModules.map(m => `node:${m}`)
    ],
    resolve: {
      alias: {
        '@src': path.resolve(process.cwd(), './src'),
        '@shared/execCode': path.resolve(process.cwd(), './src/shared/execCode.node.ts'),
        '@shared': path.resolve(process.cwd(), './src/shared'),
      }
    },
    plugins: [
      replacePlugin({
        __MODE__: JSON.stringify(mode),
        __COMMAND__: JSON.stringify(command),
      }),
    ],
  });

  await bundle.write({
    dir: 'dist/main',
    format: 'esm',
    entryFileNames: '[name].mjs',
  });
}
const generateDevUpdateConfig = () => {
  const configPath = path.join(process.cwd(), 'dev-app-update.yml')
  const config = {
    provider: 'github',
    owner: 'trueleaf',
    repo: 'apiflow',
  }
  try {
    const yamlContent = yaml.dump(config)
    fs.writeFileSync(configPath, yamlContent, 'utf-8')
    console.log('✓ 已生成 dev-app-update.yml')
  } catch (error) {
    console.error('生成 dev-app-update.yml 失败:', error)
  }
}
const startElectronProcess = async (server: ViteDevServer,) => {
  const addressInfo = server.httpServer?.address() as AddressInfo;
  const httpAddress = `http://${addressInfo?.address}:${addressInfo?.port}`;

  // Lazy import electron so that web-only builds won't try to load it
  let electronModule: any;
  try {
    electronModule = await import('electron');
  } catch (err) {
    console.error('Failed to import electron:', err);
    return;
  }
  const electronBinary = (electronModule && (electronModule.default ?? electronModule)).toString();

  processWithElectron.electronProcess?.removeAllListeners()
  processWithElectron.electronProcess = spawn(electronBinary, ['./main.mjs', httpAddress], {
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
  const debounceReloadMain = debounce(async (server: ViteDevServer) => {
    if (processWithElectron.electronProcess?.pid && !isKilling) {
      isKilling = true;
      try {
        await buildElectron(mode, command)
        console.log('重启主进程中...')
        process.kill(processWithElectron.electronProcess.pid);
        await startElectronProcess(server);
      } catch (err) {
        console.error('重启失败:', err)
        isKilling = false;
      }
    }
  }, 300)
  return {
    name: 'vite-electron-plugn',
    configureServer(server: ViteDevServer) {
      if (processWithElectron.electronProcess?.pid) {
        process.kill(processWithElectron.electronProcess.pid)
        processWithElectron.electronProcess.removeAllListeners()
        processWithElectron.electronProcess = undefined;
      }
      server.httpServer?.once('listening', async () => {
        await buildElectron(mode, command)
        generateDevUpdateConfig()
        await startElectronProcess(server);
        const watcher = chokidar.watch(
          path.resolve(process.cwd(), './src/main'),
          {
            persistent: true,
            depth: 10,
            ignoreInitial: true,
            awaitWriteFinish: {
              stabilityThreshold: 100,
              pollInterval: 50
            }
          }
        );
        watcher.on('change', () => debounceReloadMain(server))
      });
    },
    async closeBundle() {
      if (command === 'build') {
        await buildElectron(mode, command);
      }
    }
  };
};
