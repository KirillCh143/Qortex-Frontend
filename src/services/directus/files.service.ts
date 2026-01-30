import { readFiles, readFolders, createFolder, updateFile } from '@directus/sdk';
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
        fields: ['*', 'uploaded_by.id', 'uploaded_by.first_name', 'uploaded_by.last_name'] as any
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

    // Step 1: Upload the file
    const formData = new FormData();
    formData.append('file', data.file);

    const uploadResponse = await fetch(`${client.url}files`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.message || `Failed to upload file: ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    const fileData = uploadResult.data || uploadResult;
    const fileId = fileData.id;

    // Step 2: Update the file metadata (title, description, folder)
    const metadata: any = {};

    if (data.title) {
      metadata.title = data.title;
    }
    if (data.description) {
      metadata.description = data.description;
    }
    if (data.folder) {
      metadata.folder = data.folder;
    }

    const updateResponse = await fetch(`${client.url}files/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(metadata)
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.message || `Failed to update file metadata: ${updateResponse.statusText}`);
    }

    const finalResult = await updateResponse.json();

    // Return the updated file data
    return (finalResult.data || finalResult) as DirectusFile;
  },

  async deleteFile(id: string) {
    // Get auth token from localStorage
    const authData = localStorage.getItem('directus-auth');
    const token = authData ? JSON.parse(authData).access_token : null;

    const response = await fetch(`${client.url}files/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.message || `Failed to delete file: ${response.statusText}`);
    }
  },

  async updateFileMetadata(id: string, data: { title?: string; description?: string; folder?: string | null }) {
    const result = await client.request(
      updateFile(id, data)
    );
    return result as DirectusFile;
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
