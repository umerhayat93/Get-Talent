import axios from 'axios';
import { STORAGE_KEY } from '../store/authStore';

const BASE =
  import.meta.env.VITE_API_URL ||
  'https://get-talent-api.onrender.com/api';

// Uploads URL for legacy filename-based images (fallback)
export const UPLOADS_URL =
  import.meta.env.VITE_UPLOADS_URL ||
  BASE.replace('/api', '') + '/uploads';

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) config.headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    } catch {}
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url    = err.config?.url || '';
    const status = err.response?.status;
    const isPublic =
      url.includes('/auth/login') ||
      url.includes('/auth/admin') ||
      url.includes('/auth/register') ||
      url.includes('/players/feed') ||
      url.includes('/players/by-tournament') ||
      url.includes('/players/') ||
      url.includes('/tournaments') ||
      url.includes('/bids/sessions') ||
      url.includes('/notifications/vapid');

    if (status === 401 && !isPublic) {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Build correct image URL:
// - base64 data URLs returned as-is (new approach, survives redeploy)
// - legacy filenames get full backend path
export const imgUrl = (value) => {
  if (!value) return null;
  if (value.startsWith('data:')) return value;   // base64 data URL
  if (value.startsWith('http')) return value;     // external URL
  return `${UPLOADS_URL}/${value}`;               // legacy filename
};

export const uploadFile = (url, file, fieldName = 'file', extra = {}) => {
  const fd = new FormData();
  fd.append(fieldName, file);
  Object.entries(extra).forEach(([k, v]) => fd.append(k, String(v)));
  return api.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
