// DirectusFile interface matching Directus Files collection schema
export interface DirectusFile {
  id: string;
  filename_download: string;
  type: string;
  filesize: number;
  title: string;
  description: string;
  uploaded_on: string;
}

// FilesService interface for both mock and real implementations
export interface FilesService {
  getFiles: (params?: { limit?: number; search?: string }) => Promise<DirectusFile[]>;
  downloadFile: (id: string) => Promise<Blob>;
}
