import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import ProgressBar from '../components/ProgressBar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Goal, Payment } from '../lib/database.types';

function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function monthlyProgress(payments: Payment[]): number {
  const now = new Date();
  return payments
    .filter((p) => {
      const d = new Date(p.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount, 0);
}

// Confettis
const COLORS = ['#4d9eff', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#ffffff'];

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      r: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: 2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.15,
      drift: (Math.random() - 0.5) * 1.5,
    }));
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        ctx.restore();
        p.y += p.speed;
        p.x += p.drift;
        p.angle += p.spin;
      });
      frame++;
      if (frame < 180) animRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

// Animation texte lettre par lettre
function AnimatedText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [text]);
  return <span className={className}>{displayed}</span>;
}

// Partenaires — à remplacer par vos vrais partenaires
const PARTNERS = [
  { name: 'Voyage Privé', desc: '-15% sur votre prochain voyage', emoji: '✈️', url: '#' },
  { name: 'AutoDiscount', desc: 'Remise exclusive sur véhicules neufs', emoji: '🚗', url: '#' },
  { name: 'Sumeria Bank', desc: 'Compte rémunéré à 2% offert', emoji: '🏦', url: '#' },
];

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const [addAmount, setAddAmount] = useState('');
  const [addNote, setAddNote] = useState('');
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const wasCompleted = useRef(false);

  useEffect(() => {
    if (!user || !id) return;
    loadGoal();
  }, [user, id]);

  const loadGoal = async () => {
    if (!user || !id) return;
    setLoading(true);
    const [{ data: goalData }, { data: paymentsData }] = await Promise.all([
      supabase.from('goals').select('*').eq('id', id).eq('user_id', user.id).maybeSingle(),
      supabase.from('payments').select('*').eq('goal_id', id).order('created_at', { ascending: false }),
    ]);
    if (!goalData) { navigate('/dashboard'); return; }
    const isNowComplete = goalData.current_amount >= goalData.target_amount;
    if (isNowComplete && !wasCompleted.current) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    wasCompleted.current = isNowComplete;
    setGoal(goalData);
    setPayments(paymentsData ?? []);
    setLoading(false);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !goal || !addAmount) return;
    setAdding(true);
    const amount = Number(addAmount);
    const [{ error: payErr }] = await Promise.all([
      supabase.from('payments').insert({ goal_id: goal.id, user_id: user.id, amount, note: addNote }),
    ]);
    if (!payErr) {
      await supabase.from('goals').update({ current_amount: goal.current_amount + amount }).eq('id', goal.id);
    }
    setAdding(false);
    setAddAmount('');
    setAddNote('');
    setShowForm(false);
    loadGoal();
  };

  const handleDeleteGoal = async () => {
    if (!goal) return;
    await supabase.from('goals').delete().eq('id', goal.id);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-5 h-5 border-2 border-[#4d9eff] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!goal) return null;

  const pct = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;
  const isCompleted = pct >= 100;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const thisMonth = monthlyProgress(payments);
  const monthRemaining = Math.max(0, goal.monthly_amount - thisMonth);
  const now = new Date();
  const targetDateObj = new Date(goal.target_date);
  const monthsLeft = Math.max(0, (targetDateObj.getFullYear() - now.getFullYear()) * 12 + (targetDateObj.getMonth() - now.getMonth()));

  return (
    <Layout>
      <Confetti active={showConfetti} />

      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors text-xs mb-6"
        >
          <ArrowLeft size={12} />
          Tableau de bord
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white mb-0.5">{goal.name}</h1>
            <p className="text-gray-500 text-xs">
              Créé le {new Date(goal.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="text-gray-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* 2 colonnes si objectif atteint */}
        <div className={isCompleted ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}>

          {/* Colonne gauche */}
          <div>
            {/* Progress block */}
            <div className="bg-[#0d1117] border border-[#1c2230] rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Progression globale</span>
                <span className={`text-xs font-medium ${isCompleted ? 'text-emerald-400' : 'text-[#4d9eff]'}`}>
                  {pct.toFixed(1)}%
                </span>
              </div>
              <ProgressBar current={goal.current_amount} target={goal.target_amount} className="mb-4" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Épargné</p>
                  <p className="text-white font-semibold text-sm">{formatEur(goal.current_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Objectif</p>
                  <p className="text-white font-semibold text-sm">{formatEur(goal.target_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Restant</p>
                  <p className="text-white font-semibold text-sm">{formatEur(remaining)}</p>
                </div>
              </div>
            </div>

            {/* Monthly — masqué si terminé */}
            {!isCompleted && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#0d1117] border border-[#1c2230] rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp size={11} className="text-[#4d9eff]" />
                      <span className="text-xs text-gray-500">Ce mois-ci</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{formatEur(thisMonth)}</p>
                    <p className="text-xs text-gray-600 mt-0.5">sur {formatEur(goal.monthly_amount)} prévus</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#1c2230] rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Clock size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Délai</span>
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {monthsLeft > 0 ? `${monthsLeft} mois` : 'Échu'}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {new Date(goal.target_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {monthRemaining > 0 && (
                  <div className="bg-[#4d9eff]/5 border border-[#4d9eff]/15 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-gray-400">
                      Il vous reste{' '}
                      <span className="text-[#4d9eff] font-semibold">{formatEur(monthRemaining)}</span>{' '}
                      à verser ce mois pour atteindre votre mensualité.
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  {!showForm ? (
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-1.5 w-full justify-center bg-[#4d9eff]/10 border border-[#4d9eff]/20 text-[#4d9eff] hover:bg-[#4d9eff]/20 transition-colors text-xs font-medium py-3 rounded-xl"
                    >
                      <Plus size={13} />
                      Ajouter un versement
                    </button>
                  ) : (
                    <form onSubmit={handleAddPayment} className="bg-[#0d1117] border border-[#1c2230] rounded-xl p-4 space-y-3">
                      <p className="text-xs text-gray-400 font-medium">Nouveau versement</p>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Montant (€)</label>
                        <input
                          type="number" value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          required min="1" step="1"
                          placeholder={monthRemaining > 0 ? String(Math.round(monthRemaining)) : '50'}
                          className="w-full bg-[#1c2230] border border-[#2a3347] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4d9eff]/60 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Note (optionnel)</label>
                        <input
                          type="text" value={addNote}
                          onChange={(e) => setAddNote(e.target.value)}
                          placeholder="Ex: Virement du 15"
                          className="w-full bg-[#1c2230] border border-[#2a3347] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4d9eff]/60 transition-colors"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={adding}
                          className="flex-1 bg-[#4d9eff] hover:bg-[#6eb8ff] disabled:opacity-50 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                          {adding ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button type="button"
                          onClick={() => { setShowForm(false); setAddAmount(''); setAddNote(''); }}
                          className="px-3 py-2 text-xs text-gray-400 hover:text-white border border-[#2a3347] rounded-lg transition-colors">
                          Annuler
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            )}

            {/* Historique */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-3">Historique des versements</h2>
              {payments.length === 0 ? (
                <div className="text-center py-10 text-gray-600 text-xs">Aucun versement enregistré.</div>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => {
                    const d = new Date(payment.created_at);
                    const isThisMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    return (
                      <div key={payment.id} className="flex items-center justify-between bg-[#0d1117] border border-[#1c2230] rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isThisMonth ? 'bg-[#4d9eff]' : 'bg-gray-600'}`} />
                          <div>
                            <p className="text-white text-xs font-medium">{formatEur(payment.amount)}</p>
                            {payment.note && <p className="text-gray-500 text-xs">{payment.note}</p>}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite — partenaires */}
          {isCompleted && (
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-[#0d2040] to-[#0d1117] border border-[#4d9eff]/30 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">🎉</div>
                <h2 className="text-lg font-bold text-white mb-2">
                  <AnimatedText text="Félicitations !" />
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Vous avez atteint votre objectif{' '}
                  <span className="text-[#4d9eff] font-semibold">{goal.name}</span>.
                  Profitez maintenant des offres exclusives de nos partenaires.
                </p>
              </div>

              <div className="bg-[#0d1117] border border-[#1c2230] rounded-2xl p-5">
                <p className="text-xs text-[#4d9eff] font-medium mb-4 uppercase tracking-wider">
                  Offres exclusives partenaires :
                </p>
                <div className="flex flex-col gap-3">
                  {PARTNERS.map((p) => (
                    <a key={p.name} href={p.url}
                      className="flex items-center gap-4 bg-[#111827] border border-[#1c2230] hover:border-[#4d9eff]/40 rounded-xl p-4 transition-all group"
                    >
                      <div className="w-10 h-10 bg-[#0d2040] border border-[#1a3a6a] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {p.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-xs font-semibold group-hover:text-[#4d9eff] transition-colors">{p.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{p.desc}</p>
                      </div>
                      <ExternalLink size={12} className="text-gray-600 group-hover:text-[#4d9eff] transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-600 text-center">
                Vous êtes intéressé par un partenariat ?{' '}
                <a href="mailto:contact@kpital.fr" className="text-[#4d9eff] hover:underline">Contactez-nous</a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#0d1117] border border-[#1c2230] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold mb-1.5">Supprimer cet objectif ?</h3>
            <p className="text-gray-400 text-xs mb-5">Cette action est irréversible. Tous les versements associés seront perdus.</p>
            <div className="flex gap-2">
              <button onClick={handleDeleteGoal}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium py-2 rounded-lg transition-colors">
                Supprimer
              </button>
              <button onClick={() => setDeleteConfirm(false)}
                className="flex-1 bg-[#1c2230] hover:bg-[#2a3347] text-gray-300 text-xs font-medium py-2 rounded-lg transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}