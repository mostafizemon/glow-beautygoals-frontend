const DEFAULT_API_URL = 'http://172.252.13.139:8085';

function trimTrailingSlash(url: string | undefined) {
  return url?.trim().replace(/\/+$/, '') || '';
}

function isLocalHttpUrl(url: string) {
  return /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/.test(url);
}

export function getApiUrl() {
  const publicApiUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL);

  if (typeof window !== 'undefined') {
    if (!publicApiUrl) {
      return '';
    }

    // HTTPS pages cannot call a plain HTTP VPS directly in the browser.
    // Use the same-origin Next rewrite instead: /api/* -> backend /api/*.
    if (
      window.location.protocol === 'https:' &&
      publicApiUrl.startsWith('http://') &&
      !isLocalHttpUrl(publicApiUrl)
    ) {
      return '';
    }

    return publicApiUrl;
  }

  // Server side: hit the VPS directly (or use localhost for local dev if NEXT_PUBLIC_API_URL is set to localhost)
  return trimTrailingSlash(process.env.SERVER_API_URL) || publicApiUrl || DEFAULT_API_URL;
}
