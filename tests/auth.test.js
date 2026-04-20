const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Auth API', () => {
  const testUser = {
    login: 'testuser',
    email: 'testuser@smartad.com',
    password: 'secret123',
    phone: '+48123456789',
  };

  let authToken;

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 400 when email already exists', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'nopassword@smartad.com' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with email successfully', async () => {
      const res = await request(app).post('/api/auth/login').send({ identifier: testUser.email, password: testUser.password });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
    });

    it('should return 401 with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({ identifier: testUser.email, password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
    });

    it('should return 400 when fields are missing', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({ identifier: testUser.email, password: testUser.password });
      authToken = loginRes.body.token;
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe(testUser.email);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalidtoken123');
      expect(res.statusCode).toBe(401);
    });
  });
});
