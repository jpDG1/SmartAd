import { api } from './client';

export const fetchPosts = (params = {}) =>
  api.get('/posts', { params }).then((r) => r.data);

export const fetchPostById = (id) =>
  api.get(`/posts/${id}`).then((r) => r.data);

export const fetchMyPosts = () =>
  api.get('/posts/my').then((r) => r.data);

export const deletePostApi = (id) =>
  api.delete(`/posts/${id}`).then((r) => r.data);

export const createPostApi = (formData) =>
  api
    .post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const updatePostApi = (id, formData) =>
  api
    .put(`/posts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const fetchComments = (postId) =>
  api.get(`/posts/${postId}/comments`).then((r) => r.data);

export const addCommentApi = (postId, text) =>
  api.post(`/posts/${postId}/comments`, { text }).then((r) => r.data);

export const buyNowStubApi = (postId) =>
  api.post(`/posts/${postId}/buy-now-stub`).then((r) => r.data);
