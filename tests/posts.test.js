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
      expect(res.body.message).toBe('Ogłoszenie usunięte');
    });
  });

  describe('POST /api/posts/:id/buy-now-stub', () => {
    let sellerToken;
    let buyerToken;
    let listingId;
    const id = `${Date.now()}`;
    const seller = {
      login: `sell_${id}`,
      email: `sell_${id}@test.com`,
      password: 'secret123',
    };
    const buyer = {
      login: `buy_${id}`,
      email: `buy_${id}@test.com`,
      password: 'secret123',
    };

    beforeAll(async () => {
      await request(app).post('/api/auth/register').send(seller);
      sellerToken = (
        await request(app).post('/api/auth/login').send({ identifier: seller.email, password: seller.password })
      ).body.token;

      await request(app).post('/api/auth/register').send(buyer);
      buyerToken = (
        await request(app).post('/api/auth/login').send({ identifier: buyer.email, password: buyer.password })
      ).body.token;

      const cre = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('title', 'Item to buy')
        .field('description', 'Nice item')
        .field('price', 99)
        .field('condition', 'used')
        .field('category', 'other')
        .field('location', 'Kraków');

      listingId = cre.body._id;
    });

    it('should forbid seller buying own listing', async () => {
      const res = await request(app)
        .post(`/api/posts/${listingId}/buy-now-stub`)
        .set('Authorization', `Bearer ${sellerToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should mark sold and accept buyer purchase', async () => {
      const res = await request(app)
        .post(`/api/posts/${listingId}/buy-now-stub`)
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.post.sold).toBe(true);
      expect(res.body.seller.login).toBe(seller.login);
    });

    it('should reject second purchase', async () => {
      const res = await request(app)
        .post(`/api/posts/${listingId}/buy-now-stub`)
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(res.statusCode).toBe(400);
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
