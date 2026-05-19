import { useState } from 'react';
import { Bell, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { markReminderSent } from '../lib/reminders';
import type { Goal, Reminder } from '../lib/database.types';

interface ReminderBannerProps {
  reminder: Reminder;
  goal: Goal | undefined;
  onDismiss: () => void;
}

export default function ReminderBanner({ reminder, goal, onDismiss }: ReminderBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = async () => {
    setDismissed(true);
    await markReminderSent(reminder.id);
    onDismiss();
  };

  if (dismissed || !goal) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#0d2040] to-[#0d1a30] border border-[#4d9eff]/20 rounded-2xl p-4 mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#4d9eff]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bell size={14} className="text-[#4d9eff]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#4d9eff] font-medium mb-0.5">Rappel</p>
          <p className="text-white text-sm font-medium">
            Essayez de mettre <span className="text-[#4d9eff]">{reminder.amount_suggested} €</span> de côté aujourd'hui
          </p>
          <button
            onClick={() => navigate(`/goals/${goal.id}`)}
            className="flex items-center gap-1 text-[#4d9eff] text-xs mt-2 hover:text-[#6eb8ff] transition-colors"
          >
            Ajouter un versement <ChevronRight size={12} />
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
