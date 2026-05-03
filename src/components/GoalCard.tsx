import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Target } from 'lucide-react';
import ProgressBar from './ProgressBar';
import type { Goal } from '../lib/database.types';

function monthsRemaining(targetDate: string): number {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(0, diff);
}

interface GoalCardProps {
  goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
  const navigate = useNavigate();
  const months = monthsRemaining(goal.target_date);
  const pct = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;

  return (
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
            {goal.target_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} visés
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
          {pct >= 100 ? 'Terminé' : `${pct.toFixed(0)}%`}
        </span>
      </div>

      <ProgressBar current={goal.current_amount} target={goal.target_amount} className="mb-4" />

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <TrendingUp size={11} className="text-[#4d9eff]" />
          {goal.monthly_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}/mois
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
  );
}
