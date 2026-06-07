export function getApiUrl() {
  if (typeof window !== 'undefined') {
    // Browser side: use NEXT_PUBLIC_API_URL if set, otherwise use relative path to trigger next.config.ts rewrites
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  // Server side: hit the VPS directly (or use localhost for local dev if NEXT_PUBLIC_API_URL is set to localhost)
  return process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://172.252.13.139:8085';
}
