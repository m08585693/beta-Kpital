import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateWelcomeReminder } from '../lib/reminders';
import { addOwnerToGoal } from '../lib/invitations'; // ← AJOUT

function calcMonthlyAmount(target: number, targetDate: string): number {
  if (!target || !targetDate) return 0;
  const now = new Date();
  const end = new Date(targetDate);
  const months = Math.max(1, (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()));
  return Math.round(target / months);
}

function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

const projectSuggestions = [
  'Voyage au Japon', 'Nouvelle voiture', 'Études supérieures', 'Fonds d\'urgence',
  'Rénovation', 'Mariage', 'Permis de conduire', 'MacBook',
];

export default function CreateGoal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const monthly = calcMonthlyAmount(Number(targetAmount), targetDate);
  const now = new Date();
  const minDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    const { data, error } = await supabase.from('goals').insert({
      user_id: user.id,
      name,
      target_amount: Number(targetAmount),
      target_date: targetDate,
      monthly_amount: monthly,
      current_amount: 0,
    }).select().single();

    setLoading(false);

    if (error || !data) {
      setError('Une erreur est survenue. Réessayez.');
    } else {
      // ✅ Notification de bienvenue immédiate dès la création
      await generateWelcomeReminder(data, user.id);
      // ✅ Enregistre le créateur comme owner du goal
      await addOwnerToGoal(data.id); // ← AJOUT
      navigate('/dashboard');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors text-xs mb-6"
        >
          <ArrowLeft size={12} />
          Retour au tableau de bord
        </button>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-white mb-1">Nouvel objectif</h1>
          <p className="text-gray-500 text-xs">Définissez votre projet et nous calculerons votre mensualité.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Nom du projet</label>
            <input
              type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              required placeholder="Ex: Voyage au Japon"
              className="w-full bg-[#0d1117] border border-[#1c2230] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4d9eff]/60 transition-colors"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {projectSuggestions.map((s) => (
                <button key={s} type="button" onClick={() => setName(s)}
                  className="text-xs bg-[#1c2230] hover:bg-[#2a3347] text-gray-400 hover:text-white px-2 py-0.5 rounded-md transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Montant cible (€)</label>
            <input
              type="number" value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required min="1" step="1" placeholder="3 000"
              className="w-full bg-[#0d1117] border border-[#1c2230] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4d9eff]/60 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Date souhaitée</label>
            <input
              type="date" value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required min={minDate}
              className="w-full bg-[#0d1117] border border-[#1c2230] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#4d9eff]/60 transition-colors [color-scheme:dark]"
            />
          </div>

          {monthly > 0 && (
            <div className="bg-[#4d9eff]/5 border border-[#4d9eff]/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator size={13} className="text-[#4d9eff]" />
                <span className="text-xs text-[#4d9eff] font-medium">Mensualité calculée</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{formatEur(monthly)}</span>
                <span className="text-xs text-gray-500">/ mois</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Kpital vous enverra des rappels pour atteindre ce montant progressivement chaque mois.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name || !targetAmount || !targetDate}
            className="w-full bg-[#4d9eff] hover:bg-[#6eb8ff] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Création...' : 'Créer cet objectif'}
          </button>
        </form>
      </div>
    </Layout>
  );
}