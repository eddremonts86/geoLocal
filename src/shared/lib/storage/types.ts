export interface StorageAdapter {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>
  delete(url: string): Promise<void>
  getPublicUrl(key: string): string
}
