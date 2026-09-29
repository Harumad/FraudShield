const DEFAULT_API_BASE = '';
const FALLBACK_API_BASES = ['http://127.0.0.1:8000', 'http://localhost:8000'];

export const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  return DEFAULT_API_BASE;
};

export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  if (base) return `${base}${normalizedPath}`;

  return normalizedPath;
};

export const getFallbackApiUrls = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // The backend serves routes without the /api prefix (Vercel strips it in
  // production, and the dev proxy does the same), so match that shape here.
  const backendPath = normalizedPath.replace(/^\/api/, '');
  return FALLBACK_API_BASES.map((base) => `${base}${backendPath}`);
};
