import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';

describe('Telegram Identity & Audit Logging', () => {
  const app = createApp();
  let pmToken: string;

  before(async () => {
    seedDatabase();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'pm@commandcenter.io', password: 'Password123!' });
    pmToken = loginRes.body.token;
  });

  test('User can generate Telegram link code', async () => {
    const res = await request(app)
      .post('/api/telegram/generate-code')
      .set('Authorization', `Bearer ${pmToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.code.startsWith('TG-'));
  });

  test('Telegram Bot Webhook responds to /start command', async () => {
    const res = await request(app)
      .post('/api/telegram/webhook')
      .send({
        telegramUserId: '10001', // Seeded for Alex Chen (pm)
        chatId: 'chat_10001',
        text: '/start'
      });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.reply.includes('Welcome back, Alex Chen'));
    assert.strictEqual(res.body.identifiedUser?.username, 'alexchen');
  });

  test('Telegram Bot Webhook responds to /projects command listing assigned projects', async () => {
    const res = await request(app)
      .post('/api/telegram/webhook')
      .send({
        telegramUserId: '10001',
        chatId: 'chat_10001',
        text: '/projects'
      });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.reply.includes('Nexus Platform Core'));
  });

  test('Audit logs record project creation and member mutations', async () => {
    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${pmToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.logs));
    assert.ok(res.body.logs.length > 0);
  });
});
