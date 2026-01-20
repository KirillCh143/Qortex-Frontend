// DirectusFolder interface matching Directus Folders collection schema
export interface DirectusFolder {
  id: string;
  name: string;
  parent: string | null;
}

// DirectusFile interface matching Directus Files collection schema
export interface DirectusFile {
  id: string;
  filename_download: string;
  type: string;
  filesize: number;
  title: string;
  description: string;
  uploaded_on: string;
  folder: string | null;
}

// FoldersService interface for both mock and real implementations
export interface FoldersService {
  getFolders: () => Promise<DirectusFolder[]>;
  createFolder: (data: { name: string; parent: string | null }) => Promise<DirectusFolder>;
}

// FilesService interface for both mock and real implementations
export interface FilesService {
  getFiles: (params?: { limit?: number; search?: string; folder?: string | 'root' }) => Promise<DirectusFile[]>;
  downloadFile: (id: string) => Promise<Blob>;
  uploadFile: (data: { file: File; title?: string; description?: string; folder: string | null }) => Promise<DirectusFile>;
}

// ChatMessage interface matching Directus chat_messages collection schema
export interface ChatMessage {
  id: string;
  user: string; // user ID
  role: 'user' | 'assistant';
  content: string;
  mode?: 'rag' | 'llm';
  timestamp: string; // ISO string
}

// ChatService interface for both mock and real implementations
export interface ChatService {
  getMessages: (userId: string, mode?: 'rag' | 'llm') => Promise<ChatMessage[]>;
  saveMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<ChatMessage>;
  clearMessages: (userId: string, mode?: 'rag' | 'llm') => Promise<void>;
}
