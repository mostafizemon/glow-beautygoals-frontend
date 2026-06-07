const DEFAULT_API_URL = 'http://172.252.13.139:8085';

function trimTrailingSlash(url: string | undefined) {
  return url?.trim().replace(/\/+$/, '') || '';
}

export function getApiUrl() {
  const publicApiUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL);

  if (typeof window !== 'undefined') {
    // Browser requests should stay same-origin so Vercel can proxy /api/*.
    // This avoids mixed-content failures when the VPS only has HTTP.
    return '';
  }

  // Server side: hit the VPS directly (or use localhost for local dev if NEXT_PUBLIC_API_URL is set to localhost)
  return trimTrailingSlash(process.env.SERVER_API_URL) || publicApiUrl || DEFAULT_API_URL;
}
