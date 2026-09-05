import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';

describe('Project Access Isolation & Cross-Project Leakage Security', () => {
  const app = createApp();
  let backendDevToken: string;

  before(async () => {
    seedDatabase();

    // Login as Marcus Vance (Backend Dev) - member of Nexus and CyberShield, NOT member of Apollo
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'backend@commandcenter.io',
        password: 'Password123!'
      });

    backendDevToken = loginRes.body.token;
  });

  test('Authorized user CAN access projects they belong to (Nexus)', async () => {
    const res = await request(app)
      .get('/api/projects/proj-nexus-01')
      .set('Authorization', `Bearer ${backendDevToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.project.name, 'Nexus Platform Core');
  });

  test('CRITICAL SECURITY: User belonging to Project A must NOT access Project B unless authorized (Apollo)', async () => {
    // Marcus Vance is NOT a member of proj-apollo-03
    const res = await request(app)
      .get('/api/projects/proj-apollo-03')
      .set('Authorization', `Bearer ${backendDevToken}`);

    assert.strictEqual(
      res.status,
      403,
      'Server MUST return 403 Forbidden when a user accesses a project they are not a member of'
    );
    assert.ok(res.body.message.includes('not an authorized member'));
  });

  test('CRITICAL SECURITY: Unauthorized user must NOT access project members of an unauthorized project', async () => {
    const res = await request(app)
      .get('/api/projects/proj-apollo-03/members')
      .set('Authorization', `Bearer ${backendDevToken}`);

    assert.strictEqual(res.status, 403);
  });

  test('CRITICAL SECURITY: Unauthorized user must NOT access project activities of an unauthorized project', async () => {
    const res = await request(app)
      .get('/api/projects/proj-apollo-03/activities')
      .set('Authorization', `Bearer ${backendDevToken}`);

    assert.strictEqual(res.status, 403);
  });

  test('CRITICAL SECURITY: Unauthorized user must NOT be able to mutate an unauthorized project', async () => {
    const res = await request(app)
      .patch('/api/projects/proj-apollo-03')
      .set('Authorization', `Bearer ${backendDevToken}`)
      .send({
        name: 'Hacked Project Name'
      });

    assert.strictEqual(res.status, 403);
  });
});
