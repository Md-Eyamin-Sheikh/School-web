const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '') || 
  (import.meta.env.DEV ? '' : 'https://school-backend-rust.vercel.app');

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${configuredBaseUrl}${normalizedPath}`;
}

