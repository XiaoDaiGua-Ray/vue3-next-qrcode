import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..')
const source = path.join(rootDir, 'components/style-entry.d.ts')

for (const outputDirectory of ['es', 'lib']) {
  const destination = path.join(rootDir, outputDirectory, 'style.d.ts')

  fs.copyFileSync(source, destination)
}
