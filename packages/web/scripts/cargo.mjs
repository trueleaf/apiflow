import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const executable = path.join(process.env.CARGO_HOME || path.join(homedir(), '.cargo'), 'bin', process.platform === 'win32' ? 'cargo.exe' : 'cargo');
const child = spawn(existsSync(executable) ? executable : 'cargo', process.argv.slice(2), { stdio: 'inherit' });
child.on('error', error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
