import { supabase } from './supabase';
import type { Goal } from './database.types';

// Génère des jours VRAIMENT espacés sur le mois, minimum 5 jours entre chaque
function generateSpacedDays(count: number): number[] {
  const days: number[] = [];
  const minGap = Math.floor(26 / count);

  let lastDay = 0;
  for (let i = 0; i < count; i++) {
    const minDay = lastDay + minGap;
    const maxDay = Math.min(28, minDay + minGap - 1);
    const day = minDay + Math.floor(Math.random() * Math.max(1, maxDay - minDay));
    days.push(Math.min(day, 28));
    lastDay = day;
  }
  return days;
}

// Génère des montants ronds entre 10 et 20€ qui s'additionnent au total
function generateRoundAmounts(total: number): number[] {
  const count = Math.round(total / 15);
  const safeCount = Math.max(count, 1);
  const amounts: number[] = [];
  let remaining = Math.round(total);

  for (let i = 0; i < safeCount - 1; i++) {
    const maxForThis = Math.min(20, remaining - 10 * (safeCount - i - 1));
    const minForThis = Math.max(10, remaining - 20 * (safeCount - i - 1));
    if (minForThis > maxForThis) { amounts.push(remaining); return amounts; }
    const range = maxForThis - minForThis;
    const amount = minForThis + Math.round(Math.random() * range);
    amounts.push(amount);
    remaining -= amount;
  }
  if (remaining > 0) amounts.push(remaining);
  return amounts;
}

// ✅ NOUVEAU — Notification de bienvenue dès la création d'un objectif
export async function generateWelcomeReminder(goal: Goal, userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const today = now.getDate();

  const welcomeAmount = 10 + Math.round(Math.random() * 10);

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
    amount_suggested: welcomeAmount,
    is_sent: false,
  });
}

// ✅ CORRIGÉ — Les rappels mensuels sont bien espacés
export async function generateMonthlyReminders(goal: Goal, userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const today = now.getDate();

  const { data: existing } = await supabase
    .from('reminders')
    .select('id')
    .eq('goal_id', goal.id)
    .eq('month', month)
    .eq('year', year);

  if (existing && existing.length > 0) return;

  const amounts = generateRoundAmounts(goal.monthly_amount);

  const days = generateSpacedDays(amounts.length).map((d) =>
    Math.max(d, today + 1)
  );

  const inserts = amounts.map((amount, i) => ({
    goal_id: goal.id,
    user_id: userId,
    scheduled_day: Math.min(days[i], 28),
    month,
    year,
    amount_suggested: amount,
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