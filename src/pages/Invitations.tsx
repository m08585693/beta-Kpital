import { useEffect, useState } from 'react';
import { Bell, Check, X, Send, ChevronDown } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  sendInvitation,
} from '../lib/invitations';
import type { Goal } from '../lib/database.types';

interface Invitation {
  id: string;
  status: string;
  created_at: string;
  expires_at: string;
  goal_id: string;
  goals: { name?: string; target_amount?: number; monthly_amount?: number } | null;
  invited_by: string;
}

function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export default function Invitations() {
  const { user } = useAuth();

  // Invitations reçues
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Envoi d'invitation
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    loadInvitations();
    loadGoals();
  }, [user]);

  const loadInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const data = await getMyInvitations();
      setInvitations(data as Invitation[]);
    } catch {
      setInvitations([]);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const loadGoals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setGoals(data ?? []);
  };

  const handleAccept = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      await acceptInvitation(invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
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

  const handleSend = async () => {
    setSendError('');
    setSendSuccess('');
    if (!selectedGoalId) { setSendError('Choisissez un objectif.'); return; }
    if (!email.trim()) { setSendError('Entrez une adresse email.'); return; }
    setSending(true);
    try {
      await sendInvitation(selectedGoalId, email.trim());
      setSendSuccess(`Invitation envoyée à ${email.trim()} !`);
      setEmail('');
      setSelectedGoalId('');
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      {/* Section envoyer une invitation */}
      <div className="mb-8">
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-0.5">Partager un objectif</p>
          <h2 className="text-xl font-bold text-white">Envoyer une invitation</h2>
        </div>

        <div className="bg-[#0d1117] border border-[#1c2230] rounded-2xl p-5 space-y-3">
          {/* Sélection objectif */}
          <div className="relative">
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full appearance-none bg-[#080c12] border border-[#1c2230] text-white text-xs rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-[#4d9eff]/50 transition-colors"
            >
              <option value="">Choisir un objectif…</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Email */}
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Email de la personne à inviter"
              className="flex-1 bg-[#080c12] border border-[#1c2230] text-white text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-[#4d9eff]/50 transition-colors placeholder:text-gray-600"
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-1.5 bg-[#4d9eff] hover:bg-[#6eb8ff] disabled:opacity-40 text-white text-xs font-medium px-4 py-3 rounded-xl transition-colors"
            >
              <Send size={12} />
              {sending ? 'Envoi…' : 'Inviter'}
            </button>
          </div>

          {sendError && <p className="text-xs text-red-400">{sendError}</p>}
          {sendSuccess && <p className="text-xs text-emerald-400">{sendSuccess}</p>}
        </div>
      </div>

      {/* Séparateur */}
      <div className="border-t border-[#1c2230] mb-8" />

      {/* Section invitations reçues */}
      <div>
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-0.5">En attente</p>
          <h2 className="text-xl font-bold text-white">Mes invitations reçues</h2>
        </div>

        {loadingInvitations ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-[#4d9eff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-[#4d9eff]/10 rounded-2xl flex items-center justify-center mb-4">
              <Bell size={20} className="text-[#4d9eff]" />
            </div>
            <h3 className="text-white font-semibold mb-1.5">Aucune invitation</h3>
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
                    <span className="text-white font-semibold text-sm">
                      {inv.goals?.name ?? 'Objectif partagé'}
                    </span>
                    {inv.goals?.target_amount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Objectif : <span className="text-gray-300">{formatEur(inv.goals.target_amount)}</span>
                        {inv.goals.monthly_amount && (
                          <> · {formatEur(inv.goals.monthly_amount)}<span className="text-gray-600">/mois</span></>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Reçue le {new Date(inv.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      {inv.expires_at && (
                        <> · Expire le {new Date(inv.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</>
                      )}
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
    </Layout>
  );
}