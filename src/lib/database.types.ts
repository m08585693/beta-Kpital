export interface Database {
  public: {
    Tables: {
      goals: {
        Row: Goal;
        Insert: GoalInsert;
        Update: Partial<GoalInsert>;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: Partial<PaymentInsert>;
      };
      reminders: {
        Row: Reminder;
        Insert: ReminderInsert;
        Update: Partial<ReminderInsert>;
      };
      goal_members: {
        Row: GoalMember;
        Insert: GoalMemberInsert;
        Update: Partial<GoalMemberInsert>;
      };
      goal_invitations: {
        Row: GoalInvitation;
        Insert: GoalInvitationInsert;
        Update: Partial<GoalInvitationInsert>;
      };
    };
  };
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  monthly_amount: number;
  created_at: string;
}

export interface GoalInsert {
  user_id: string;
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date: string;
  monthly_amount: number;
}

export interface Payment {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  note: string;
  created_at: string;
}

export interface PaymentInsert {
  goal_id: string;
  user_id: string;
  amount: number;
  note?: string;
}

export interface Reminder {
  id: string;
  goal_id: string;
  user_id: string;
  scheduled_day: number;
  month: number;
  year: number;
  amount_suggested: number;
  is_sent: boolean;
  created_at: string;
}

export interface ReminderInsert {
  goal_id: string;
  user_id: string;
  scheduled_day: number;
  month: number;
  year: number;
  amount_suggested: number;
  is_sent?: boolean;
}

export interface GoalMember {
  id: string;
  goal_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface GoalMemberInsert {
  goal_id: string;
  user_id: string;
  role: 'owner' | 'member';
}

export interface GoalInvitation {
  id: string;
  goal_id: string;
  invited_email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at: string | null;
}

export interface GoalInvitationInsert {
  goal_id: string;
  invited_email: string;
  invited_by: string;
  status?: 'pending' | 'accepted' | 'rejected';
}