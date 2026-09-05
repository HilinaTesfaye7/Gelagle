import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';
import { Role } from '../src/rbac/roles.js';

describe('Project Membership & Multi-Project Role Differentiation', () => {
  const app = createApp();
  let pmToken: string;
  let devToken: string;

  before(async () => {
    seedDatabase();

    // PM Login
    const pmLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'pm@commandcenter.io', password: 'Password123!' });
    pmToken = pmLogin.body.token;

    // Backend Dev Login
    const devLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'backend@commandcenter.io', password: 'Password123!' });
    devToken = devLogin.body.token;
  });

  test('User has different roles in different projects', async () => {
    // Check Dave Miller memberships
    const daveLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'qalead@commandcenter.io', password: 'Password123!' });

    const memberships = daveLogin.body.memberships;
    const nexusMem = memberships.find((m: any) => m.project_id === 'proj-nexus-01');
    const cyberMem = memberships.find((m: any) => m.project_id === 'proj-cybershield-02');

    assert.ok(nexusMem, 'Dave must be in Nexus');
    assert.strictEqual(nexusMem.role, Role.QA_LEAD, 'Dave is QA_LEAD in Nexus');

    assert.ok(cyberMem, 'Dave must be in CyberShield');
    assert.strictEqual(cyberMem.role, Role.QA_ENGINEER, 'Dave is QA_ENGINEER in CyberShield');
  });

  test('PM can invite a new member to a project', async () => {
    // Invite Zoe Taylor (usr-other-08) to Nexus as OTHER
    const res = await request(app)
      .post('/api/projects/proj-nexus-01/members')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        userId: 'usr-other-08',
        role: Role.OTHER,
        responsibilities: 'Infrastructure & SRE Monitoring'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.member.user_id, 'usr-other-08');
    assert.strictEqual(res.body.member.role, Role.OTHER);
  });

  test('Developer WITHOUT MEMBER_INVITE permission CANNOT add members', async () => {
    // Marcus Vance is BACKEND_DEVELOPER in Nexus, which does NOT have MEMBER_INVITE
    const res = await request(app)
      .post('/api/projects/proj-nexus-01/members')
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        userId: 'usr-other-08',
        role: Role.OTHER
      });

    assert.strictEqual(res.status, 403, 'Must return 403 when lacking MEMBER_INVITE permission');
  });

  test('PM can update a member role within a project', async () => {
    const res = await request(app)
      .patch('/api/projects/proj-nexus-01/members/usr-other-08')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        role: Role.BACKEND_DEVELOPER,
        responsibilities: 'Platform Automation'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.member.role, Role.BACKEND_DEVELOPER);
  });

  test('PM can remove a member from a project', async () => {
    const res = await request(app)
      .delete('/api/projects/proj-nexus-01/members/usr-other-08')
      .set('Authorization', `Bearer ${pmToken}`);

    assert.strictEqual(res.status, 200);
  });
});
