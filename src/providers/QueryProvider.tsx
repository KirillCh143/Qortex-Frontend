import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getEnv } from '@/lib/env';

// DevTools controlled by VITE_SHOW_DEVTOOLS env var (default: true in dev, false in prod)
const showDevTools = getEnv('VITE_SHOW_DEVTOOLS') === 'true';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    {showDevTools && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);
