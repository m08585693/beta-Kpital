import { supabase } from './supabase';
import type { Goal } from './database.types';

// ✅ Notification de bienvenue dès la création d'un objectif
export async function generateWelcomeReminder(goal: Goal, userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const today = now.getDate();

  const { data: existing } = await supabase
    .from('reminders')
    .select('id')
    .eq('goal_id', goal.id)
    .eq('scheduled_day', today)
    .eq('month', month)
    .eq('year', year);

  if (existing && existing.length > 0) return;

  await supabase.from('reminders').insert({
    goal_id: goal.id,
    user_id: userId,
    scheduled_day: today,
    month,
    year,
    amount_suggested: 10,
    is_sent: false,
  });
}

// ✅ Génère un unique rappel mensuel
export async function generateMonthlyReminders(goal: Goal, userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const targetDay = Math.min(goal.target_date ? new Date(goal.target_date).getDate() : 15, 28);

  const { data: existing } = await supabase
    .from('reminders')
    .select('id')
    .eq('goal_id', goal.id)
    .eq('month', month)
    .eq('year', year);

  if (existing && existing.length > 0) return;

  const amount = Math.max(10, Math.round(goal.monthly_amount / 3 / 10) * 10);

  await supabase.from('reminders').insert({
    goal_id: goal.id,
    user_id: userId,
    scheduled_day: targetDay,
    month,
    year,
    amount_suggested: amount,
    is_sent: false,
  });
}

export async function getTodayReminders(userId: string, goals: Goal[]) {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('scheduled_day', day)
    .eq('month', month)
    .eq('year', year)
    .eq('is_sent', false)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return [];

  const goal = goals.find((g) => g.id === data[0].goal_id);
  return [{ reminder: data[0], goal }];
}

export async function markReminderSent(reminderId: string) {
  await supabase.from('reminders').update({ is_sent: true }).eq('id', reminderId);
}