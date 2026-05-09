import { api } from './client';

export const fetchConversations = () =>
  api.get('/messages/conversations').then((r) => r.data);

export const fetchMessages = (postId, userId) =>
  api.get(`/messages/${postId}/${userId}`).then((r) => r.data);

export const sendMessageApi = ({ receiverId, postId, content }) =>
  api.post('/messages', { receiverId, postId, content }).then((r) => r.data);
