const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Posts API', () => {
  let authToken;
  let createdPostId;

  const testUser = {
    login: 'postuser',
    email: 'postuser@smartad.com',
    password: 'secret123',
  };

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/login').send({ identifier: testUser.email, password: testUser.password });
    authToken = res.body.token;
  });

  describe('GET /api/posts', () => {
    it('should return list of posts', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('posts');
      expect(Array.isArray(res.body.posts)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app).get('/api/posts?page=1&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('pages');
    });
  });

  describe('POST /api/posts', () => {
    it('should create a post when authenticated', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Test Laptop')
        .field('description', 'Good condition laptop for sale')
        .field('price', 1500)
        .field('condition', 'used')
        .field('category', 'electronics')
        .field('location', 'Tarnów');
      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Test Laptop');
      createdPostId = res.body._id;
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).post('/api/posts').send({ title: 'Test' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a post by id', async () => {
      const res = await request(app).get(`/api/posts/${createdPostId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(createdPostId);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app).get('/api/posts/000000000000000000000000');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update own post', async () => {
      const res = await request(app)
        .put(`/api/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Updated Laptop');
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Laptop');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete own post', async () => {
      const res = await request(app).delete(`/api/posts/${createdPostId}`).set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Post deleted');
    });
  });

  describe('GET /api/health', () => {
    it('should return ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
