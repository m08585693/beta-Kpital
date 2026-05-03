import { supabase } from './supabase';
import type { Goal } from './database.types';

// Génère des jours aléatoires répartis sur le mois
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

// Génère des montants ronds entre 10 et 20€ qui s'additionnent exactement au total
function generateRoundAmounts(total: number): number[] {
  // Calcule le nombre de rappels nécessaires (entre 10 et 20€ chacun)
  const count = Math.round(total / 15); // 15€ = milieu de la fourchette
  const safeCount = Math.max(count, 1);

  const amounts: number[] = [];
  let remaining = Math.round(total); // Arrondit le total

  for (let i = 0; i < safeCount - 1; i++) {
    // Calcule une borne max pour ne pas dépasser le restant
    const maxForThis = Math.min(20, remaining - 10 * (safeCount - i - 1));
    const minForThis = Math.max(10, remaining - 20 * (safeCount - i - 1));

    if (minForThis > maxForThis) {
      // Sécurité : si les bornes ne sont pas valides, on met ce qui reste
      amounts.push(remaining);
      return amounts;
    }

    // Montant aléatoire rond entre minForThis et maxForThis
    const range = maxForThis - minForThis;
    const amount = minForThis + Math.round(Math.random() * range);
    amounts.push(amount);
    remaining -= amount;
  }

  // Le dernier montant = ce qui reste (toujours rond)
  if (remaining > 0) {
    amounts.push(remaining);
  }

  return amounts;
}

export async function generateMonthlyReminders(goal: Goal, userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Vérifie si les rappels du mois existent déjà
  const { data: existing } = await supabase
    .from('reminders')
    .select('id')
    .eq('goal_id', goal.id)
    .eq('month', month)
    .eq('year', year);

  if (existing && existing.length > 0) return;

  // Génère les montants ronds
  const amounts = generateRoundAmounts(goal.monthly_amount);
  const days = generateRandomDays(amounts.length);

  const inserts = amounts.map((amount, i) => ({
    goal_id: goal.id,
    user_id: userId,
    scheduled_day: days[i],
    month,
    year,
    amount_suggested: amount, // Toujours un nombre rond, sans centimes
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