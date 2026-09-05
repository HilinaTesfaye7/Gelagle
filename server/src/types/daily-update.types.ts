export interface DailyUpdate {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  role: string;
  q1_question: string;
  q1_answer: string;
  q2_question: string;
  q2_answer: string;
  q3_question: string;
  q3_answer: string;
  source: 'TELEGRAM' | 'WEB';
  created_at: string;
}

export interface CreateDailyUpdateDTO {
  projectId: string;
  userId: string;
  userName: string;
  role: string;
  q1Question: string;
  q1Answer: string;
  q2Question: string;
  q2Answer: string;
  q3Question: string;
  q3Answer: string;
  source?: 'TELEGRAM' | 'WEB';
}
