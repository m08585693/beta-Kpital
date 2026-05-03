import { supabase } from './supabase';
import type { Goal } from './database.types';

function generateRandomDays(count: number): number[] {
  const days: number[] = [];
  const segments = Array.from({ length: count }, (_, i) => ({
    start: Math.floor((i * 28) / count) + 1,
    end: Math.floor(((i + 1) * 28) / count),
  }));
  for (const seg of segments) {
    const day = seg.start + Math.floor(Math.random() * (seg.end - seg.start + 1));
    days.push(day);
  }
  return days;
}

export async function generateMonthlyReminders(goal: Goal, userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: existing } = await supabase
    .from('reminders')
    .select('id')
    .eq('goal_id', goal.id)
    .eq('month', month)
    .eq('year', year);

  if (existing && existing.length > 0) return;

  const days = generateRandomDays(3);
  const amountPerReminder = goal.monthly_amount / 3;

  const inserts = days.map((day) => ({
    goal_id: goal.id,
    user_id: userId,
    scheduled_day: day,
    month,
    year,
    amount_suggested: Math.ceil(amountPerReminder * 100) / 100,
    is_sent: false,
  }));

  await supabase.from('reminders').insert(inserts);
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
    .eq('is_sent', false);

  if (!data || data.length === 0) return [];

  return data.map((reminder) => {
    const goal = goals.find((g) => g.id === reminder.goal_id);
    return { reminder, goal };
  });
}

export async function markReminderSent(reminderId: string) {
  await supabase.from('reminders').update({ is_sent: true }).eq('id', reminderId);
}
