// lib/api.ts - API utility for base path routing
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const basePath = BASE_PATH;

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_PATH}/api/${cleanPath}`;
}

export async function apiFetch(path: string, options?: RequestInit) {
  return fetch(apiUrl(path), options);
}

// Prefix a local asset URL with basePath.  External URLs (http/https/protocol-relative)
// pass through unchanged.  Useful for dynamic paths like font URLs from the API.
export function assetUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('//')) return url;
  return `${BASE_PATH}${url.startsWith('/') ? '' : '/'}${url}`;
}
