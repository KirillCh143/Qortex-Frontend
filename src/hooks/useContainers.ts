import { useQuery } from '@tanstack/react-query';
import { portainerService } from '@/lib/config';

// Hook for fetching containers
export const useContainers = () => {
  return useQuery({
    queryKey: ['containers'],
    queryFn: () => portainerService.getContainers(),
    staleTime: 0, // Always fetch fresh data on mount
    refetchOnWindowFocus: false, // Only manual refresh
  });
};
