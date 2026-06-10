import { spawn } from 'child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const allowedTargets = ['pack', 'win', 'mac', 'linux']
const rawArgs = process.argv.slice(2)
const target = allowedTargets.includes(rawArgs[0] ?? '') ? rawArgs[0] : ''
const args = target ? rawArgs.slice(1) : rawArgs
const nameIndex = args.indexOf('--name')
const flagName = nameIndex >= 0 ? args[nameIndex + 1]?.trim() : ''
const positionalName = args.find((arg) => !arg.startsWith('-'))?.trim() ?? ''
const appName = flagName || positionalName

if (!appName) {
  process.stderr.write('纯净构建需要传入应用名称，例如：npm run build:clean:win -- --name MyTool 或 npm run build:clean:win -- MyTool\n')
  process.exit(1)
}

const packageJsonPath = join(projectRoot, 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
const baseBuildConfig = packageJson.build
const slug = appName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'clean-app'
const identityName = appName
  .replace(/[^a-zA-Z0-9]+/g, '')
  .slice(0, 40) || 'CleanApp'
const cleanBuildConfig = {
  ...baseBuildConfig,
  productName: appName,
  appId: `local.${slug}`,
  copyright: `Copyright © 2026 ${appName}`,
  publish: [],
  appx: {
    ...baseBuildConfig.appx,
    applicationId: identityName,
    identityName,
    publisherDisplayName: appName,
    displayName: appName,
  },
  nsis: {
    ...baseBuildConfig.nsis,
    shortcutName: appName,
  },
  linux: {
    ...baseBuildConfig.linux,
    maintainer: appName,
    desktop: {
      ...baseBuildConfig.linux?.desktop,
      entry: {
        ...baseBuildConfig.linux?.desktop?.entry,
        Name: appName,
        Comment: 'Visual API design tool',
      },
    },
  },
}
const tempDir = mkdtempSync(join(tmpdir(), 'apiflow-clean-build-'))
const builderConfigPath = join(tempDir, 'electron-builder.clean.json')

writeFileSync(builderConfigPath, JSON.stringify(cleanBuildConfig, null, 2))

const runCommand = (command, commandArgs, env = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, commandArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ...env,
    },
  })
  child.on('exit', (code) => {
    if (code === 0) {
      resolve()
      return
    }
    reject(new Error(`${command} ${commandArgs.join(' ')} 执行失败，退出码：${code ?? 'unknown'}`))
  })
  child.on('error', reject)
})

const getBuilderArgs = () => {
  const args = ['--config', builderConfigPath, '--publish', 'never']
  if (target === 'pack') {
    return ['--dir', ...args]
  }
  if (target) {
    return [`--${target}`, ...args]
  }
  return args
}

try {
  await runCommand('vite', ['build'], {
    APIFLOW_CLEAN_BUILD: 'true',
    APIFLOW_BUILD_NAME: appName,
    NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=8192',
  })
  await runCommand('electron-builder', getBuilderArgs(), {
    APIFLOW_CLEAN_BUILD: 'true',
    APIFLOW_BUILD_NAME: appName,
  })
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
