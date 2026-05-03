import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Target, ExternalLink } from 'lucide-react';
import ProgressBar from './ProgressBar';
import type { Goal } from '../lib/database.types';

function monthsRemaining(targetDate: string): number {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(0, diff);
}

function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

interface GoalCardProps {
  goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
  const navigate = useNavigate();
  const months = monthsRemaining(goal.target_date);
  const pct = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;

  return (
    <div className="w-full">
      <button
        onClick={() => navigate(`/goals/${goal.id}`)}
        className="w-full text-left bg-[#0d1117] border border-[#1c2230] rounded-2xl p-5 hover:border-[#4d9eff]/40 hover:bg-[#111827] transition-all duration-200 group"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-sm group-hover:text-[#4d9eff] transition-colors">
              {goal.name}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {formatEur(goal.target_amount)} visés
            </p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              pct >= 100
                ? 'bg-emerald-500/10 text-emerald-400'
                : pct >= 50
                ? 'bg-[#4d9eff]/10 text-[#4d9eff]'
                : 'bg-gray-500/10 text-gray-400'
            }`}
          >
            {pct >= 100 ? 'Terminé ✓' : `${pct.toFixed(0)}%`}
          </span>
        </div>

        <ProgressBar current={goal.current_amount} target={goal.target_amount} className="mb-4" />

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <TrendingUp size={11} className="text-[#4d9eff]" />
            {formatEur(goal.monthly_amount)}/mois
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {months > 0 ? `${months} mois restants` : 'Échéance dépassée'}
          </span>
          <span className="flex items-center gap-1">
            <Target size={11} />
            {new Date(goal.target_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </button>

      {/* ── OFFRE EXCLUSIVE SKIPPAIR (visible uniquement quand le projet est terminé) ── */}
      {pct >= 100 && (
        <div className="mt-2 rounded-2xl border border-yellow-400/25 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🎉</span>
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              Offre exclusive — Projet accompli
            </p>
          </div>

          <a
            href="https://skippair.com/fr/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-start justify-between gap-3 group/link"
          >
            <div className="flex items-start gap-2">
              <span className="text-xl mt-0.5">⛵</span>
              <div>
                <p className="text-white font-semibold text-sm group-hover/link:text-yellow-400 transition-colors leading-snug">
                  Croisière voilier ou catamaran
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Embarquez avec un skipper pro !
                </p>
              </div>
            </div>
            <ExternalLink
              size={14}
              className="text-yellow-400/60 group-hover/link:text-yellow-400 transition-colors mt-1 flex-shrink-0"
            />
          </a>

          <div className="mt-3 pt-2 border-t border-yellow-400/10 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Partenaire certifié <span className="text-yellow-400/70 font-medium">Kpital</span>
            </p>
            <span className="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
              Réservé aux membres
            </span>
          </div>
        </div>
      )}
    </div>
  );
}