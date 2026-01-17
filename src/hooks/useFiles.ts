import { useQuery, useMutation } from '@tanstack/react-query';
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
    onSuccess: (blob, fileId) => {
      // Create blob URL and trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileId; // Will be replaced with actual filename from component
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
};
