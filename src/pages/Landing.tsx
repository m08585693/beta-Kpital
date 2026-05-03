import { useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Bell, ChevronRight, Target, Wallet, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Objectifs clairs',
    desc: 'Définissez votre projet, votre montant et votre date. Kpital calcule votre mensualité automatiquement.',
  },
  {
    icon: Bell,
    title: 'Rappels intelligents',
    desc: 'Des rappels espacés tout au long du mois pour vous aider à atteindre votre objectif en douceur.',
  },
  {
    icon: BarChart3,
    title: 'Progression en temps réel',
    desc: 'Suivez votre avancement avec des indicateurs visuels simples et motivants.',
  },
  {
    icon: Wallet,
    title: 'Petits versements',
    desc: 'Plutôt qu\'un gros effort mensuel, Kpital vous guide vers de petits gestes réguliers.',
  },
  {
    icon: TrendingUp,
    title: 'Multi-projets',
    desc: 'Gérez plusieurs objectifs en parallèle — voyage, voiture, études, urgences.',
  },
  {
    icon: Shield,
    title: 'Données sécurisées',
    desc: 'Vos informations sont protégées. Aucune donnée bancaire n\'est jamais collectée.',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080c12] text-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-[#1c2230]/50 sticky top-0 z-50 bg-[#080c12]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-base tracking-tight">Kpital</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Connexion
            </button>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="text-xs bg-[#4d9eff] hover:bg-[#6eb8ff] text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#4d9eff]/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#4d9eff]/10 border border-[#4d9eff]/20 text-[#4d9eff] text-xs px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-[#4d9eff] rounded-full animate-pulse" />
            Épargne progressive et automatisée
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5 tracking-tight">
            Atteignez vos projets<br />
            <span className="text-[#4d9eff]">un petit pas à la fois</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
            Kpital vous aide à épargner pour ce qui compte vraiment — voyage, voiture, études. Des rappels
            intelligents vous guident tout au long du mois pour atteindre votre objectif sans effort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="flex items-center gap-2 bg-[#4d9eff] hover:bg-[#6eb8ff] text-white font-medium text-sm px-6 py-3 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(77,158,255,0.3)] group"
            >
              Commencer gratuitement
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-3"
            >
              J'ai déjà un compte
            </button>
          </div>
        </div>
      </section>

      {/* Mock dashboard preview */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0d1117] border border-[#1c2230] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">Tableau de bord</p>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#1c2230]" />
                <div className="w-2 h-2 rounded-full bg-[#1c2230]" />
                <div className="w-2 h-2 rounded-full bg-[#4d9eff]/40" />
              </div>
            </div>
            {[
              { name: 'Voyage au Japon', pct: 68, current: '2 040', target: '3 000', color: '#4d9eff' },
              { name: 'Nouvelle voiture', pct: 32, current: '3 200', target: '10 000', color: '#4d9eff' },
              { name: 'Fonds d\'urgence', pct: 91, current: '2 730', target: '3 000', color: '#56e39f' },
            ].map((item) => (
              <div key={item.name} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-gray-300">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.pct}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{item.current} €</span>
                  <span>{item.target} €</span>
                </div>
                <div className="h-1.5 bg-[#1c2230] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.pct}%`, background: `linear-gradient(90deg, ${item.color}, #6eb8ff)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-400 text-sm">Simple, efficace, sans friction.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-[#0d1117] border border-[#1c2230] rounded-xl p-5 hover:border-[#4d9eff]/30 transition-colors">
                <div className="w-8 h-8 bg-[#4d9eff]/10 rounded-lg flex items-center justify-center mb-3">
                  <f.icon size={15} className="text-[#4d9eff]" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-b from-[#0d1a30] to-[#0d1117] border border-[#4d9eff]/20 rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-3">Prêt à commencer ?</h2>
          <p className="text-gray-400 text-sm mb-6">
            Rejoignez Kpital et transformez vos projets en réalité, un versement à la fois.
          </p>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="inline-flex items-center gap-2 bg-[#4d9eff] hover:bg-[#6eb8ff] text-white font-medium text-sm px-6 py-3 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(77,158,255,0.3)]"
          >
            Créer mon compte gratuitement
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1c2230] px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xs text-gray-600 font-bold">Kpital</span>
          <span className="text-xs text-gray-600">© 2026 — Épargne progressive</span>
        </div>
      </footer>
    </div>
  );
}
