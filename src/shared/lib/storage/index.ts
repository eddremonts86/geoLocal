import type { StorageAdapter } from './types'
import { localStorageAdapter } from './local'

export function getStorageAdapter(): StorageAdapter {
  // Future: switch on STORAGE_PROVIDER env to return S3 adapter etc.
  return localStorageAdapter
}

export type { StorageAdapter }
