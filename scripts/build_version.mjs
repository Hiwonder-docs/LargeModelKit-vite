import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const version = process.argv[2] || 'latest'
if (version !== 'latest') {
  console.error('LargeModelKit only supports the latest version.')
  process.exit(1)
}

const options = {
  cwd: repositoryRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    DOCS_BASE: process.env.DOCS_BASE || '/projects/LargeModelKit/en/latest/'
  }
}

try {
  execFileSync(process.execPath, [
    join(repositoryRoot, 'node_modules', 'vitepress', 'bin', 'vitepress.js'),
    'build', 'docs'
  ], options)
  execFileSync(process.execPath, [join(repositoryRoot, 'scripts', 'stage_main_site.mjs'), 'latest'], options)
} catch (error) {
  process.exit(typeof error.status === 'number' ? error.status : 1)
}
