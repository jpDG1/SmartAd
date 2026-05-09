import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from '../api/client';
import { loginApi, registerApi, meApi, updateMeApi } from '../api/auth';
import {
  fetchFavorites,
  addFavoriteApi,
  removeFavoriteApi,
  uploadAvatarApi,
} from '../api/users';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = useCallback(async () => {
    try {
      const list = await fetchFavorites();
      setFavorites(list || []);
    } catch (e) {
      setFavorites([]);
    }
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const me = await meApi();
        setUser(me);
        // Nie blokuj splasha — ulubione w tle (unreachable API nie zawiesza aplikacji)
        loadFavorites();
      } catch (e) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    } catch (e) {
      await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadFavorites]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const signIn = useCallback(
    async (identifier, password) => {
      const res = await loginApi({ identifier, password });
      await AsyncStorage.setItem(TOKEN_KEY, res.token);
      setUser(res.user);
      await loadFavorites();
      return res.user;
    },
    [loadFavorites]
  );

  const signUp = useCallback(
    async (data) => {
      const res = await registerApi(data);
      await AsyncStorage.setItem(TOKEN_KEY, res.token);
      setUser(res.user);
      await loadFavorites();
      return res.user;
    },
    [loadFavorites]
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setFavorites([]);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const updated = await updateMeApi(data);
    setUser(updated);
    return updated;
  }, []);

  const uploadAvatar = useCallback(async (formData) => {
    const updated = await uploadAvatarApi(formData);
    /*
     * 1) Odpowiedź POST jest źródłem prawdy (bez drugiego żądania GET — mniej wyścigów).
     * 2) ?t= bust — React Native/cache HTTP czasem trzyma stary JPEG przy tym samym pathie.
     */
    const avatar = updated?.avatar;
    let nextAvatar = avatar;
    if (typeof avatar === 'string' && avatar.length > 0) {
      const base = avatar.replace(/\?.*/, '');
      nextAvatar = `${base}?t=${Date.now()}`;
    }
    setUser({ ...updated, avatar: nextAvatar });
    return updated;
  }, []);

  const isFavorite = useCallback(
    (postId) => favorites.some((p) => (p?._id || p) === postId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (post) => {
      if (!user) return;
      const id = post?._id || post;
      if (isFavorite(id)) {
        await removeFavoriteApi(id);
        setFavorites((prev) => prev.filter((p) => (p?._id || p) !== id));
      } else {
        await addFavoriteApi(id);
        setFavorites((prev) => [post, ...prev]);
      }
    },
    [user, isFavorite]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      favorites,
      signIn,
      signUp,
      signOut,
      updateProfile,
      uploadAvatar,
      isFavorite,
      toggleFavorite,
      reloadFavorites: loadFavorites,
    }),
    [
      user,
      loading,
      favorites,
      signIn,
      signUp,
      signOut,
      updateProfile,
      uploadAvatar,
      isFavorite,
      toggleFavorite,
      loadFavorites,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
