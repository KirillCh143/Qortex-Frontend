import { readFiles, readFolders, createFolder, uploadFiles } from '@directus/sdk';
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
    // Get auth token from localStorage to authenticate the request
    const authData = localStorage.getItem('directus-auth');
    const token = authData ? JSON.parse(authData).access_token : null;

    // Fetch the actual file content directly from assets endpoint
    const response = await fetch(`${client.url}assets/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return response.blob();
  },

  async uploadFile(data: { file: File; title?: string; description?: string; folder: string | null }) {
    // Get auth token from localStorage
    const authData = localStorage.getItem('directus-auth');
    const token = authData ? JSON.parse(authData).access_token : null;

    const formData = new FormData();
    formData.append('file', data.file);

    // Always append title (use filename if not provided)
    formData.append('title', data.title || data.file.name);

    // Always append description (empty string if not provided)
    formData.append('description', data.description || '');

    // Always append folder (even if null for root)
    if (data.folder) {
      formData.append('folder', data.folder);
    }

    // Use direct fetch instead of SDK to ensure metadata is handled correctly
    const response = await fetch(`${client.url}files`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.message || `Failed to upload file: ${response.statusText}`);
    }

    const result = await response.json();
    // Directus API returns { data: { ... } }
    return (result.data || result) as DirectusFile;
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
  },

  async createFolder(data: { name: string; parent: string | null }) {
    const result = await client.request(
      createFolder({
        name: data.name,
        parent: data.parent
      })
    );
    return result as DirectusFolder;
  }
});
