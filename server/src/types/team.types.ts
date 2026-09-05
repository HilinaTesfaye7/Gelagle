export interface Team {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_at: string;
}

export interface TeamWithMembers extends Team {
  members: Array<{
    userId: string;
    name: string;
    email: string;
    avatar: string | null;
    joinedAt: string;
  }>;
}
