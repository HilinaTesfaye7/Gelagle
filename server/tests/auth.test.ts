import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';

describe('Authentication & Session Management', () => {
  const app = createApp();

  before(() => {
    seedDatabase();
  });

  test('POST /api/auth/login with valid credentials should return token and user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'pm@commandcenter.io',
        password: 'Password123!'
      });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, 'pm@commandcenter.io');
    assert.strictEqual(res.body.user.password_hash, undefined, 'Password hash must NOT be exposed');
    assert.strictEqual(res.body.user.password_salt, undefined, 'Password salt must NOT be exposed');
    assert.ok(Array.isArray(res.body.memberships));
  });

  test('POST /api/auth/login with invalid password should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'pm@commandcenter.io',
        password: 'WrongPassword!'
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, 'Authentication Failed');
  });

  test('GET /api/auth/me with Bearer token should return authenticated user profile', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'pm@commandcenter.io',
        password: 'Password123!'
      });

    const token = loginRes.body.token;

    // 2. Call /me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.user.email, 'pm@commandcenter.io');
    assert.ok(Array.isArray(meRes.body.memberships));
    assert.ok(Array.isArray(meRes.body.grantedPermissions));
  });

  test('GET /api/auth/me without token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
  });

  test('POST /api/auth/logout should invalidate the session token', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'backend@commandcenter.io',
        password: 'Password123!'
      });

    const token = loginRes.body.token;

    // 2. Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(logoutRes.status, 200);

    // 3. Try to access /me with logged out token
    const afterLogoutRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(afterLogoutRes.status, 401);
  });
});
