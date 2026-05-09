import { api } from './client';

export const registerApi = (data) => api.post('/auth/register', data).then((r) => r.data);
export const loginApi = (data) => api.post('/auth/login', data).then((r) => r.data);
export const meApi = () => api.get('/auth/me').then((r) => r.data);
export const updateMeApi = (data) => api.put('/auth/me', data).then((r) => r.data);
