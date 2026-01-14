import { readFiles, readFile } from '@directus/sdk';
import { FilesService, DirectusFile } from './types';

// Real implementation using Directus SDK
// Using any type for client since DirectusClient type doesn't reflect .with() extensions
export const createRealFilesService = (client: any): FilesService => ({
  async getFiles({ limit = 50, search } = {}) {
    const result = await client.request(
      readFiles({
        limit,
        ...(search && { search }),
        sort: ['-uploaded_on'],
        fields: ['id', 'filename_download', 'type', 'filesize', 'title', 'description', 'uploaded_on']
      })
    );
    return result as DirectusFile[];
  },

  async downloadFile(id: string) {
    // Get file metadata first
    await client.request(readFile(id));

    // Fetch the actual file content from assets endpoint
    const response = await fetch(`${client.url}/assets/${id}`);
    return response.blob();
  }
});
