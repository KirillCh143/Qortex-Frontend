/**
 * Read a VITE_* environment variable with runtime override support.
 *
 * Priority:
 *  1. window.__RUNTIME_CONFIG__[key]  (injected by Docker entrypoint)
 *  2. import.meta.env[key]            (baked in at build time by Vite)
 *  3. fallback (caller-provided default or empty string)
 */

interface RuntimeConfig {
  [key: string]: string | undefined
}

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig
  }
}

export function getEnv(key: string, fallback = ''): string {
  const runtime = window.__RUNTIME_CONFIG__ ?? {}
  return runtime[key] ?? (import.meta.env[key] as string | undefined) ?? fallback
}
