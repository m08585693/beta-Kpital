import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, TrendingUp, Target, Wallet, Bell, Check, X } from 'lucide-react';
import Layout from '../components/Layout';
import GoalCard from '../components/GoalCard';
import ReminderBanner from '../components/ReminderBanner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateMonthlyReminders, getTodayReminders } from '../lib/reminders';
import { getMyInvitations, acceptInvitation, rejectInvitation } from '../lib/invitations';
import type { Goal, Reminder } from '../lib/database.types';

interface ReminderWithGoal {
  reminder: Reminder;
  goal: Goal | undefined;
}

interface Invitation {
  id: string;
  status: string;
  created_at: string;
  expires_at: string;
  goal_id: string;
  goals: { title?: string; target_amount?: number; monthly_amount?: number } | null;
  invited_by: string;
}

function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<ReminderWithGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invitations' | 'partners'>('dashboard');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/partners') setActiveTab('partners');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Chargement des objectifs
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const goalList = data ?? [];
      setGoals(goalList);

      // Génération des rappels mensuels
      for (const goal of goalList) {
        await generateMonthlyReminders(goal, user.id);
      }

      // Rappels du jour
      const todayReminders = await getTodayReminders(user.id, goalList);
      setReminders(todayReminders);
    } catch (err) {
      console.error('Erreur chargement objectifs:', err);
    }

    // Chargement des invitations — séparé pour ne pas bloquer le reste
    try {
      const invitationList = await getMyInvitations();
      setInvitations(invitationList as Invitation[]);
    } catch {
      setInvitations([]);
    }

    setLoading(false);
  };

  const handleDismissReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.reminder.id !== reminderId));
  };

  const handleAccept = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      await acceptInvitation(invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      await loadData();
    } catch {
      // silencieux
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      await rejectInvitation(invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch {
      // silencieux
    } finally {
      setProcessingId(null);
    }
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

      {/* Navigation onglets */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-[#0d1117] border border-[#1c2230] rounded-xl p-1">
          <button
            onClick={() => { setActiveTab('dashboard'); navigate('/dashboard'); }}
            className={`text-xs px-4 py-2 rounded-lg transition-colors font-medium ${
              activeTab === 'dashboard'
                ? 'bg-[#4d9eff]/10 text-[#4d9eff]'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Tableau de bord
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`relative text-xs px-4 py-2 rounded-lg transition-colors font-medium ${
              activeTab === 'invitations'
                ? 'bg-[#4d9eff]/10 text-[#4d9eff]'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Bell size={11} />
              Invitations
              {invitations.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4d9eff] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {invitations.length}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('partners'); navigate('/partners'); }}
            className={`text-xs px-4 py-2 rounded-lg transition-colors font-medium ${
              activeTab === 'partners'
                ? 'bg-[#4d9eff]/10 text-[#4d9eff]'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Partenaires
          </button>
        </div>

        <button
          onClick={() => navigate('/goals/new')}
          className="flex items-center gap-1.5 text-xs bg-[#4d9eff]/10 text-[#4d9eff] hover:bg-[#4d9eff]/20 transition-colors px-3 py-2 rounded-lg border border-[#4d9eff]/20"
        >
          <PlusCircle size={12} />
          Nouvel objectif
        </button>
      </div>

      {/* Onglet Invitations */}
      {activeTab === 'invitations' && (
        <div>
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-0.5">En attente</p>
            <h1 className="text-xl font-bold text-white">Mes invitations</h1>
          </div>

          {invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 bg-[#4d9eff]/10 rounded-2xl flex items-center justify-center mb-4">
                <Bell size={20} className="text-[#4d9eff]" />
              </div>
              <h2 className="text-white font-semibold mb-1.5">Aucune invitation</h2>
              <p className="text-gray-500 text-xs max-w-xs">
                Vous recevrez ici les invitations à rejoindre des objectifs partagés.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div key={inv.id} className="bg-[#0d1117] border border-[#1c2230] rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">
                          {(inv.goals as { name?: string } | null)?.name ?? 'Objectif partagé'}
                        </span>
                      </div>
                      {inv.goals?.target_amount && (
                        <p className="text-xs text-gray-500 mb-0.5">
                          Objectif : <span className="text-gray-300">{formatEur(inv.goals.target_amount)}</span>
                          {inv.goals.monthly_amount && (
                            <> · {formatEur(inv.goals.monthly_amount)}<span className="text-gray-600">/mois</span></>
                          )}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        Reçue le {new Date(inv.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                        {' · '}Expire le {new Date(inv.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReject(inv.id)}
                        disabled={processingId === inv.id}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 border border-[#2a3347] hover:border-red-400/30 px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <X size={11} />
                        Refuser
                      </button>
                      <button
                        onClick={() => handleAccept(inv.id)}
                        disabled={processingId === inv.id}
                        className="flex items-center gap-1 text-xs bg-[#4d9eff] hover:bg-[#6eb8ff] text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Check size={11} />
                        Accepter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet Tableau de bord */}
      {activeTab === 'dashboard' && (
        <>
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-0.5">Bonjour</p>
            <h1 className="text-xl font-bold text-white">Mes objectifs</h1>
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
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}