import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const cargoBin = path.join(process.env.CARGO_HOME || path.join(homedir(), '.cargo'), 'bin');
const environment = { ...process.env };
const pathKey = Object.keys(environment).find(key => key.toLowerCase() === 'path') || 'PATH';
if (existsSync(cargoBin)) environment[pathKey] = `${cargoBin}${path.delimiter}${environment[pathKey] || ''}`;
const child = spawn(process.execPath, [path.resolve('node_modules/@tauri-apps/cli/tauri.js'), ...process.argv.slice(2)], { stdio: 'inherit', env: environment });
child.on('error', error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
