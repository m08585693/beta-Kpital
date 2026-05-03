interface ProgressBarProps {
  current: number;
  target: number;
  className?: string;
}

export default function ProgressBar({ current, target, className = '' }: ProgressBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
        <span>{current.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-[#1c2230] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(90deg, #4d9eff, #56e39f)'
              : 'linear-gradient(90deg, #4d9eff, #6eb8ff)',
          }}
        />
      </div>
    </div>
  );
}
