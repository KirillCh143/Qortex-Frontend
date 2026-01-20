import { FilesService, DirectusFile, FoldersService, DirectusFolder } from '../directus/types';
import { mockDocuments, mockFolders, generateMockFileContent } from '@/lib/mockDocuments';

// Map Document type to DirectusFile type
const mapDocumentsToDirectusFiles = (): DirectusFile[] => {
  return mockDocuments.map(doc => ({
    id: doc.id,
    filename_download: doc.filename,
    type: doc.filename.endsWith('.pdf') ? 'application/pdf' :
          doc.filename.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
          doc.filename.endsWith('.md') ? 'text/markdown' :
          'text/plain',
    filesize: doc.filesize,
    title: doc.title,
    description: doc.description,
    uploaded_on: doc.uploadedOn.toISOString(),
    folder: doc.folder
  }));
};

// Mock implementation using mockDocuments
export const createMockFilesService = (): FilesService => {
  const mockFiles = mapDocumentsToDirectusFiles();

  return {
    async getFiles({ limit = 50, search, folder } = {}) {
      let results = [...mockFiles];

      // Filter by folder if provided
      if (folder) {
        if (folder === 'root') {
          results = results.filter(file => file.folder === null);
        } else {
          results = results.filter(file => file.folder === folder);
        }
      }

      // Filter by search if provided
      if (search) {
        const query = search.toLowerCase();
        results = results.filter(file =>
          file.title.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query)
        );
      }

      // Return slice up to limit
      return results.slice(0, limit);
    },

    async downloadFile(id: string) {
      // Find the original document
      const document = mockDocuments.find(doc => doc.id === id);
      if (!document) {
        throw new Error(`File not found: ${id}`);
      }

      // Generate mock file content using existing function
      return generateMockFileContent(document);
    }
  };
};

// Mock folders service implementation
export const createMockFoldersService = (): FoldersService => ({
  async getFolders() {
    return mockFolders as DirectusFolder[];
  },

  async createFolder(data: { name: string; parent: string | null }) {
    // In mock mode, just return a mock folder
    const newFolder: DirectusFolder = {
      id: `folder-${Date.now()}`,
      name: data.name,
      parent: data.parent
    };
    // In real implementation, this would persist to mockFolders
    // For now, just return the new folder without persisting
    console.log('Mock: Created folder', newFolder);
    return newFolder;
  }
});
