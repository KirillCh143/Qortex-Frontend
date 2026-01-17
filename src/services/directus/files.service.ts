import { readFiles, readFolders } from '@directus/sdk';
import { FilesService, DirectusFile, FoldersService, DirectusFolder } from './types';

// Real implementation using Directus SDK
// Using any type for client since DirectusClient type doesn't reflect .with() extensions
export const createRealFilesService = (client: any): FilesService => ({
  async getFiles({ limit = 50, search, folder } = {}) {
    const result = await client.request(
      readFiles({
        limit,
        ...(search && { search }),
        ...(folder && folder === 'root' && { filter: { folder: { _null: true } } }),
        ...(folder && folder !== 'root' && { filter: { folder: { _eq: folder } } }),
        sort: ['-uploaded_on'],
        fields: ['id', 'filename_download', 'type', 'filesize', 'title', 'description', 'uploaded_on', 'folder']
      })
    );
    // The SDK may return an object with a `data` array (and meta). Normalize
    // to always return the array of files so callers can safely call `.map()`.
    if (Array.isArray(result)) return result as DirectusFile[];
    if (result && Array.isArray((result as any).data)) return (result as any).data as DirectusFile[];
    return [] as DirectusFile[];
  },

  async downloadFile(id: string) {
    // Fetch the actual file content directly from assets endpoint
    const response = await fetch(`${client.url}/assets/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return response.blob();
  }
});

// Real folders service implementation using Directus SDK
export const createRealFoldersService = (client: any): FoldersService => ({
  async getFolders() {
    const result = await client.request(
      readFolders({
        fields: ['id', 'name', 'parent'],
        sort: ['name']
      })
    );
    // Normalize response similar to files service
    if (Array.isArray(result)) return result as DirectusFolder[];
    if (result && Array.isArray((result as any).data)) return (result as any).data as DirectusFolder[];
    return [] as DirectusFolder[];
  }
});
