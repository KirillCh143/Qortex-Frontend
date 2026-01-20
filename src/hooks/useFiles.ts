import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesService } from '@/lib/config';

// Hook for fetching files with optional search and folder filter
export const useFiles = (params?: { search?: string; folder?: string | null }) => {
  // Convert null folder to undefined for service call
  const serviceParams = params ? {
    ...params,
    folder: params.folder === null ? undefined : params.folder
  } : undefined;

  return useQuery({
    queryKey: ['files', params],
    queryFn: () => filesService.getFiles(serviceParams),
    // Use default staleTime from QueryProvider (5 minutes)
  });
};

// Hook for downloading files
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: (fileId: string) => filesService.downloadFile(fileId),
    // Let component handle download logic to avoid double downloads
  });
};

// Hook for uploading files
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { file: File; title?: string; description?: string; folder: string | null }) =>
      filesService.uploadFile(data),
    onSuccess: () => {
      // Invalidate files query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('Failed to upload file:', error);
    }
  });
};
