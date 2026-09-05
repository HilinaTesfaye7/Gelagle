import { getDatabase } from './database.js';
import { runMigrations } from './migrate.js';
import { hashPassword } from '../utils/crypto.utils.js';
import { Role } from '../rbac/roles.js';

export function seedDatabase(): void {
  console.log('[SEED] Ensuring schema migrations are up to date...');
  const db = getDatabase();
  runMigrations(db);

  console.log('[SEED] Seeding enterprise demo data...');

  const now = new Date().toISOString();
  const commonPassword = hashPassword('Password123!');

  // Seed Users
  const users = [
    {
      id: 'usr-pm-01',
      name: 'Alex Chen',
      email: 'pm@commandcenter.io',
      username: 'alexchen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timezone: 'America/New_York',
      active: 1,
      availability_status: 'AVAILABLE',
      skills: JSON.stringify(['Agile', 'Scrum', 'Jira', 'Roadmapping', 'Risk Management']),
      notification_preferences: JSON.stringify({ email: true, telegram: true, mentions: true }),
      daily_checkin_enabled: 1,
      telegram_user_id: '10001',
      telegram_chat_id: 'chat_10001',
      telegram_username: 'alex_chen_pm'
    },
    {
      id: 'usr-po-02',
      name: 'Sarah Connor',
      email: 'po@commandcenter.io',
      username: 'sarahc',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      timezone: 'America/Los_Angeles',
      active: 1,
      availability_status: 'AVAILABLE',
      skills: JSON.stringify(['Product Strategy', 'Customer Research', 'User Stories', 'Analytics']),
      notification_preferences: JSON.stringify({ email: true, telegram: false, mentions: true }),
      daily_checkin_enabled: 1,
      telegram_user_id: null,
      telegram_chat_id: null,
      telegram_username: null
    },
    {
      id: 'usr-qalead-03',
      name: 'Dave Miller',
      email: 'qalead@commandcenter.io',
      username: 'davem',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      timezone: 'Europe/London',
      active: 1,
      availability_status: 'AVAILABLE',
      skills: JSON.stringify(['Test Strategy', 'Playwright', 'Jest', 'Automation', 'Performance']),
      notification_preferences: JSON.stringify({ email: true, telegram: true, mentions: true }),
      daily_checkin_enabled: 1,
      telegram_user_id: '10003',
      telegram_chat_id: 'chat_10003',
      telegram_username: 'dave_qalead'
    },
    {
      id: 'usr-qaeng-04',
      name: 'Emma Watson',
      email: 'qaeng@commandcenter.io',
      username: 'emmaw',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      timezone: 'Europe/London',
      active: 1,
      availability_status: 'BUSY',
      skills: JSON.stringify(['Manual Testing', 'Cypress', 'API Testing', 'Bug Triage']),
      notification_preferences: JSON.stringify({ email: true, telegram: false, mentions: true }),
      daily_checkin_enabled: 1,
      telegram_user_id: null,
      telegram_chat_id: null,
      telegram_username: null
    },
    {
      id: 'usr-backend-05',
      name: 'Marcus Vance',
      email: 'backend@commandcenter.io',
      username: 'marcusv',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      timezone: 'America/Chicago',
      active: 1,
      availability_status: 'AVAILABLE',
      skills: JSON.stringify(['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Microservices', 'GraphQL']),
      notification_preferences: JSON.stringify({ email: true, telegram: true, mentions: true }),
      daily_checkin_enabled: 1,
      telegram_user_id: '10005',
      telegram_chat_id: 'chat_10005',
      telegram_username: 'marcus_backend'
    },
    {
      id: 'usr-frontend-06',
      name: 'Sophia Lin',
      email: 'frontend@commandcenter.io',
      username: 'sophial',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      timezone: 'America/San_Francisco',
      active: 1,
      availability_status: 'AVAILABLE',
      skills: JSON.stringify(['React', 'TypeScript', 'Next.js', 'CSS Architecture', 'Web Accessibility']),
      notification_preferences: JSON.stringify({ email: true, telegram: false, mentions: true }),
      daily_checkin_enabled: 1,
      telegram_user_id: null,
      telegram_chat_id: null,
      telegram_username: null
    },
    {
      id: 'usr-designer-07',
      name: 'Liam Davis',
      email: 'designer@commandcenter.io',
      username: 'liamd',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      timezone: 'Europe/Berlin',
      active: 1,
      availability_status: 'AWAY',
      skills: JSON.stringify(['UI/UX Design', 'Figma', 'Design Systems', 'Prototyping', 'User Research']),
      notification_preferences: JSON.stringify({ email: true, telegram: false, mentions: false }),
      daily_checkin_enabled: 1,
      telegram_user_id: null,
      telegram_chat_id: null,
      telegram_username: null
    },
    {
      id: 'usr-other-08',
      name: 'Zoe Taylor',
      email: 'other@commandcenter.io',
      username: 'zoet',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      timezone: 'UTC',
      active: 1,
      availability_status: 'AVAILABLE',
      skills: JSON.stringify(['DevOps', 'Kubernetes', 'CI/CD', 'Terraform', 'Observability']),
      notification_preferences: JSON.stringify({ email: true, telegram: true, mentions: true }),
      daily_checkin_enabled: 1,
      telegram_user_id: null,
      telegram_chat_id: null,
      telegram_username: null
    },
    {
      id: 'usr-hilina-09',
      name: 'Hilina Tesfaye',
      email: 'helu777@commandcenter.local',
      username: 'helu777',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timezone: 'UTC',
      active: 1,
      availability_status: 'AVAILABLE',
      skills: JSON.stringify(['QA Automation', 'Testing', 'Telegram Bot Integration', 'Delivery Governance']),
      notification_preferences: JSON.stringify({ email: true, telegram: true, mentions: true }),
      daily_checkin_enabled: 1,
      telegram_user_id: '347835367',
      telegram_chat_id: '347835367',
      telegram_username: 'Helu777'
    }
  ];

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, name, email, username, password_hash, password_salt,
      avatar, timezone, active, availability_status, skills,
      notification_preferences, daily_checkin_enabled,
      telegram_user_id, telegram_chat_id, telegram_username,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?
    )
  `);

  for (const u of users) {
    insertUser.run(
      u.id,
      u.name,
      u.email,
      u.username,
      commonPassword.hash,
      commonPassword.salt,
      u.avatar,
      u.timezone,
      u.active,
      u.availability_status,
      u.skills,
      u.notification_preferences,
      u.daily_checkin_enabled,
      u.telegram_user_id,
      u.telegram_chat_id,
      u.telegram_username,
      now,
      now
    );
  }

  // Seed Projects
  const projects = [
    {
      id: 'proj-nexus-01',
      name: 'Nexus Platform Core',
      description: 'Next-generation microservices backbone, high-throughput delivery APIs, and real-time streaming pipeline.',
      status: 'ACTIVE',
      start_date: '2026-08-01',
      target_date: '2026-11-30',
      progress: 68,
      project_manager_id: 'usr-pm-01',
      product_owner_id: 'usr-po-02'
    },
    {
      id: 'proj-cybershield-02',
      name: 'CyberShield Security Gateway',
      description: 'Zero-trust authorization layer, mTLS inter-service proxies, and compliance audit vault.',
      status: 'ACTIVE',
      start_date: '2026-08-15',
      target_date: '2026-12-15',
      progress: 42,
      project_manager_id: 'usr-pm-01',
      product_owner_id: 'usr-po-02'
    },
    {
      id: 'proj-apollo-03',
      name: 'Apollo Mobile Experience',
      description: 'Unified cross-platform executive dashboard and real-time notifications for delivery monitoring.',
      status: 'PLANNING',
      start_date: '2026-09-15',
      target_date: '2027-02-28',
      progress: 15,
      project_manager_id: 'usr-pm-01',
      product_owner_id: 'usr-po-02'
    }
  ];

  const insertProject = db.prepare(`
    INSERT OR REPLACE INTO projects (
      id, name, description, status, start_date, target_date,
      progress, project_manager_id, product_owner_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of projects) {
    insertProject.run(
      p.id,
      p.name,
      p.description,
      p.status,
      p.start_date,
      p.target_date,
      p.progress,
      p.project_manager_id,
      p.product_owner_id,
      now,
      now
    );
  }

  // Seed Project Memberships (Demonstrates multi-project roles and strict project isolation)
  const memberships = [
    // Nexus Platform Core
    { id: 'mem-nx-1', project_id: 'proj-nexus-01', user_id: 'usr-pm-01', role: Role.PROJECT_MANAGER, responsibilities: 'Project Lead & Delivery Command' },
    { id: 'mem-nx-2', project_id: 'proj-nexus-01', user_id: 'usr-po-02', role: Role.PRODUCT_OWNER, responsibilities: 'Product Strategy & Requirements' },
    { id: 'mem-nx-3', project_id: 'proj-nexus-01', user_id: 'usr-qalead-03', role: Role.QA_LEAD, responsibilities: 'Test Architecture & Release Sign-off' },
    { id: 'mem-nx-4', project_id: 'proj-nexus-01', user_id: 'usr-qaeng-04', role: Role.QA_ENGINEER, responsibilities: 'Automated E2E & Regression Suites' },
    { id: 'mem-nx-5', project_id: 'proj-nexus-01', user_id: 'usr-backend-05', role: Role.BACKEND_DEVELOPER, responsibilities: 'Core API & Database Migrations' },
    { id: 'mem-nx-6', project_id: 'proj-nexus-01', user_id: 'usr-frontend-06', role: Role.FRONTEND_DEVELOPER, responsibilities: 'Command Center UI & State Management' },
    { id: 'mem-nx-7', project_id: 'proj-nexus-01', user_id: 'usr-designer-07', role: Role.DESIGNER, responsibilities: 'Design System & Component Specs' },
    { id: 'mem-nx-8', project_id: 'proj-nexus-01', user_id: 'usr-hilina-09', role: Role.QA_ENGINEER, responsibilities: 'QA Automation & Telegram Standups' },

    // CyberShield (Notice: Dave Miller is QA_ENGINEER here, NOT QA_LEAD!)
    { id: 'mem-cs-1', project_id: 'proj-cybershield-02', user_id: 'usr-pm-01', role: Role.PROJECT_MANAGER, responsibilities: 'Delivery Coordinator' },
    { id: 'mem-cs-2', project_id: 'proj-cybershield-02', user_id: 'usr-po-02', role: Role.PRODUCT_OWNER, responsibilities: 'Security Compliance Owner' },
    { id: 'mem-cs-3', project_id: 'proj-cybershield-02', user_id: 'usr-backend-05', role: Role.BACKEND_DEVELOPER, responsibilities: 'Crypto & Auth Handlers' },
    { id: 'mem-cs-4', project_id: 'proj-cybershield-02', user_id: 'usr-qalead-03', role: Role.QA_ENGINEER, responsibilities: 'Security Penetration Testing' },

    // Apollo (Notice: Marcus Vance & Dave Miller are NOT in Apollo!)
    { id: 'mem-ap-1', project_id: 'proj-apollo-03', user_id: 'usr-pm-01', role: Role.PROJECT_MANAGER, responsibilities: 'Sprint Master' },
    { id: 'mem-ap-2', project_id: 'proj-apollo-03', user_id: 'usr-po-02', role: Role.PRODUCT_OWNER, responsibilities: 'Mobile Experience Vision' },
    { id: 'mem-ap-3', project_id: 'proj-apollo-03', user_id: 'usr-frontend-06', role: Role.FRONTEND_DEVELOPER, responsibilities: 'Mobile UI Layouts' },
    { id: 'mem-ap-4', project_id: 'proj-apollo-03', user_id: 'usr-designer-07', role: Role.DESIGNER, responsibilities: 'Mobile UX Wireframes' }
  ];

  const insertMember = db.prepare(`
    INSERT OR REPLACE INTO project_members (
      id, project_id, user_id, role, responsibilities, joined_at, active
    ) VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  for (const m of memberships) {
    insertMember.run(m.id, m.project_id, m.user_id, m.role, m.responsibilities, now);
  }

  // Seed Teams
  const teams = [
    { id: 'team-nx-api', project_id: 'proj-nexus-01', name: 'API Core Team', description: 'Engineers responsible for the REST/GraphQL gateways' },
    { id: 'team-nx-qa', project_id: 'proj-nexus-01', name: 'Quality Automation Guild', description: 'QA engineers delivering end-to-end reliability' },
    { id: 'team-cs-sec', project_id: 'proj-cybershield-02', name: 'Cryptography & Auth Squad', description: 'Zero-trust authentication specialists' }
  ];

  const insertTeam = db.prepare(`
    INSERT OR REPLACE INTO teams (id, project_id, name, description, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const t of teams) {
    insertTeam.run(t.id, t.project_id, t.name, t.description, now);
  }

  // Seed Team Members
  const teamMembers = [
    { id: 'tm-1', team_id: 'team-nx-api', user_id: 'usr-backend-05' },
    { id: 'tm-2', team_id: 'team-nx-api', user_id: 'usr-frontend-06' },
    { id: 'tm-3', team_id: 'team-nx-qa', user_id: 'usr-qalead-03' },
    { id: 'tm-4', team_id: 'team-nx-qa', user_id: 'usr-qaeng-04' },
    { id: 'tm-5', team_id: 'team-cs-sec', user_id: 'usr-backend-05' },
    { id: 'tm-6', team_id: 'team-cs-sec', user_id: 'usr-qalead-03' }
  ];

  const insertTeamMember = db.prepare(`
    INSERT OR REPLACE INTO team_members (id, team_id, user_id, joined_at)
    VALUES (?, ?, ?, ?)
  `);

  for (const tm of teamMembers) {
    insertTeamMember.run(tm.id, tm.team_id, tm.user_id, now);
  }

  // Seed Telegram Accounts
  const tgAccounts = [
    {
      id: 'tg-1',
      user_id: 'usr-pm-01',
      telegram_user_id: '10001',
      telegram_chat_id: 'chat_10001',
      username: 'alex_chen_pm',
      verified: 1,
      verification_code: null
    },
    {
      id: 'tg-2',
      user_id: 'usr-backend-05',
      telegram_user_id: '10005',
      telegram_chat_id: 'chat_10005',
      username: 'marcus_backend',
      verified: 1,
      verification_code: null
    },
    {
      id: 'tg-3',
      user_id: 'usr-hilina-09',
      telegram_user_id: '347835367',
      telegram_chat_id: '347835367',
      username: 'Helu777',
      verified: 1,
      verification_code: null
    }
  ];

  const insertTg = db.prepare(`
    INSERT OR REPLACE INTO telegram_accounts (
      id, user_id, telegram_user_id, telegram_chat_id, username,
      verified, verification_code, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const tg of tgAccounts) {
    insertTg.run(tg.id, tg.user_id, tg.telegram_user_id, tg.telegram_chat_id, tg.username, tg.verified, tg.verification_code, now, now);
  }

  // Seed Initial Activities
  const activities = [
    {
      id: 'act-1',
      project_id: 'proj-nexus-01',
      user_id: 'usr-pm-01',
      action: 'PROJECT_CREATED',
      details: JSON.stringify({ projectName: 'Nexus Platform Core', status: 'ACTIVE' })
    },
    {
      id: 'act-2',
      project_id: 'proj-nexus-01',
      user_id: 'usr-pm-01',
      action: 'MEMBER_ADDED',
      details: { memberName: 'Dave Miller', role: 'QA_LEAD' }
    },
    {
      id: 'act-3',
      project_id: 'proj-nexus-01',
      user_id: 'usr-backend-05',
      action: 'PROJECT_UPDATED',
      details: { projectName: 'Nexus Platform Core', changes: ['progress: 68%'] }
    },
    {
      id: 'act-4',
      project_id: 'proj-cybershield-02',
      user_id: 'usr-pm-01',
      action: 'PROJECT_CREATED',
      details: JSON.stringify({ projectName: 'CyberShield Security Gateway', status: 'ACTIVE' })
    }
  ];

  const insertAct = db.prepare(`
    INSERT OR REPLACE INTO activities (id, project_id, user_id, action, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const a of activities) {
    insertAct.run(
      a.id,
      a.project_id,
      a.user_id,
      a.action,
      typeof a.details === 'string' ? a.details : JSON.stringify(a.details),
      now
    );
  }

  // Seed Initial Audit Logs
  const auditLogs = [
    {
      id: 'aud-1',
      user_id: 'usr-pm-01',
      action: 'PROJECT_CREATED',
      entity_type: 'PROJECT',
      entity_id: 'proj-nexus-01',
      previous_value: null,
      new_value: JSON.stringify({ name: 'Nexus Platform Core', status: 'ACTIVE' }),
      ip_address: '127.0.0.1',
      user_agent: 'Antigravity Seed Runner'
    },
    {
      id: 'aud-2',
      user_id: 'usr-pm-01',
      action: 'MEMBER_ADDED',
      entity_type: 'PROJECT_MEMBER',
      entity_id: 'mem-nx-3',
      previous_value: null,
      new_value: JSON.stringify({ userId: 'usr-qalead-03', role: 'QA_LEAD' }),
      ip_address: '127.0.0.1',
      user_agent: 'Antigravity Seed Runner'
    }
  ];

  const insertAudit = db.prepare(`
    INSERT OR REPLACE INTO audit_logs (
      id, user_id, action, entity_type, entity_id,
      previous_value, new_value, ip_address, user_agent, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const aud of auditLogs) {
    insertAudit.run(
      aud.id,
      aud.user_id,
      aud.action,
      aud.entity_type,
      aud.entity_id,
      aud.previous_value,
      aud.new_value,
      aud.ip_address,
      aud.user_agent,
      now
    );
  }

  // Seed Initial Daily Standup Updates
  const dailyUpdates = [
    {
      id: 'upd-hilina-01',
      project_id: 'proj-nexus-01',
      user_id: 'usr-hilina-09',
      user_name: 'Hilina Tesfaye',
      role: 'QA_ENGINEER',
      q1_question: '🔍 What test scenarios did you execute today and what was the pass rate?',
      q1_answer: 'hdhdfh,1005',
      q2_question: '🐞 Did you log any new bugs or verify any resolved defect fixes?',
      q2_answer: 'UES YEJRR',
      q3_question: '🚧 Are test builds or test environments stable and unblocked?',
      q3_answer: 'STABLE',
      source: 'TELEGRAM',
      created_at: now
    },
    {
      id: 'upd-backend-02',
      project_id: 'proj-nexus-01',
      user_id: 'usr-backend-05',
      user_name: 'Marcus Vance',
      role: 'BACKEND_DEVELOPER',
      q1_question: '⚙️ What APIs, databases, microservices, or backend PRs did you work on today?',
      q1_answer: 'Implemented SQLite WAL mode and Telegram bot long-polling listener',
      q2_question: '🎯 What backend features or integrations are planned next?',
      q2_answer: 'Write end-to-end integration tests and refine UI components',
      q3_question: '🚧 Any technical blockers, third-party outages, or review delays?',
      q3_answer: 'None, everything is running smoothly',
      source: 'TELEGRAM',
      created_at: now
    }
  ];

  const insertDailyUpdate = db.prepare(`
    INSERT OR REPLACE INTO daily_updates (
      id, project_id, user_id, user_name, role,
      q1_question, q1_answer, q2_question, q2_answer, q3_question, q3_answer,
      source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of dailyUpdates) {
    insertDailyUpdate.run(
      u.id,
      u.project_id,
      u.user_id,
      u.user_name,
      u.role,
      u.q1_question,
      u.q1_answer,
      u.q2_question,
      u.q2_answer,
      u.q3_question,
      u.q3_answer,
      u.source,
      u.created_at
    );
  }

  console.log('[SEED] Demo database successfully seeded with users, projects, standups, and logs.');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  try {
    seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}
