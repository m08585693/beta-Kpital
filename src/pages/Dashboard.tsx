import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, TrendingUp, Target, Wallet } from 'lucide-react';
import Layout from '../components/Layout';
import GoalCard from '../components/GoalCard';
import ReminderBanner from '../components/ReminderBanner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateMonthlyReminders, getTodayReminders } from '../lib/reminders';
import type { Goal, Reminder } from '../lib/database.types';

interface ReminderWithGoal {
  reminder: Reminder;
  goal: Goal | undefined;
}

function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<ReminderWithGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const goalList = data ?? [];
      setGoals(goalList);

      for (const goal of goalList) {
        await generateMonthlyReminders(goal, user.id);
      }

      const todayReminders = await getTodayReminders(user.id, goalList);
      setReminders(todayReminders);
    } catch (err) {
      console.error('Erreur chargement objectifs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.reminder.id !== reminderId));
  };

  const handleDeleteGoal = async (id: string) => {
    await supabase.from('payments').delete().eq('goal_id', id);
    await supabase.from('goals').delete().eq('id', id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setDeleteConfirmId(null);
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const completedGoals = goals.filter((g) => g.current_amount >= g.target_amount).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-5 h-5 border-2 border-[#4d9eff] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {reminders.map(({ reminder, goal }) => (
        <ReminderBanner
          key={reminder.id}
          reminder={reminder}
          goal={goal}
          onDismiss={() => handleDismissReminder(reminder.id)}
        />
      ))}

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Bonjour</p>
          <h1 className="text-xl font-bold text-white">Mes objectifs</h1>
        </div>
        <button
          onClick={() => navigate('/goals/new')}
          className="flex items-center gap-1.5 text-xs bg-[#4d9eff]/10 text-[#4d9eff] hover:bg-[#4d9eff]/20 transition-colors px-3 py-2 rounded-lg border border-[#4d9eff]/20"
        >
          <PlusCircle size={12} />
          Nouvel objectif
        </button>
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#0d1117] border border-[#1c2230] rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Wallet size={12} className="text-[#4d9eff]" />
              <span className="text-xs text-gray-500">Total épargné</span>
            </div>
            <p className="text-white font-bold text-sm">{formatEur(totalSaved)}</p>
          </div>
          <div className="bg-[#0d1117] border border-[#1c2230] rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Target size={12} className="text-[#4d9eff]" />
              <span className="text-xs text-gray-500">Objectif total</span>
            </div>
            <p className="text-white font-bold text-sm">{formatEur(totalTarget)}</p>
          </div>
          <div className="bg-[#0d1117] border border-[#1c2230] rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-xs text-gray-500">Complétés</span>
            </div>
            <p className="text-white font-bold text-sm">{completedGoals} / {goals.length}</p>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 bg-[#4d9eff]/10 rounded-2xl flex items-center justify-center mb-4">
            <Target size={20} className="text-[#4d9eff]" />
          </div>
          <h2 className="text-white font-semibold mb-1.5">Aucun objectif pour l'instant</h2>
          <p className="text-gray-500 text-xs mb-5 max-w-xs">
            Créez votre premier objectif d'épargne et commencez à progresser vers vos projets.
          </p>
          <button
            onClick={() => navigate('/goals/new')}
            className="flex items-center gap-1.5 bg-[#4d9eff] hover:bg-[#6eb8ff] text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <PlusCircle size={12} />
            Créer mon premier objectif
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#0d1117] border border-[#1c2230] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold mb-1.5">Supprimer cet objectif ?</h3>
            <p className="text-gray-400 text-xs mb-5">
              Cette action est irréversible. Tous les versements associés seront perdus.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDeleteGoal(deleteConfirmId)}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium py-2 rounded-lg transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-[#1c2230] hover:bg-[#2a3347] text-gray-300 text-xs font-medium py-2 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}