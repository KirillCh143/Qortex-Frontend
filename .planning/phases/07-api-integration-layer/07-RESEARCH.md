# Phase 7: API Integration Layer - Research

**Researched:** 2026-01-15
**Domain:** Directus SDK + n8n webhook integration with React TypeScript
**Confidence:** HIGH

<research_summary>
## Summary

Researched the Directus SDK and n8n webhook integration ecosystem for building a React TypeScript application with mock/real API toggling. The standard approach uses the official @directus/sdk with its composable client pattern for type-safe Directus operations, paired with a service layer architecture using dependency injection to enable seamless mock/real data switching.

Key finding: Don't hand-roll authentication token management, retry logic, or API client layers. The Directus SDK handles token refresh automatically through the authentication() composable. For error handling and retries, React Query provides production-ready patterns with exponential backoff. For webhook timeout handling, implement queue-based processing instead of synchronous long-running operations.

**Primary recommendation:** Use @directus/sdk composable client with React Query for data fetching. Implement service layer with dependency injection for mock/real toggle. Configure CORS properly in Docker environment. Use TypeScript interfaces for type safety with runtime validation via Zod for webhook payloads.
</research_summary>

<standard_stack>
## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @directus/sdk | Latest (15.x+) | Directus API client | Official SDK with composable architecture, auto token refresh, full TypeScript support |
| @tanstack/react-query | 5.x | API state management | Industry standard for data fetching, built-in retry logic, caching, error handling |
| axios | 1.6.x | HTTP client (optional) | Used if not using SDK's built-in rest() - better error handling than fetch |
| zod | 3.x | Runtime validation | Type-safe runtime checks for webhook payloads and API responses |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| axios-retry | 4.x | Retry logic for axios | If using axios instead of React Query's built-in retry |
| react-error-boundary | 4.x | Error UI boundaries | Graceful error fallbacks in React components |
| @tanstack/react-query-devtools | 5.x | Development debugging | Visualize query cache and network requests during dev |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Query | SWR or RTK Query | SWR simpler but less features; RTK Query tightly coupled to Redux |
| @directus/sdk | Direct REST calls | SDK provides auth, types, composability - don't reinvent |
| Zod | io-ts or Yup | Zod has best TypeScript inference and DX |

**Installation:**
```bash
npm install @directus/sdk @tanstack/react-query zod
npm install --save-dev @tanstack/react-query-devtools
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   ├── directus/
│   │   ├── client.ts          # Directus SDK setup
│   │   ├── auth.service.ts    # Authentication operations
│   │   ├── files.service.ts   # Files collection queries
│   │   └── types.ts           # Directus schema types
│   ├── n8n/
│   │   ├── webhook.service.ts # n8n webhook client
│   │   └── types.ts           # Webhook payload types
│   └── mock/
│       ├── auth.mock.ts       # Mock auth service
│       ├── files.mock.ts      # Mock files service
│       └── webhook.mock.ts    # Mock webhook service
├── hooks/
│   ├── useAuth.ts             # Auth operations with React Query
│   ├── useFiles.ts            # Files queries
│   └── useChatQuery.ts        # n8n webhook queries
├── providers/
│   ├── DirectusProvider.tsx   # Directus client context
│   └── QueryProvider.tsx      # React Query setup
└── lib/
    ├── config.ts              # Environment-based config
    └── validators.ts          # Zod schemas
```

### Pattern 1: Directus Composable Client Setup
**What:** Use SDK's composable pattern with TypeScript schema
**When to use:** All Directus API interactions
**Example:**
```typescript
// src/services/directus/client.ts
import { createDirectus, rest, authentication } from '@directus/sdk';

// Define your Directus schema for type safety
interface DirectusFile {
  id: string;
  filename_download: string;
  type: string;
  filesize: number;
  title: string;
  description: string;
  uploaded_on: string;
}

interface Schema {
  directus_files: DirectusFile[];
  // Add other collections as needed
}

// Create composable client
export const createDirectusClient = (url: string) => {
  return createDirectus<Schema>(url)
    .with(authentication('json'))
    .with(rest());
};

// Usage
const client = createDirectusClient('http://localhost:8055');
await client.login({ email, password });
const files = await client.request(readFiles({ limit: 10 }));
```

### Pattern 2: Service Layer with Dependency Injection
**What:** Abstract API calls behind service interfaces with mock/real implementations
**When to use:** Enabling easy mock/real data switching
**Example:**
```typescript
// src/services/directus/files.service.ts
import { DirectusClient } from '@directus/sdk';
import { readFiles } from '@directus/sdk/rest';

export interface FilesService {
  getFiles: (limit?: number) => Promise<DirectusFile[]>;
  getFile: (id: string) => Promise<DirectusFile>;
}

// Real implementation
export const createFilesService = (client: DirectusClient<Schema>): FilesService => ({
  getFiles: async (limit = 50) => {
    const result = await client.request(
      readFiles({
        limit,
        sort: ['-uploaded_on'],
        fields: ['id', 'filename_download', 'type', 'filesize', 'title', 'description']
      })
    );
    return result;
  },
  getFile: async (id: string) => {
    return client.request(readFile(id));
  }
});

// Mock implementation
export const createMockFilesService = (): FilesService => ({
  getFiles: async (limit = 50) => mockFilesData.slice(0, limit),
  getFile: async (id: string) => mockFilesData.find(f => f.id === id)!
});

// Usage with config toggle
const filesService = config.useMockData
  ? createMockFilesService()
  : createFilesService(directusClient);
```

### Pattern 3: React Query Integration
**What:** Use React Query for data fetching with automatic retry and caching
**When to use:** All API calls from React components
**Example:**
```typescript
// src/hooks/useFiles.ts
import { useQuery } from '@tanstack/react-query';
import { filesService } from '@/services/directus/files.service';

export const useFiles = () => {
  return useQuery({
    queryKey: ['files'],
    queryFn: () => filesService.getFiles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Usage in component
function KnowledgeBase() {
  const { data: files, isLoading, error } = useFiles();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <FilesList files={files} />;
}
```

### Pattern 4: n8n Webhook with Timeout Handling
**What:** Queue-based pattern for long-running n8n workflows
**When to use:** Chat queries that may exceed 100s timeout
**Example:**
```typescript
// src/services/n8n/webhook.service.ts
import axios from 'axios';
import { z } from 'zod';

// Validation schema
const WebhookResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string()
  })).optional()
});

export interface WebhookService {
  sendQuery: (payload: ChatQueryPayload) => Promise<ChatResponse>;
}

export const createWebhookService = (webhookUrl: string): WebhookService => ({
  sendQuery: async (payload) => {
    try {
      const response = await axios.post(webhookUrl, payload, {
        timeout: 95000, // Just under n8n's 100s limit
        headers: { 'Content-Type': 'application/json' }
      });

      // Runtime validation
      return WebhookResponseSchema.parse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error('Query timeout - please try again with a simpler question');
      }
      throw error;
    }
  }
});
```

### Pattern 5: CORS Configuration in Docker
**What:** Proper CORS environment variables for Directus
**When to use:** Always in Docker localhost development
**Example:**
```yaml
# docker-compose.yml
services:
  directus:
    environment:
      CORS_ENABLED: 'true'
      CORS_ORIGIN: 'http://localhost:5173'
      CORS_METHODS: 'GET,POST,PATCH,DELETE,OPTIONS'
      CORS_ALLOWED_HEADERS: 'Content-Type,Authorization'
      CORS_EXPOSED_HEADERS: 'Content-Range'
      CORS_CREDENTIALS: 'true'
```

### Anti-Patterns to Avoid
- **Manual token refresh logic:** SDK's authentication() composable handles this automatically
- **Not validating webhook responses:** TypeScript types disappear at runtime - use Zod
- **Synchronous webhook processing >30s:** Use queue pattern or polling instead
- **Mixing mock and real data:** Use service layer to keep implementations separate
- **Not using React Query retry:** Don't implement custom retry logic, configure React Query
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth token refresh | Custom token expiry checker | @directus/sdk authentication() | SDK handles refresh, storage, race conditions |
| API retry logic | setTimeout loops | React Query retry config | Exponential backoff, attempt tracking, max retries built-in |
| Request caching | localStorage cache | React Query cache | Handles staleness, invalidation, background refetch |
| Type validation | Manual checks | Zod schemas | Runtime safety, auto-inferred TypeScript types |
| CORS proxy | Custom proxy server | Docker environment variables | Directus/n8n have built-in CORS config |
| Webhook timeout handling | Long polling | Queue-based async processing | n8n 100s limit requires async pattern |
| Mock/real switching | Environment checks everywhere | Service layer with DI | Single toggle point, type-safe interfaces |

**Key insight:** External service integration has well-established patterns. Directus SDK solves authentication complexity. React Query solves retry/cache complexity. Zod solves runtime validation. Service layer with dependency injection solves mock/real toggling. Fighting these leads to bugs around edge cases (token refresh race conditions, exponential backoff tuning, cache invalidation) that are already solved.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Token Storage in JSON Mode
**What goes wrong:** Tokens stored in localStorage don't persist across sessions or get out of sync with SDK
**Why it happens:** Directus SDK authentication('json') mode doesn't auto-persist tokens
**How to avoid:** Use authentication('cookie') mode for automatic httpOnly cookie management, OR manually sync localStorage with SDK state
**Warning signs:** Users logged out randomly, "Invalid token" errors after refresh

### Pitfall 2: CORS Errors in Docker Localhost
**What goes wrong:** Frontend can't connect to Directus/n8n despite correct URLs
**Why it happens:** Docker containers need explicit CORS_ORIGIN configuration
**How to avoid:** Set CORS environment variables in docker-compose.yml, restart containers after changes
**Warning signs:** "Access-Control-Allow-Origin" errors in browser console

### Pitfall 3: n8n Webhook Timeout (100s Cloud Limit)
**What goes wrong:** Long-running AI queries fail with 524 status
**Why it happens:** n8n Cloud webhooks timeout after 100 seconds
**How to avoid:** Implement queue pattern: webhook immediately returns job ID, separate polling endpoint checks status
**Warning signs:** Intermittent 524 errors, timeouts on complex RAG queries

### Pitfall 4: TypeScript Types Without Runtime Validation
**What goes wrong:** Webhook returns unexpected data shape, app crashes
**Why it happens:** TypeScript types are compile-time only, external APIs can change
**How to avoid:** Use Zod schemas to validate all external API responses at runtime
**Warning signs:** "Cannot read property of undefined" errors from API data

### Pitfall 5: Not Handling React Query Stale Data
**What goes wrong:** Users see outdated file list after uploading new document
**Why it happens:** React Query caches data with default 0ms staleTime
**How to avoid:** Configure staleTime appropriately, invalidate queries after mutations
**Warning signs:** User refreshes page to see updates, stale data visible

### Pitfall 6: Mixed Mock/Real Service Calls
**What goes wrong:** Some features use mock data while others hit real API
**Why it happens:** Not using consistent service layer abstraction
**How to avoid:** Single config toggle, all services created from same factory based on mode
**Warning signs:** Inconsistent behavior, real API errors in "mock mode"
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources:

### Directus Client Provider with React Context
```typescript
// src/providers/DirectusProvider.tsx
// Source: https://directus.io/docs/tutorials/getting-started/using-authentication-in-react
import { createContext, useContext, useMemo } from 'react';
import { createDirectus, authentication, rest, DirectusClient } from '@directus/sdk';

const DirectusContext = createContext<DirectusClient<Schema> | null>(null);

export const DirectusProvider = ({ children }: { children: React.ReactNode }) => {
  const client = useMemo(() => {
    const url = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
    return createDirectus<Schema>(url)
      .with(authentication('json'))
      .with(rest());
  }, []);

  return (
    <DirectusContext.Provider value={client}>
      {children}
    </DirectusContext.Provider>
  );
};

export const useDirectus = () => {
  const context = useContext(DirectusContext);
  if (!context) throw new Error('useDirectus must be used within DirectusProvider');
  return context;
};
```

### React Query Setup with Error Handling
```typescript
// src/providers/QueryProvider.tsx
// Source: https://tanstack.com/query/latest/docs/framework/react/guides/queries
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

### Files Service with Mock/Real Toggle
```typescript
// src/services/files.ts
import { DirectusClient } from '@directus/sdk';
import { readFiles, readFile } from '@directus/sdk/rest';

export interface FilesService {
  getFiles: (params?: { limit?: number; search?: string }) => Promise<DirectusFile[]>;
  downloadFile: (id: string) => Promise<Blob>;
}

// Real implementation
export const createRealFilesService = (client: DirectusClient<Schema>): FilesService => ({
  async getFiles({ limit = 50, search } = {}) {
    return client.request(
      readFiles({
        limit,
        ...(search && { search }),
        sort: ['-uploaded_on'],
        fields: ['id', 'filename_download', 'type', 'filesize', 'title', 'description', 'uploaded_on']
      })
    );
  },
  async downloadFile(id: string) {
    const file = await client.request(readFile(id));
    const response = await fetch(`${client.url}/assets/${id}`);
    return response.blob();
  }
});

// Mock implementation
export const createMockFilesService = (): FilesService => ({
  async getFiles({ limit = 50, search } = {}) {
    let results = [...mockFiles];
    if (search) {
      results = results.filter(f =>
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return results.slice(0, limit);
  },
  async downloadFile(id: string) {
    const file = mockFiles.find(f => f.id === id);
    if (!file) throw new Error('File not found');
    return new Blob([file.mockContent], { type: file.type });
  }
});

// Factory with environment-based toggle
export const createFilesService = (client?: DirectusClient<Schema>): FilesService => {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  if (useMock) {
    return createMockFilesService();
  }

  if (!client) throw new Error('Directus client required for real mode');
  return createRealFilesService(client);
};
```

### n8n Webhook Service with Zod Validation
```typescript
// src/services/n8n/webhook.service.ts
import axios from 'axios';
import { z } from 'zod';

// Webhook payload validation
const ChatQueryPayloadSchema = z.object({
  question: z.string().min(1),
  mode: z.enum(['rag', 'llm']),
  sessionId: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
});

const WebhookResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    relevance: z.number().optional()
  })).optional()
});

export type ChatQueryPayload = z.infer<typeof ChatQueryPayloadSchema>;
export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;

export const createWebhookService = (webhookUrl: string) => ({
  async sendQuery(payload: ChatQueryPayload): Promise<WebhookResponse> {
    // Validate outgoing payload
    const validatedPayload = ChatQueryPayloadSchema.parse(payload);

    try {
      const response = await axios.post(webhookUrl, validatedPayload, {
        timeout: 95000,
        headers: { 'Content-Type': 'application/json' }
      });

      // Validate incoming response
      return WebhookResponseSchema.parse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - the query is taking too long. Please try a simpler question.');
        }
        if (error.response?.status === 524) {
          throw new Error('Server timeout - the AI processing is taking too long. Please try again.');
        }
      }
      throw error;
    }
  }
});
```

### React Query Hook with Service Layer
```typescript
// src/hooks/useFiles.ts
// Source: https://tanstack.com/query/latest/docs/framework/react/guides/queries
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesService } from '@/services/files';

export const useFiles = (params?: { search?: string }) => {
  return useQuery({
    queryKey: ['files', params],
    queryFn: () => filesService.getFiles(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDownloadFile = () => {
  return useMutation({
    mutationFn: (fileId: string) => filesService.downloadFile(fileId),
    onSuccess: (blob, fileId) => {
      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileId; // Use actual filename from files query
      a.click();
      URL.revokeObjectURL(url);
    }
  });
};
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

What's changed recently:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Directus SDK v9 | Directus SDK v15+ composable client | 2023 | Composable pattern more flexible, tree-shakeable |
| REST only | REST + GraphQL + Realtime | 2023 | Can choose query language per need |
| Manual token storage | authentication('cookie') mode | 2024 | Automatic httpOnly cookies, better security |
| SWR dominant | React Query v5 | 2023-2024 | React Query has better TypeScript, more features |
| axios-retry patterns | React Query built-in retry | 2023 | Simpler config, better UX during retries |

**New tools/patterns to consider:**
- **React Query v5:** Simplified API, better TypeScript inference, improved devtools
- **Zod for runtime validation:** Industry standard for TypeScript runtime checks, better DX than io-ts
- **Directus Realtime:** WebSocket subscriptions for live updates (overkill for v1, consider for v2)
- **tRPC:** If building custom backend alongside Directus, enables end-to-end type safety (not applicable for Directus/n8n integration)

**Deprecated/outdated:**
- **axios-retry as separate library:** React Query handles this better at query level
- **Manual localStorage auth sync:** Use authentication('cookie') mode instead
- **Directus SDK v9 syntax:** v15+ composable pattern is current standard
- **fetch without retry:** Always use React Query or axios with retry config
</sota_updates>

<open_questions>
## Open Questions

Things that couldn't be fully resolved:

1. **n8n Cloud vs Self-Hosted Timeout Limits**
   - What we know: n8n Cloud has 100s webhook timeout, self-hosted may differ
   - What's unclear: Exact timeout for self-hosted in Docker localhost
   - Recommendation: Assume 100s limit, test actual timeout during implementation, implement queue pattern if needed

2. **Directus Files Download Authentication**
   - What we know: Assets endpoint exists at /assets/{id}, may require auth token
   - What's unclear: Whether localhost Docker setup requires auth for asset downloads
   - Recommendation: Test both public and authenticated asset access during implementation

3. **Optimal React Query Cache Times**
   - What we know: Default is 0ms staleTime (always stale), 5min common for semi-static data
   - What's unclear: Ideal staleTime for file list (may change when users upload)
   - Recommendation: Start with 5min staleTime, add manual invalidation after upload, tune based on usage

4. **Mock Data Toggle UX**
   - What we know: Service layer enables mock/real toggle via config
   - What's unclear: Should toggle be runtime (settings panel) or build-time (env var)?
   - Recommendation: Start with build-time env var (simpler), add runtime toggle if needed for demos
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Directus SDK Documentation](https://directus.io/docs/guides/connect/sdk) - Composable client pattern, authentication setup
- [Directus Files API](https://directus.io/docs/api/files) - Query parameters, file metadata structure
- [Directus React Authentication Tutorial](https://directus.io/docs/tutorials/getting-started/using-authentication-in-react) - Session management patterns
- [n8n Webhook Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) - Request/response structure, timeout limits
- [React Query v5 Documentation](https://tanstack.com/query/latest/docs/framework/react/guides/queries) - Retry patterns, error handling
- [Zod Documentation](https://zod.dev/) - Runtime validation patterns

### Secondary (MEDIUM confidence)
- [React Service Layer Pattern](https://dev.to/chema/services-layer-approach-in-reactjs-1eo2) - Dependency injection for mock/real toggle
- [React Query Error Handling Guide](https://tillitsdone.com/blogs/react-query-error-handling-guide/) - Retry strategies, exponential backoff
- [Directus CORS Docker Setup](https://www.restack.io/docs/directus-knowledge-directus-docker-cors-setup) - Environment variable configuration
- [Webhook Timeout Patterns](https://www.svix.com/resources/glossary/webhook-timeout/) - Queue-based processing recommendations

### Tertiary (LOW confidence - validated during research)
- [TypeScript API Client Type Safety](https://medium.com/@ignatovich.dm/creating-a-type-safe-api-client-with-typescript-and-react-ce1b82bf8b9b) - General patterns, verified against official docs
- [GitHub CORS Issues](https://github.com/directus/directus/issues/19242) - Community-reported Docker CORS config, validated
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Directus SDK v15+ with React integration
- Ecosystem: React Query, Zod, axios for n8n webhooks
- Patterns: Service layer with DI, composable client, runtime validation
- Pitfalls: CORS config, token management, webhook timeouts, runtime validation

**Confidence breakdown:**
- Standard stack: HIGH - Official Directus SDK, React Query industry standard, verified in docs
- Architecture: HIGH - Patterns from official tutorials and established React community practices
- Pitfalls: HIGH - Documented in official docs and verified community issues
- Code examples: HIGH - From official Directus tutorials and React Query documentation

**Research date:** 2026-01-15
**Valid until:** 2026-02-15 (30 days - Directus/React Query ecosystems stable)
</metadata>

---

*Phase: 07-api-integration-layer*
*Research completed: 2026-01-15*
*Ready for planning: yes*
