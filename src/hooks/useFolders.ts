import { useQuery } from '@tanstack/react-query'
import { foldersService } from '@/lib/config'

export const useFolders = () => {
  return useQuery({
    queryKey: ['folders'],
    queryFn: () => foldersService.getFolders()
  })
}
