const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
require('dotenv').config();

jest.setTimeout(30000);

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  const db = mongoose.connection.db;
  if (db) {
    await db.dropCollection('users').catch(() => {});
    await db.dropCollection('posts').catch(() => {});
    await db.dropCollection('messages').catch(() => {});
    await db.dropCollection('comments').catch(() => {});
  }
  await mongoose.disconnect();
});
