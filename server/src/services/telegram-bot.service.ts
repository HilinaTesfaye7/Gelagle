import { TelegramService } from './telegram.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { MemberRepository } from '../repositories/member.repository.js';
import { TelegramRepository } from '../repositories/telegram.repository.js';
import { DailyUpdateService } from './daily-update.service.js';
import { AuditService } from './audit.service.js';
import { hashPassword, generateId } from '../utils/crypto.utils.js';
import { RoleType } from '../rbac/roles.js';

export const ROLE_DEFINITIONS: { id: RoleType; label: string }[] = [
  { id: 'PROJECT_MANAGER', label: '🎯 Project Manager' },
  { id: 'PRODUCT_OWNER', label: '💡 Product Owner' },
  { id: 'QA_LEAD', label: '🧪 QA Lead' },
  { id: 'QA_ENGINEER', label: '🔍 QA Engineer' },
  { id: 'BACKEND_DEVELOPER', label: '⚙️ Backend Developer' },
  { id: 'FRONTEND_DEVELOPER', label: '🎨 Frontend Developer' },
  { id: 'DESIGNER', label: '✨ UI/UX Designer' },
  { id: 'OTHER', label: '🤝 Stakeholder / Other' }
];

export const ROLE_DAILY_QUESTIONS: Record<RoleType, [string, string, string]> = {
  PROJECT_MANAGER: [
    '📊 What is the current milestone and sprint delivery progress across your projects?',
    '⚠️ Are there any critical scope changes, risks, or schedule slippages?',
    '🤝 What decisions or blocker escalations are required today?'
  ],
  PRODUCT_OWNER: [
    '💡 What user stories or backlog items were clarified/accepted today?',
    '🎯 Are sprint deliverables on track with the product vision and customer needs?',
    '⚠️ Any scope tradeoffs or priority adjustments needed?'
  ],
  QA_LEAD: [
    '🧪 What test suites, regression cycles, or test plans were completed today?',
    '🐛 What is the defect breakdown (critical, high, medium) found today?',
    '🚨 Are there any environment, data, or release quality blockers?'
  ],
  QA_ENGINEER: [
    '🔍 What test scenarios did you execute today and what was the pass rate?',
    '🐞 Did you log any new bugs or verify any resolved defect fixes?',
    '🚧 Are test builds or test environments stable and unblocked?'
  ],
  BACKEND_DEVELOPER: [
    '⚙️ What APIs, databases, microservices, or backend PRs did you work on today?',
    '🎯 What backend features or integrations are planned next?',
    '🚧 Any technical blockers, third-party outages, or review delays?'
  ],
  FRONTEND_DEVELOPER: [
    '🎨 What UI components, screens, responsive layouts, or PRs did you work on today?',
    '🎯 What UI features or client tasks are planned next?',
    '🚧 Any design ambiguities, backend API blockers, or build issues?'
  ],
  DESIGNER: [
    '✨ What wireframes, prototypes, user flows, or design systems were progressed today?',
    '🎯 What design deliverables or user research are scheduled next?',
    '🚧 Any requirements or engineering handoff blockers?'
  ],
  OTHER: [
    '👀 What project deliverables or updates did you review today?',
    '📈 What are your top priorities and expectations for this delivery cycle?',
    '💬 Any feedback, questions, or guidance for the project teams?'
  ]
};

interface BotSession {
  telegramUserId: string;
  chatId: string;
  username?: string;
  step:
    | 'IDLE'
    | 'AWAITING_NAME'
    | 'AWAITING_ROLE'
    | 'AWAITING_PROJECTS'
    | 'AWAITING_LEADERSHIP_CHOICE'
    | 'AWAITING_Q1'
    | 'AWAITING_Q2'
    | 'AWAITING_Q3';
  fullName?: string;
  selectedRole?: RoleType;
  selectedProjectIds: string[];
  userId?: string;
  questions?: [string, string, string];
  answers?: { q1?: string; q2?: string; q3?: string };
}

export class TelegramBotService {
  private isRunning = false;
  private offset = 0;
  private telegramService: TelegramService;
  private userRepo = new UserRepository();
  private projectRepo = new ProjectRepository();
  private memberRepo = new MemberRepository();
  private telegramRepo = new TelegramRepository();
  private dailyUpdateService = new DailyUpdateService();
  private auditService = new AuditService();
  private pollingAbortController: AbortController | null = null;

  // Active in-memory sessions keyed by telegramUserId
  private sessions = new Map<string, BotSession>();

  constructor(telegramService?: TelegramService) {
    this.telegramService = telegramService || new TelegramService();
  }

  async start(): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || token.includes('dummy') || token === 'your_telegram_bot_token') {
      console.log('[TELEGRAM BOT] No real bot token configured. Telegram long-polling is idle.');
      return false;
    }

    if (this.isRunning) return true;

    try {
      const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const meData = await meRes.json();
      if (!meData.ok) {
        console.error('[TELEGRAM BOT] Invalid Bot Token:', meData.description);
        return false;
      }
      console.log(`🤖 [TELEGRAM BOT] Connected as @${meData.result.username} (${meData.result.first_name})`);
    } catch (err) {
      console.error('[TELEGRAM BOT] Failed to reach Telegram API:', err);
      return false;
    }

    this.isRunning = true;
    this.pollLoop(token);
    return true;
  }

  stop(): void {
    this.isRunning = false;
    if (this.pollingAbortController) {
      this.pollingAbortController.abort();
      this.pollingAbortController = null;
    }
    console.log('[TELEGRAM BOT] Polling service stopped.');
  }

  getBotStatus(): { isRunning: boolean; tokenConfigured: boolean } {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const tokenConfigured = !!token && !token.includes('dummy') && token !== 'your_telegram_bot_token';
    return {
      isRunning: this.isRunning,
      tokenConfigured
    };
  }

  private async pollLoop(token: string): Promise<void> {
    console.log('📡 [TELEGRAM BOT] Real-time long polling started. Listening for Telegram messages & callbacks...');

    while (this.isRunning) {
      try {
        this.pollingAbortController = new AbortController();
        const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${this.offset}&timeout=20`;
        const res = await fetch(url, { signal: this.pollingAbortController.signal });

        if (!res.ok) {
          await new Promise((r) => setTimeout(r, 4000));
          continue;
        }

        const data = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            this.offset = update.update_id + 1;

            if (update.callback_query) {
              await this.handleCallbackQuery(update.callback_query);
            } else if (update.message && update.message.text) {
              await this.handleTextMessage(update.message);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') break;
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  }

  /**
   * Handle incoming text messages from users
   */
  private async handleTextMessage(msg: any): Promise<void> {
    const tgUserId = String(msg.from.id);
    const chatId = String(msg.chat.id);
    const username = msg.from.username || msg.from.first_name || 'telegram_user';
    const text = msg.text.trim();

    console.log(`[TELEGRAM BOT] Message from @${username} (${tgUserId}): ${text}`);

    let session = this.sessions.get(tgUserId);
    if (!session) {
      session = {
        telegramUserId: tgUserId,
        chatId: chatId,
        username: username,
        step: 'IDLE',
        selectedProjectIds: []
      };
      this.sessions.set(tgUserId, session);
    }
    session.chatId = chatId;
    session.username = username;

    const lower = text.toLowerCase();

    // 1. Slash command overrides
    if (lower === '/start') {
      session.step = 'AWAITING_NAME';
      session.fullName = undefined;
      session.selectedRole = undefined;
      session.selectedProjectIds = [];
      session.answers = {};

      const welcomeText =
        `👋 **Welcome to the AI-Powered Delivery Command Center!**\n\n` +
        `Let's get you set up on your team.\n\n` +
        `👤 **What is your full name?**\n` +
        `*(Please type your full name below)*`;

      await this.telegramService.sendTelegramMessage(chatId, welcomeText);
      return;
    }

    if (lower === '/daily' || lower === '/standup') {
      await this.triggerDailyQuestionsFlow(session, chatId, tgUserId, username);
      return;
    }

    if (lower === '/projects') {
      const tgAccount = this.telegramRepo.findByTelegramUserId(tgUserId);
      if (!tgAccount || !tgAccount.verified) {
        await this.telegramService.sendTelegramMessage(
          chatId,
          `🔒 You are not linked yet. Please send /start to set up your name, role, and projects.`
        );
        return;
      }
      const projects = this.projectRepo.findProjectsForUser(tgAccount.user_id);
      if (projects.length === 0) {
        await this.telegramService.sendTelegramMessage(
          chatId,
          `📂 You are not assigned to any projects. Send /start to update your project memberships.`
        );
        return;
      }
      const list = projects
        .map(
          (p) =>
            `• **${p.name}** (${p.status})\n  Role: *${p.currentUserRole || 'Member'}* | Progress: ${p.progress}%`
        )
        .join('\n\n');
      await this.telegramService.sendTelegramMessage(
        chatId,
        `📂 **Your Assigned Projects (${projects.length})**:\n\n${list}\n\n💡 Send /daily to submit your daily update!`
      );
      return;
    }

    if (lower === '/profile') {
      const tgAccount = this.telegramRepo.findByTelegramUserId(tgUserId);
      if (!tgAccount || !tgAccount.verified) {
        await this.telegramService.sendTelegramMessage(
          chatId,
          `🔒 Profile not found. Send /start to register your profile.`
        );
        return;
      }
      const user = this.userRepo.findById(tgAccount.user_id);
      if (!user) {
        await this.telegramService.sendTelegramMessage(chatId, `❌ User record not found.`);
        return;
      }
      await this.telegramService.sendTelegramMessage(
        chatId,
        `👤 **Your Command Center Identity**:\n\n` +
          `• Name: **${user.name}**\n` +
          `• Email: \`${user.email}\`\n` +
          `• Username: @${user.username}\n` +
          `• Status: \`${user.availability_status}\`\n` +
          `• Telegram: Linked (@${username})\n\n` +
          `💡 Send /start to reconfigure role & projects or /daily to submit your standup!`
      );
      return;
    }

    if (lower === '/report' || lower === '/reports') {
      const tgAccount = this.telegramRepo.findByTelegramUserId(tgUserId);
      if (!tgAccount || !tgAccount.verified) {
        await this.telegramService.sendTelegramMessage(
          chatId,
          `🔒 You are not linked yet. Please send /start to set up your name, role, and projects.`
        );
        return;
      }
      const user = this.userRepo.findById(tgAccount.user_id);
      if (!user) {
        await this.telegramService.sendTelegramMessage(chatId, `❌ User record not found.`);
        return;
      }
      const projects = this.projectRepo.findProjectsForUser(user.id);
      if (projects.length === 0) {
        await this.telegramService.sendTelegramMessage(
          chatId,
          `📂 You have no assigned projects. Send /start to assign yourself to projects.`
        );
        return;
      }
      session.userId = user.id;
      session.fullName = user.name;
      session.selectedRole = (projects[0].currentUserRole as RoleType) || 'PROJECT_MANAGER';
      session.selectedProjectIds = projects.map((p) => p.id);
      await this.sendLeadershipReport(session, chatId);
      return;
    }

    if (lower === '/help') {
      await this.telegramService.sendTelegramMessage(
        chatId,
        `🤖 **Command Center Telegram Bot Commands**:\n\n` +
          `• /start - Onboard & select full name, role, and projects\n` +
          `• /report - Generate executive delivery and standup report\n` +
          `• /daily - Answer daily reminder questions or request leadership report\n` +
          `• /projects - List your assigned projects and current delivery status\n` +
          `• /profile - View your linked profile details\n` +
          `• /help - Display this instructions guide`
      );
      return;
    }

    // 2. State Machine Flows
    if (session.step === 'AWAITING_NAME') {
      session.fullName = text;
      session.step = 'AWAITING_ROLE';

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🎯 Project Manager', callback_data: 'role:PROJECT_MANAGER' },
            { text: '💡 Product Owner', callback_data: 'role:PRODUCT_OWNER' }
          ],
          [
            { text: '🧪 QA Lead', callback_data: 'role:QA_LEAD' },
            { text: '🔍 QA Engineer', callback_data: 'role:QA_ENGINEER' }
          ],
          [
            { text: '⚙️ Backend Dev', callback_data: 'role:BACKEND_DEVELOPER' },
            { text: '🎨 Frontend Dev', callback_data: 'role:FRONTEND_DEVELOPER' }
          ],
          [
            { text: '✨ UI/UX Designer', callback_data: 'role:DESIGNER' },
            { text: '🤝 Other / Stakeholder', callback_data: 'role:OTHER' }
          ]
        ]
      };

      await this.telegramService.sendTelegramMessage(
        chatId,
        `✨ Great to meet you, **${session.fullName}**!\n\n` +
          `🎭 **Please choose your role in the team:**`,
        keyboard
      );
      return;
    }

    if (session.step === 'AWAITING_LEADERSHIP_CHOICE') {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('report') || lowerText.includes('summary') || lowerText === '1') {
        await this.sendLeadershipReport(session, chatId);
        return;
      }
      if (
        lowerText.includes('proceed') ||
        lowerText.includes('question') ||
        lowerText === '2' ||
        lowerText === 'yes'
      ) {
        await this.proceedToDailyQuestions(session, chatId);
        return;
      }

      await this.telegramService.sendTelegramMessage(
        chatId,
        `🤔 Please choose an option below:\nWould you like to **Generate Project Report** or **Proceed with Daily Questions**?`,
        {
          inline_keyboard: [
            [
              {
                text: '📊 Generate Project Delivery Report',
                callback_data: 'action:generate_report'
              }
            ],
            [
              {
                text: '✍️ Proceed with Daily Questions',
                callback_data: 'action:proceed_questions'
              }
            ]
          ]
        }
      );
      return;
    }

    if (session.step === 'AWAITING_Q1') {
      if (!session.answers) session.answers = {};
      session.answers.q1 = text;
      session.step = 'AWAITING_Q2';

      const q2 = session.questions ? session.questions[1] : 'What are you planning to work on next?';
      await this.telegramService.sendTelegramMessage(
        chatId,
        `✅ Recorded!\n\n**Question 2 of 3:**\n👉 ${q2}`
      );
      return;
    }

    if (session.step === 'AWAITING_Q2') {
      if (!session.answers) session.answers = {};
      session.answers.q2 = text;
      session.step = 'AWAITING_Q3';

      const q3 = session.questions ? session.questions[2] : 'Are there any blockers or impediments?';
      await this.telegramService.sendTelegramMessage(
        chatId,
        `✅ Recorded!\n\n**Question 3 of 3 (Final):**\n👉 ${q3}`
      );
      return;
    }

    if (session.step === 'AWAITING_Q3') {
      if (!session.answers) session.answers = {};
      session.answers.q3 = text;

      await this.completeDailyCheckin(session, chatId);
      return;
    }

    // Default response if idle
    await this.telegramService.sendTelegramMessage(
      chatId,
      `👋 Hi @${username}! Send /start to set up your role & projects, or /daily to answer your daily check-in questions.`
    );
  }

  /**
   * Handle interactive button clicks (inline keyboard callbacks)
   */
  private async handleCallbackQuery(cbQuery: any): Promise<void> {
    const queryId = cbQuery.id;
    const tgUserId = String(cbQuery.from.id);
    const chatId = String(cbQuery.message.chat.id);
    const messageId = cbQuery.message.message_id;
    const data = cbQuery.data || '';
    const username = cbQuery.from.username || cbQuery.from.first_name || 'telegram_user';

    console.log(`[TELEGRAM BOT] Callback query from @${username}: ${data}`);

    let session = this.sessions.get(tgUserId);
    if (!session) {
      session = {
        telegramUserId: tgUserId,
        chatId: chatId,
        username: username,
        step: 'IDLE',
        selectedProjectIds: []
      };
      this.sessions.set(tgUserId, session);
    }
    session.chatId = chatId;
    session.username = username;

    // Handle Role Selection
    if (data.startsWith('role:')) {
      const selectedRole = data.split(':')[1] as RoleType;
      session.selectedRole = selectedRole;
      session.step = 'AWAITING_PROJECTS';
      session.selectedProjectIds = [];

      const roleDef = ROLE_DEFINITIONS.find((r) => r.id === selectedRole);
      const roleLabel = roleDef ? roleDef.label : selectedRole;

      await this.telegramService.answerCallbackQuery(queryId, `Selected: ${roleLabel}`);

      // Fetch all projects for multi-select
      const allProjects = this.projectRepo.findAll();
      const keyboard = this.buildProjectSelectionKeyboard(allProjects, session.selectedProjectIds);

      await this.telegramService.sendTelegramMessage(
        chatId,
        `Role chosen: **${roleLabel}**\n\n` +
          `📂 **Choose the project(s) you are in:**\n` +
          `*(Tap project buttons to select multiple, then tap Confirm)*`,
        keyboard
      );
      return;
    }

    // Handle Project Toggle
    if (data.startsWith('toggle_proj:')) {
      const projId = data.split(':')[1];
      const index = session.selectedProjectIds.indexOf(projId);
      if (index >= 0) {
        session.selectedProjectIds.splice(index, 1);
      } else {
        session.selectedProjectIds.push(projId);
      }

      await this.telegramService.answerCallbackQuery(queryId);

      const allProjects = this.projectRepo.findAll();
      const updatedKeyboard = this.buildProjectSelectionKeyboard(allProjects, session.selectedProjectIds);

      const roleDef = ROLE_DEFINITIONS.find((r) => r.id === session.selectedRole);
      const roleLabel = roleDef ? roleDef.label : session.selectedRole || 'Member';

      await this.telegramService.editTelegramMessage(
        chatId,
        messageId,
        `Role chosen: **${roleLabel}**\n\n` +
          `📂 **Choose the project(s) you are in:**\n` +
          `*(Tap project buttons to select multiple, then tap Confirm)*`,
        updatedKeyboard
      );
      return;
    }

    // Handle Action Callbacks for Reports vs Questions
    if (data === 'action:generate_report') {
      await this.telegramService.answerCallbackQuery(queryId, 'Generating report...');
      await this.sendLeadershipReport(session, chatId);
      return;
    }

    if (data === 'action:proceed_questions') {
      await this.telegramService.answerCallbackQuery(queryId, 'Starting questions...');
      await this.proceedToDailyQuestions(session, chatId);
      return;
    }

    if (data === 'action:done_report') {
      await this.telegramService.answerCallbackQuery(queryId, 'Done!');
      session.step = 'IDLE';
      await this.telegramService.sendTelegramMessage(
        chatId,
        `✅ **Report review completed.** You can type /daily anytime to request a report or submit standup answers!`
      );
      return;
    }

    // Handle Confirm Projects
    if (data === 'confirm_projects') {
      if (session.selectedProjectIds.length === 0) {
        await this.telegramService.answerCallbackQuery(
          queryId,
          '⚠️ Please select at least one project before confirming!',
          true
        );
        return;
      }

      await this.telegramService.answerCallbackQuery(queryId, 'Projects confirmed!');

      // Save user & project memberships to DB
      await this.saveOnboardingToDatabase(session);

      const role = session.selectedRole || 'BACKEND_DEVELOPER';
      const roleDef = ROLE_DEFINITIONS.find((r) => r.id === session.selectedRole);
      const roleLabel = roleDef ? roleDef.label : role;

      const allProjects = this.projectRepo.findAll();
      const selectedNames = allProjects
        .filter((p) => session.selectedProjectIds.includes(p.id))
        .map((p) => p.name);

      // Check if user is QA Lead, Project Manager, or Product Owner
      if (this.isLeadershipRole(role)) {
        session.step = 'AWAITING_LEADERSHIP_CHOICE';
        const choiceKeyboard = {
          inline_keyboard: [
            [
              {
                text: '📊 Generate Project Delivery Report',
                callback_data: 'action:generate_report'
              }
            ],
            [
              {
                text: '✍️ Proceed with Daily Questions',
                callback_data: 'action:proceed_questions'
              }
            ]
          ]
        };

        const welcomeMsg =
          `🎉 **Onboarding Successful!**\n\n` +
          `👤 **Name:** ${session.fullName}\n` +
          `🎭 **Role:** ${roleLabel}\n` +
          `📂 **Projects Assigned:**\n${selectedNames.map((n) => `  • ${n}`).join('\n')}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📋 **Project Leadership Command**\n\n` +
          `As a **${roleLabel}**, would you like to **generate the Project & Delivery Report**, or **proceed with answering daily standup questions**?`;

        await this.telegramService.sendTelegramMessage(chatId, welcomeMsg, choiceKeyboard);
        return;
      }

      // Transition to Daily Questions for individual contributors
      const questions = ROLE_DAILY_QUESTIONS[role] || ROLE_DAILY_QUESTIONS['BACKEND_DEVELOPER'];
      session.questions = questions;
      session.answers = {};
      session.step = 'AWAITING_Q1';

      const welcomeMsg =
        `🎉 **Onboarding Successful!**\n\n` +
        `👤 **Name:** ${session.fullName}\n` +
        `🎭 **Role:** ${roleLabel}\n` +
        `📂 **Projects Assigned:**\n${selectedNames.map((n) => `  • ${n}`).join('\n')}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📋 **Daily Delivery Standup**\n` +
        `Based on your role (*${roleLabel}*), please answer 3 daily check-in questions for your team:\n\n` +
        `**Question 1 of 3:**\n` +
        `👉 ${questions[0]}`;

      await this.telegramService.sendTelegramMessage(chatId, welcomeMsg);
      return;
    }

    await this.telegramService.answerCallbackQuery(queryId);
  }

  /**
   * Build multi-select inline keyboard for projects
   */
  private buildProjectSelectionKeyboard(allProjects: any[], selectedIds: string[]) {
    const buttons = allProjects.map((p) => {
      const isSelected = selectedIds.includes(p.id);
      const checkMark = isSelected ? '✅' : '◻️';
      return [
        {
          text: `${checkMark} ${p.name}`,
          callback_data: `toggle_proj:${p.id}`
        }
      ];
    });

    const count = selectedIds.length;
    buttons.push([
      {
        text: count > 0 ? `🚀 Confirm Selected Projects (${count})` : `⚠️ Select at least 1 project`,
        callback_data: 'confirm_projects'
      }
    ]);

    return { inline_keyboard: buttons };
  }

  /**
   * Persist onboarded user, telegram link, and project memberships into SQLite
   */
  private async saveOnboardingToDatabase(session: BotSession): Promise<string> {
    const now = new Date().toISOString();
    const tgUserId = session.telegramUserId;
    const tgUsername = session.username || null;
    const fullName = session.fullName || 'Team Member';
    const role: RoleType = session.selectedRole || 'BACKEND_DEVELOPER';

    // Check if telegram account exists
    let existingTg = this.telegramRepo.findByTelegramUserId(tgUserId);
    let userId: string;

    if (existingTg) {
      userId = existingTg.user_id;
      // Update user details
      const existingUser = this.userRepo.findById(userId);
      if (existingUser) {
        this.userRepo.update(userId, {
          name: fullName,
          telegram_user_id: tgUserId,
          telegram_chat_id: session.chatId,
          telegram_username: tgUsername
        });
      }
      this.telegramRepo.createOrUpdate({
        ...existingTg,
        telegram_chat_id: session.chatId,
        username: tgUsername,
        verified: 1,
        updated_at: now
      });
    } else {
      // Create new user record
      userId = generateId();
      const { hash, salt } = hashPassword('Password123!');
      const cleanUsername = (tgUsername || `tg_${tgUserId.slice(-6)}`).toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const email = `${cleanUsername}@commandcenter.local`;

      this.userRepo.create({
        id: userId,
        name: fullName,
        email: email,
        username: cleanUsername,
        password_hash: hash,
        password_salt: salt,
        avatar: null,
        timezone: 'UTC',
        active: 1,
        availability_status: 'AVAILABLE',
        skills: '[]',
        notification_preferences: '{}',
        daily_checkin_enabled: 1,
        telegram_user_id: tgUserId,
        telegram_chat_id: session.chatId,
        telegram_username: tgUsername,
        created_at: now,
        updated_at: now
      });

      this.telegramRepo.createOrUpdate({
        id: generateId(),
        user_id: userId,
        telegram_user_id: tgUserId,
        telegram_chat_id: session.chatId,
        username: tgUsername,
        verified: 1,
        verification_code: null,
        created_at: now,
        updated_at: now
      });
    }

    session.userId = userId;

    // Add memberships for each selected project
    for (const projId of session.selectedProjectIds) {
      this.memberRepo.create({
        id: generateId(),
        project_id: projId,
        user_id: userId,
        role: role,
        responsibilities: 'Added via Telegram Command Center Onboarding',
        joined_at: now,
        active: 1
      });
    }

    // Record audit
    this.auditService.record({
      userId: userId,
      action: 'USER_ONBOARDED_TELEGRAM',
      entityType: 'USER',
      entityId: userId,
      newValue: {
        name: fullName,
        role: role,
        projects: session.selectedProjectIds
      }
    });

    return userId;
  }

  /**
   * Save completed daily check-in questions & answers into the project table
   */
  private async completeDailyCheckin(session: BotSession, chatId: string): Promise<void> {
    const questions = session.questions || [
      'Accomplishments today',
      'Next priorities',
      'Blockers & risks'
    ];
    const answers = session.answers || {
      q1: 'In progress',
      q2: 'Upcoming sprint items',
      q3: 'None'
    };

    const userId = session.userId || (await this.saveOnboardingToDatabase(session));
    const user = this.userRepo.findById(userId);
    const userName = user?.name || session.fullName || 'Team Member';
    const role = session.selectedRole || 'BACKEND_DEVELOPER';

    const allProjects = this.projectRepo.findAll();
    const projectNames: string[] = [];

    // Save update for each selected project
    for (const projId of session.selectedProjectIds) {
      const proj = allProjects.find((p) => p.id === projId);
      if (proj) projectNames.push(proj.name);

      this.dailyUpdateService.createDailyUpdate({
        projectId: projId,
        userId: userId,
        userName: userName,
        role: role,
        q1Question: questions[0],
        q1Answer: answers.q1 || 'N/A',
        q2Question: questions[1],
        q2Answer: answers.q2 || 'N/A',
        q3Question: questions[2],
        q3Answer: answers.q3 || 'N/A',
        source: 'TELEGRAM'
      });
    }

    // Reset session step to IDLE
    session.step = 'IDLE';

    const successMessage =
      `🎉 **Daily Check-in Submitted Successfully!**\n\n` +
      `Your responses have been synced directly to the **Project Table** & Command Center for:\n` +
      `${projectNames.map((n) => `📁 **${n}**`).join('\n')}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📝 **Summary of Answers:**\n\n` +
      `**1️⃣ ${questions[0]}**\n↳ *${answers.q1}*\n\n` +
      `**2️⃣ ${questions[1]}**\n↳ *${answers.q2}*\n\n` +
      `**3️⃣ ${questions[2]}**\n↳ *${answers.q3}*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🌐 **Web Command Center:** [http://localhost:4000](http://localhost:4000)\n\n` +
      `💡 **Quick Commands:**\n` +
      `• /daily - Submit a new daily update anytime\n` +
      `• /projects - View your assigned projects\n` +
      `• /start - Reconfigure your profile or projects`;

    await this.telegramService.sendTelegramMessage(chatId, successMessage);
  }

  /**
   * Helper to trigger daily checkin for an existing or new user
   */
  private async triggerDailyQuestionsFlow(
    session: BotSession,
    chatId: string,
    tgUserId: string,
    username: string
  ): Promise<void> {
    const tgAccount = this.telegramRepo.findByTelegramUserId(tgUserId);
    if (!tgAccount || !tgAccount.verified) {
      await this.telegramService.sendTelegramMessage(
        chatId,
        `👋 Welcome! Please run /start first to tell us your full name, role, and projects.`
      );
      return;
    }

    const user = this.userRepo.findById(tgAccount.user_id);
    if (!user) {
      await this.telegramService.sendTelegramMessage(
        chatId,
        `🔒 User account not found. Send /start to register.`
      );
      return;
    }

    const projects = this.projectRepo.findProjectsForUser(user.id);
    if (projects.length === 0) {
      await this.telegramService.sendTelegramMessage(
        chatId,
        `📂 You are not assigned to any projects. Please send /start to select your projects first.`
      );
      return;
    }

    const userRole = (projects[0].currentUserRole as RoleType) || 'BACKEND_DEVELOPER';
    const roleDef = ROLE_DEFINITIONS.find((r) => r.id === userRole);
    const roleLabel = roleDef ? roleDef.label : userRole;

    session.userId = user.id;
    session.fullName = user.name;
    session.selectedRole = userRole;
    session.selectedProjectIds = projects.map((p) => p.id);

    // If QA Lead, PM, or PO: ask if they want reports or proceed with questions
    if (this.isLeadershipRole(userRole)) {
      session.step = 'AWAITING_LEADERSHIP_CHOICE';
      const choiceKeyboard = {
        inline_keyboard: [
          [
            {
              text: '📊 Generate Project Delivery Report',
              callback_data: 'action:generate_report'
            }
          ],
          [
            {
              text: '✍️ Proceed with Daily Questions',
              callback_data: 'action:proceed_questions'
            }
          ]
        ]
      };

      await this.telegramService.sendTelegramMessage(
        chatId,
        `📋 **Project Leadership Command**\n\n` +
          `👤 **${user.name}** (${roleLabel})\n` +
          `📂 Projects: ${projects.map((p) => p.name).join(', ')}\n\n` +
          `Would you like to **generate the Project Delivery Report**, or **proceed with answering your daily questions**?`,
        choiceKeyboard
      );
      return;
    }

    const questions = ROLE_DAILY_QUESTIONS[userRole] || ROLE_DAILY_QUESTIONS['BACKEND_DEVELOPER'];
    session.questions = questions;
    session.answers = {};
    session.step = 'AWAITING_Q1';

    await this.telegramService.sendTelegramMessage(
      chatId,
      `📋 **Daily Delivery Standup**\n` +
        `👤 **${user.name}** (${roleLabel})\n` +
        `📂 Projects: ${projects.map((p) => p.name).join(', ')}\n\n` +
        `**Question 1 of 3:**\n` +
        `👉 ${questions[0]}`
    );
  }

  /**
   * Check if role is QA Lead or Project Manager (leadership)
   */
  private isLeadershipRole(role?: string): boolean {
    return role === 'QA_LEAD' || role === 'PROJECT_MANAGER' || role === 'PRODUCT_OWNER';
  }

  /**
   * Proceed to start asking daily standup questions
   */
  private async proceedToDailyQuestions(session: BotSession, chatId: string): Promise<void> {
    const role = session.selectedRole || 'BACKEND_DEVELOPER';
    const questions = ROLE_DAILY_QUESTIONS[role] || ROLE_DAILY_QUESTIONS['BACKEND_DEVELOPER'];
    session.questions = questions;
    session.answers = {};
    session.step = 'AWAITING_Q1';

    const roleDef = ROLE_DEFINITIONS.find((r) => r.id === role);
    const roleLabel = roleDef ? roleDef.label : role;

    await this.telegramService.sendTelegramMessage(
      chatId,
      `✍️ **Proceeding with Daily Questions for ${roleLabel}**\n\n` +
        `**Question 1 of 3:**\n` +
        `👉 ${questions[0]}`
    );
  }

  /**
   * Generate and send comprehensive Project Delivery & Standup Report to leadership
   */
  private async sendLeadershipReport(session: BotSession, chatId: string): Promise<void> {
    const userId = session.userId || (await this.saveOnboardingToDatabase(session));
    const user = this.userRepo.findById(userId);
    const userName = user?.name || session.fullName || 'Team Leader';
    const role = session.selectedRole || 'PROJECT_MANAGER';
    const roleDef = ROLE_DEFINITIONS.find((r) => r.id === role);
    const roleLabel = roleDef ? roleDef.label : role;

    const allProjects = this.projectRepo.findAll();
    const assignedProjects = allProjects.filter((p) => session.selectedProjectIds.includes(p.id));

    let report =
      `📊 **EXECUTIVE PROJECT & DELIVERY REPORT**\n` +
      `📅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}\n` +
      `👤 **Leader:** ${userName} (${roleLabel})\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    let totalBlockers = 0;

    for (const proj of assignedProjects) {
      const members = this.memberRepo.findMembersByProjectId(proj.id);
      const updates = this.dailyUpdateService.getUpdatesForProject(proj.id, 5);

      report += `📁 **${proj.name}**\n`;
      report += `• Status: \`${proj.status}\` | Velocity: \`${proj.progress}%\`\n`;
      report += `• Target Delivery: ${proj.target_date || 'TBD'} | Squad: ${members.length} members\n`;

      if (updates.length === 0) {
        report += `• *No standup submissions logged yet today for this project.*\n\n`;
      } else {
        report += `• **Recent Team Standup Updates (${updates.length}):**\n`;
        for (const u of updates) {
          const timeStr = new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          report += `  ↳ **${u.user_name}** (*${u.role}*) [${timeStr}]:\n`;
          report += `    • **Done:** ${u.q1_answer}\n`;
          report += `    • **Next:** ${u.q2_answer}\n`;
          const hasBlocker =
            u.q3_answer &&
            !['none', 'no', 'n/a', 'nil', '', 'nope'].includes(u.q3_answer.toLowerCase().trim());
          if (hasBlocker) {
            totalBlockers++;
            report += `    • ⚠️ **BLOCKER:** ${u.q3_answer}\n`;
          }
        }
        report += `\n`;
      }
    }

    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    if (role === 'QA_LEAD') {
      report += `🧪 **QA Lead Quality Health Check:**\n`;
      report += `• Quality gate status: ${totalBlockers > 0 ? `⚠️ ${totalBlockers} Blocker(s) Logged` : '✅ Optimal (Zero Release Blockers)'}\n`;
    } else {
      report += `📈 **Delivery Health Summary:**\n`;
      report += `• Active blockers across squad: ${totalBlockers > 0 ? `⚠️ ${totalBlockers} require attention` : '✅ 0 (All Clear)'}\n`;
    }

    report += `\n💡 *Drill into all projects on the Web Command Center at http://localhost:4000*`;

    const followUpKeyboard = {
      inline_keyboard: [
        [
          { text: '✍️ Proceed with Daily Questions', callback_data: 'action:proceed_questions' }
        ],
        [
          { text: '🔄 Refresh Report', callback_data: 'action:generate_report' },
          { text: '✅ Done for Today', callback_data: 'action:done_report' }
        ]
      ]
    };

    await this.telegramService.sendTelegramMessage(chatId, report, followUpKeyboard);
  }
}

export const telegramBotInstance = new TelegramBotService();
