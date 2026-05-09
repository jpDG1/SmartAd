import { Platform } from 'react-native';

const fallback = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
});

export const API_URL = process.env.EXPO_PUBLIC_API_URL || fallback;

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const resolveImageUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (/^(file|content|blob|ph|assets-library):\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/${path}`;
};
