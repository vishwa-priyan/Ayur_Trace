/**
 * API and Asset Configuration Utility for AyurTrace Frontend.
 * 
 * Automatically resolves endpoint and asset URLs:
 * - When VITE_API_BASE_URL is set (e.g. 'https://api.yourdomain.com' or 'http://SERVER_IP:5000'),
 *   requests are prefixed with that base URL.
 * - When VITE_API_BASE_URL is empty or omitted, requests use relative paths ('/api/...'),
 *   which is ideal for production behind Nginx/reverse-proxies or unified server hosts.
 */

// Base URL configured from environment (strips any trailing slash)
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

/**
 * Returns the full API URL for a given path.
 * @param {string} path - e.g. '/api/batches' or 'api/batches'
 * @returns {string} full API URL or relative path
 */
export function getApiUrl(path) {
  if (!path) return API_BASE_URL || '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Resolves static asset and uploaded media URLs (e.g. images, certificates).
 * If the path is already an absolute URL (http/https/data:), it returns it directly.
 * Otherwise, it prepends API_BASE_URL if configured.
 * @param {string} path - e.g. '/uploads/photo.jpg'
 * @returns {string} resolved asset URL
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Convenience wrapper around window.fetch with automatic base URL prefixing.
 * @param {string} path - Endpoint path (e.g. '/api/auth/me')
 * @param {RequestInit} [options] - Standard Fetch API options
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const url = getApiUrl(path);
  return fetch(url, options);
}
