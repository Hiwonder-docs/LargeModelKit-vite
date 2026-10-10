import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const version = process.argv[2] || 'latest'
if (version !== 'latest') {
  console.error('LargeModelKit only supports the latest version.')
  process.exit(1)
}

const devServer = spawn(process.execPath, [
  join(repositoryRoot, 'node_modules', 'vitepress', 'bin', 'vitepress.js'),
  'dev', 'docs', ...process.argv.slice(3)
], {
  stdio: 'inherit',
  cwd: repositoryRoot,
  env: {
    ...process.env,
    DOCS_BASE: process.env.DOCS_BASE || '/projects/LargeModelKit/en/latest/'
  }
})

devServer.on('error', (error) => {
  console.error(error.message)
  process.exit(1)
})
devServer.on('exit', (code) => process.exit(code ?? 1))
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => devServer.kill(signal))
}
