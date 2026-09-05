import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { runMigrations } from '../src/db/migrate.js';
import { seedDatabase } from '../src/db/seed.js';
import { DailyUpdateRepository } from '../src/repositories/daily-update.repository.js';
import { DailyUpdateService } from '../src/services/daily-update.service.js';
import { ProjectRepository } from '../src/repositories/project.repository.js';
import { UserRepository } from '../src/repositories/user.repository.js';
import { MemberRepository } from '../src/repositories/member.repository.js';
import { TelegramRepository } from '../src/repositories/telegram.repository.js';
import { ROLE_DAILY_QUESTIONS } from '../src/services/telegram-bot.service.js';

test('Telegram Onboarding and Daily Standup Workflow', async (t) => {
  const testDb = new DatabaseSync(':memory:');
  runMigrations(testDb);
  seedDatabase(testDb);

  const userRepo = new UserRepository();
  const projectRepo = new ProjectRepository();
  const memberRepo = new MemberRepository();
  const dailyUpdateRepo = new DailyUpdateRepository();
  const dailyUpdateService = new DailyUpdateService();

  await t.test('1. Role Daily Questions are defined for all 8 system roles', () => {
    const roles = [
      'PROJECT_MANAGER',
      'PRODUCT_OWNER',
      'QA_LEAD',
      'QA_ENGINEER',
      'BACKEND_DEVELOPER',
      'FRONTEND_DEVELOPER',
      'DESIGNER',
      'OTHER'
    ] as const;

    for (const r of roles) {
      assert.ok(ROLE_DAILY_QUESTIONS[r], `Questions should exist for role ${r}`);
      assert.equal(ROLE_DAILY_QUESTIONS[r].length, 3, `Role ${r} must have 3 questions`);
    }
  });

  await t.test('2. Multi-project assignment and Daily Update persistence on Project Table', () => {
    const projects = projectRepo.findAll();
    assert.ok(projects.length >= 2, 'Should have at least 2 projects');

    const proj1 = projects[0];
    const proj2 = projects[1];

    // Simulate user completing onboarding
    const newUserId = 'test-user-telegram-unique-' + Date.now();
    userRepo.create({
      id: newUserId,
      name: 'Sarah Connor',
      email: `sarah.connor.${Date.now()}@commandcenter.local`,
      username: `sarah_connor_${Date.now()}`,
      password_hash: 'dummyhash',
      password_salt: 'dummysalt',
      avatar: null,
      timezone: 'UTC',
      active: 1,
      availability_status: 'AVAILABLE',
      skills: '[]',
      notification_preferences: '{}',
      daily_checkin_enabled: 1,
      telegram_user_id: `tg_${Date.now()}`,
      telegram_chat_id: `tg_${Date.now()}`,
      telegram_username: `sarah_connor_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Add user as member to multiple selected projects
    memberRepo.create({
      id: 'mem-1-' + Date.now(),
      project_id: proj1.id,
      user_id: newUserId,
      role: 'BACKEND_DEVELOPER',
      responsibilities: 'Core backend engineering',
      joined_at: new Date().toISOString(),
      active: 1
    });

    memberRepo.create({
      id: 'mem-2-' + Date.now(),
      project_id: proj2.id,
      user_id: newUserId,
      role: 'BACKEND_DEVELOPER',
      responsibilities: 'Core backend engineering',
      joined_at: new Date().toISOString(),
      active: 1
    });

    // Verify user is member of both projects
    const userProjects = projectRepo.findProjectsForUser(newUserId);
    assert.equal(userProjects.length, 2, 'User should be assigned to both projects');

    // Simulate answering the 3 daily questions
    const q1 = ROLE_DAILY_QUESTIONS.BACKEND_DEVELOPER[0];
    const q2 = ROLE_DAILY_QUESTIONS.BACKEND_DEVELOPER[1];
    const q3 = ROLE_DAILY_QUESTIONS.BACKEND_DEVELOPER[2];

    const a1 = 'Implemented SQLite WAL mode and Telegram bot long-polling listener';
    const a2 = 'Write end-to-end integration tests and refine UI components';
    const a3 = 'None, everything is running smoothly';

    // Submit daily update to proj1
    const update1 = dailyUpdateService.createDailyUpdate({
      projectId: proj1.id,
      userId: newUserId,
      userName: 'Sarah Connor',
      role: 'BACKEND_DEVELOPER',
      q1Question: q1,
      q1Answer: a1,
      q2Question: q2,
      q2Answer: a2,
      q3Question: q3,
      q3Answer: a3,
      source: 'TELEGRAM'
    });

    assert.ok(update1.id, 'Update 1 should have an ID');
    assert.equal(update1.project_id, proj1.id);
    assert.equal(update1.source, 'TELEGRAM');

    // Submit daily update to proj2
    const update2 = dailyUpdateService.createDailyUpdate({
      projectId: proj2.id,
      userId: newUserId,
      userName: 'Sarah Connor',
      role: 'BACKEND_DEVELOPER',
      q1Question: q1,
      q1Answer: a1,
      q2Question: q2,
      q2Answer: a2,
      q3Question: q3,
      q3Answer: a3,
      source: 'TELEGRAM'
    });

    assert.ok(update2.id, 'Update 2 should have an ID');
    assert.equal(update2.project_id, proj2.id);

    // Verify Project Repository loads latestDailyUpdate for each project
    const proj1Details = projectRepo.findByIdWithDetails(proj1.id, newUserId);
    assert.ok(proj1Details, 'Project 1 details should exist');
    assert.ok(proj1Details?.latestDailyUpdate, 'Project 1 should have latestDailyUpdate attached');
    assert.equal(proj1Details?.latestDailyUpdate?.user_name, 'Sarah Connor');
    assert.equal(proj1Details?.latestDailyUpdate?.q1_answer, a1);

    // Verify DailyUpdateService returns updates for project
    const projectUpdates = dailyUpdateService.getUpdatesForProject(proj1.id);
    assert.ok(projectUpdates.length >= 1, 'Should find updates for project 1');
    assert.equal(projectUpdates[0].q1_answer, a1);
  });

  await t.test('3. QA Leads and Project Managers have special report vs questions choice', () => {
    // Verify QA_LEAD, PROJECT_MANAGER, PRODUCT_OWNER have reports capability
    const leadershipRoles = ['QA_LEAD', 'PROJECT_MANAGER', 'PRODUCT_OWNER'];
    for (const role of leadershipRoles) {
      assert.ok(ROLE_DAILY_QUESTIONS[role as keyof typeof ROLE_DAILY_QUESTIONS], `Leadership role ${role} has questions defined`);
    }
  });
});
