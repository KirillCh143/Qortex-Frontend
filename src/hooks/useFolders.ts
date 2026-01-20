import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foldersService } from '@/lib/config'

export const useFolders = () => {
  return useQuery({
    queryKey: ['folders'],
    queryFn: () => foldersService.getFolders()
  })
}

export const useCreateFolder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; parent: string | null }) =>
      foldersService.createFolder(data),
    onSuccess: () => {
      // Invalidate folders query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    },
    onError: (error) => {
      console.error('Failed to create folder:', error)
    }
  })
}
