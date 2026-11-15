import { copyFile, mkdir } from 'node:fs/promises'

await mkdir(new URL('./dist/', import.meta.url), { recursive: true })
await copyFile(
  new URL('./src/ui.html', import.meta.url),
  new URL('./dist/ui.html', import.meta.url),
)
