import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export const TOKEN_KEY = 'smartad.token';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const extractError = (err) => {
  const serverMsg = err?.response?.data?.message;
  if (typeof serverMsg === 'string') {
    if (/enoent|no such file or directory/i.test(serverMsg)) {
      return 'Błąd zapisu na serwerze (folder uploads). Zrestartuj backend po aktualizacji — katalog tworzy się automatycznie.';
    }
    return serverMsg;
  }
  if (typeof err?.message === 'string') {
    const m = err.message;
    if (/enoent|no such file or directory/i.test(m)) {
      return 'Błąd zapisu na serwerze (folder uploads). Zrestartuj backend po aktualizacji — katalog tworzy się automatycznie.';
    }
    if (
      m === 'Network Error' ||
      /network request failed/i.test(m) ||
      m.includes('Failed to fetch')
    ) {
      return 'Brak połączenia z serwerem — sprawdź EXPO_PUBLIC_API_URL i czy backend działa (np. http://TWÓJ-IP-LAN:5000/api dla telefonu).';
    }
    return m;
  }
  return 'Wystąpił błąd. Spróbuj ponownie.';
};
