import { writeFile, unlink, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { StorageAdapter } from './types'

const UPLOAD_DIR = process.env.STORAGE_LOCAL_DIR || './public/uploads'

export const localStorageAdapter: StorageAdapter = {
  async upload(file: Buffer, filename: string, _mimeType: string) {
    await mkdir(UPLOAD_DIR, { recursive: true })
    const path = join(UPLOAD_DIR, filename)
    await writeFile(path, file)
    return `/uploads/${filename}`
  },

  async delete(url: string) {
    const filename = url.replace('/uploads/', '')
    const path = join(UPLOAD_DIR, filename)
    await unlink(path).catch(() => {})
  },

  getPublicUrl(key: string) {
    return `/uploads/${key}`
  },
}
