import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { api, TOKEN_KEY } from './client';

export const fetchFavorites = () =>
  api.get('/users/favorites').then((r) => r.data);

export const addFavoriteApi = (postId) =>
  api.post(`/users/favorites/${postId}`).then((r) => r.data);

export const removeFavoriteApi = (postId) =>
  api.delete(`/users/favorites/${postId}`).then((r) => r.data);

export const fetchUserPublic = (id) =>
  api.get(`/users/public/${id}`).then((r) => r.data);

/**
 * Axios + multipart FormData często daje „Network Error” na React Native.
 * fetch ustawia prawidłowy boundary dla multipart automatycznie.
 */
export async function uploadAvatarApi(formData) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const base = API_URL.replace(/\/+$/, '');
  const url = `${base}/users/me/avatar`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
      signal: ctrl.signal,
    });

    const text = await res.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text.slice(0, 200) };
      }
    }

    if (!res.ok) {
      const err = new Error(data.message || `HTTP ${res.status}`);
      err.response = { data };
      throw err;
    }

    return data;
  } catch (e) {
    if (e?.name === 'AbortError') {
      const err = new Error('Timeout — serwer nie odpowiedział w czasie.');
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
