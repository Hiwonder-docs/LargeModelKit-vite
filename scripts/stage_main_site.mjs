import { access, mkdir, rm, cp, readdir, readFile, writeFile, unlink } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join, extname, basename, resolve, relative, isAbsolute } from 'path'
import { setTimeout as delay } from 'timers/promises'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(__dirname, '..')

const projectName = 'LargeModelKit'
const version = process.argv[2] || 'latest'

if (version !== 'latest') {
  console.error('LargeModelKit only supports the latest version.')
  process.exit(1)
}

const sourceDir = resolve(repositoryRoot, 'docs/.vitepress/dist')
await access(join(sourceDir, 'index.html'))
const targetDir = resolve(repositoryRoot, 'projects', projectName, 'en', version)
const targetRelativePath = relative(resolve(repositoryRoot), targetDir)
if (isAbsolute(targetRelativePath) || targetRelativePath.startsWith('..') || !targetRelativePath) {
  throw new Error(`Invalid staging directory: ${targetDir}`)
}
await rm(targetDir, { recursive: true, force: true })
await mkdir(targetDir, { recursive: true })

await cp(
  sourceDir,
  targetDir,
  { recursive: true }
)

await convertRasterImagesToWebp(targetDir)
await copyPdfAssets(targetDir)

console.log('Staged files to:', targetDir)

async function copyPdfAssets(targetDir) {
  const pdfSourceDir = join(repositoryRoot, 'docs', '_static', 'shared', 'pdf')
  if (!await pathExists(pdfSourceDir)) {
    return
  }

  await cp(
    pdfSourceDir,
    join(targetDir, '_static', 'shared', 'pdf'),
    { recursive: true }
  )
}

async function walkFiles(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = join(rootDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkFiles(entryPath))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

function isConvertibleRasterImage(filePath) {
  const extension = extname(filePath).toLowerCase()
  return extension === '.png' || extension === '.jpg' || extension === '.jpeg'
}

function isTextAsset(filePath) {
  const extension = extname(filePath).toLowerCase()
  return (
    extension === '.html' ||
    extension === '.js' ||
    extension === '.css' ||
    extension === '.json' ||
    extension === '.mjs' ||
    extension === '.txt' ||
    extension === '.xml' ||
    extension === '.svg' ||
    extension === '.md' ||
    extension === '.map'
  )
}

async function convertRasterImagesToWebp(rootDir) {
  const allFiles = await walkFiles(rootDir)
  const rasterFiles = allFiles.filter(isConvertibleRasterImage)
  const replacements = new Map()

  console.log(`Converting ${rasterFiles.length} images to WebP...`)
  let nextImage = 0
  let completedImages = 0
  async function convertImages() {
    while (nextImage < rasterFiles.length) {
      const filePath = rasterFiles[nextImage++]
      const webpPath = filePath.replace(/\.(png|jpe?g)$/i, '.webp')
      try {
        const image = sharp(filePath, { failOn: 'error' })
        const metadata = await image.metadata()
        // Full-resolution assembly diagrams can exhaust encoder memory.
        if (metadata.width * metadata.height > 40_000_000) {
          console.log(`[webp] Keeping large original ${basename(filePath)} (${metadata.width} x ${metadata.height})`)
        } else {
          await image.webp({ quality: 90, alphaQuality: 100, effort: 4 }).toFile(webpPath)
          await unlink(filePath)
          replacements.set(basename(filePath), basename(webpPath))
        }
      } catch (error) {
        console.warn(`[webp] Keeping original ${basename(filePath)}: ${error.message.split('\n')[0]}`)
      }
      completedImages++
      if (completedImages % 25 === 0 || completedImages === rasterFiles.length) {
        console.log(`WebP: ${completedImages}/${rasterFiles.length}`)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(2, rasterFiles.length) }, convertImages))

  const textFiles = allFiles.filter(isTextAsset)

  for (const filePath of textFiles) {
    let content = await readFile(filePath, 'utf8')
    let changed = false

    for (const [oldName, newName] of replacements) {
      if (content.includes(oldName)) {
        content = content.split(oldName).join(newName)
        changed = true
      }
    }

    if (changed) {
      await writeTextFileWithRetry(filePath, content)
    }
  }
}

async function writeTextFileWithRetry(filePath, content, retries = 5) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await writeFile(filePath, content)
      return
    } catch (error) {
      if (attempt === retries) {
        throw error
      }

      await delay(200 * (attempt + 1))
    }
  }
}

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}
