import {
  SafeUser,
  Project,
  ProjectWithDetails,
  ProjectMemberWithUser,
  TeamWithMembers,
  ActivityWithUser,
  AuditLogWithUser,
  TelegramAccount,
  ProjectMembershipInfo,
  DailyUpdate
} from '../types/client.types.js';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('cmd_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.message || data.error || 'Request failed', data);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (identifier: string, password: string) =>
      request<{ user: SafeUser; token: string; memberships: ProjectMembershipInfo[] }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      }),
    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST'
      }),
    me: () =>
      request<{ user: SafeUser; memberships: ProjectMembershipInfo[]; grantedPermissions: string[] }>('/auth/me')
  },

  // Users
  users: {
    list: () => request<{ users: SafeUser[] }>('/users'),
    get: (userId: string) => request<{ user: SafeUser; memberships: ProjectMembershipInfo[] }>(`/users/${userId}`),
    updateProfile: (userId: string, data: Partial<SafeUser>) =>
      request<{ message: string; user: SafeUser }>(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
  },

  // Projects
  projects: {
    list: () => request<{ projects: ProjectWithDetails[] }>('/projects'),
    get: (projectId: string) => request<{ project: ProjectWithDetails }>(`/projects/${projectId}`),
    create: (data: {
      name: string;
      description?: string;
      status?: string;
      start_date?: string;
      target_date?: string;
      product_owner_id?: string;
    }) =>
      request<{ message: string; project: Project }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (projectId: string, data: Partial<Project>) =>
      request<{ message: string; project: Project }>(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    delete: (projectId: string) =>
      request<{ message: string }>(`/projects/${projectId}`, {
        method: 'DELETE'
      })
  },

  // Members
  members: {
    list: (projectId: string) =>
      request<{ members: ProjectMemberWithUser[] }>(`/projects/${projectId}/members`),
    add: (projectId: string, data: { userId: string; role: string; responsibilities?: string }) =>
      request<{ message: string; member: any }>(`/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (projectId: string, userId: string, data: { role?: string; responsibilities?: string }) =>
      request<{ message: string; member: any }>(`/projects/${projectId}/members/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    remove: (projectId: string, userId: string) =>
      request<{ message: string }>(`/projects/${projectId}/members/${userId}`, {
        method: 'DELETE'
      })
  },

  // Teams
  teams: {
    list: (projectId: string) =>
      request<{ teams: TeamWithMembers[] }>(`/projects/${projectId}/teams`),
    create: (projectId: string, data: { name: string; description?: string }) =>
      request<{ message: string; team: any }>(`/projects/${projectId}/teams`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    addMember: (projectId: string, teamId: string, userId: string) =>
      request<{ message: string; success: boolean }>(`/projects/${projectId}/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      }),
    removeMember: (projectId: string, teamId: string, userId: string) =>
      request<{ message: string; success: boolean }>(`/projects/${projectId}/teams/${teamId}/members/${userId}`, {
        method: 'DELETE'
      }),
    delete: (projectId: string, teamId: string) =>
      request<{ message: string }>(`/projects/${projectId}/teams/${teamId}`, {
        method: 'DELETE'
      })
  },

  // Activities
  activities: {
    listProject: (projectId: string) =>
      request<{ activities: ActivityWithUser[] }>(`/projects/${projectId}/activities`),
    listGlobal: () => request<{ activities: ActivityWithUser[] }>('/activities')
  },

  // Audit
  audit: {
    list: () => request<{ logs: AuditLogWithUser[] }>('/audit')
  },

  // Telegram
  telegram: {
    getStatus: () => request<{ account: TelegramAccount | null }>('/telegram/status'),
    generateCode: () =>
      request<{ message: string; code: string; instructions: string }>('/telegram/generate-code', {
        method: 'POST'
      }),
    unlink: () =>
      request<{ message: string }>('/telegram/unlink', {
        method: 'POST'
      }),
    simulateWebhook: (data: { telegramUserId: string; chatId: string; username?: string; text: string }) =>
      request<{ reply: string; actionTaken?: string; identifiedUser?: any }>('/telegram/webhook', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    sendDailyUpdate: () =>
      request<{ success: boolean; message: string; preview: string }>('/telegram/send-daily-update', {
        method: 'POST'
      }),
    configureToken: (token: string) =>
      request<{ message: string }>('/telegram/configure-token', {
        method: 'POST',
        body: JSON.stringify({ token })
      })
  },

  // Daily Standup Updates
  dailyUpdates: {
    listForProject: (projectId: string, limit = 50) =>
      request<{ updates: DailyUpdate[] }>(`/projects/${projectId}/daily-updates?limit=${limit}`),
    create: (
      projectId: string,
      data: {
        q1Question: string;
        q1Answer: string;
        q2Question: string;
        q2Answer: string;
        q3Question: string;
        q3Answer: string;
        source?: 'TELEGRAM' | 'WEB';
      }
    ) =>
      request<{ update: DailyUpdate }>(`/projects/${projectId}/daily-updates`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    listRecent: (limit = 20) =>
      request<{ updates: DailyUpdate[] }>(`/daily-updates/recent?limit=${limit}`)
  }
};
