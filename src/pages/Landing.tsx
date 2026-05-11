import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Shield, Bell, ChevronRight, Target, Wallet, BarChart3 } from 'lucide-react';

// Hook pour détecter quand un élément entre dans le viewport
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// Composant texte qui s'illumine mot par mot au scroll
function IlluminatedText({ text, inView, className = '', delay = 0 }: {
  text: string; inView: boolean; className?: string; delay?: number;
}) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-500"
          style={{
            color: inView ? '#e8edf5' : '#2a3347',
            transitionDelay: inView ? `${delay + i * 60}ms` : '0ms',
          }}
        >
          {word}{i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}

// Composant section animée
function AnimatedSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const features = [
  { icon: Target, title: 'Objectifs clairs', desc: 'Définissez votre projet, votre montant et votre date. Kpital calcule votre mensualité automatiquement.' },
  { icon: Bell, title: 'Rappels intelligents', desc: 'Des rappels espacés tout au long du mois pour vous aider à atteindre votre objectif en douceur.' },
  { icon: BarChart3, title: 'Progression en temps réel', desc: 'Suivez votre avancement avec des indicateurs visuels simples et motivants.' },
  { icon: Wallet, title: 'Petits versements', desc: "Plutôt qu'un gros effort mensuel, Kpital vous guide vers de petits gestes réguliers." },
  { icon: TrendingUp, title: 'Multi-projets', desc: 'Gérez plusieurs objectifs en parallèle — voyage, voiture, études, urgences.' },
  { icon: Shield, title: 'Données sécurisées', desc: "Vos informations sont protégées. Aucune donnée bancaire n'est jamais collectée." },
];

const goals = [
  { name: 'Voyage au Japon', pct: 68, current: '2 040', target: '3 000', color: '#4d9eff' },
  { name: 'Nouvelle voiture', pct: 32, current: '3 200', target: '10 000', color: '#4d9eff' },
  { name: "Fonds d'urgence", pct: 91, current: '2 730', target: '3 000', color: '#56e39f' },
];

// Barre de progression animée
function AnimatedBar({ pct, color, inView, delay }: { pct: number; color: string; inView: boolean; delay: number }) {
  return (
    <div className="h-1.5 bg-[#1c2230] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{
          width: inView ? `${pct}%` : '0%',
          background: `linear-gradient(90deg, ${color}, #6eb8ff)`,
          transitionDelay: `${delay}ms`,
        }}
      />
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  // Hero
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { setTimeout(() => setHeroVisible(true), 100); }, []);

  // Dashboard
  const { ref: dashRef, inView: dashInView } = useInView(0.2);

  // Features
  const { ref: featRef, inView: featInView } = useInView(0.1);

  // Steps
  const { ref: stepsRef, inView: stepsInView } = useInView(0.1);

  // CTA
  const { ref: ctaRef, inView: ctaInView } = useInView(0.2);

  return (
    <div className="min-h-screen bg-[#080c12] text-white overflow-x-hidden">

      {/* Header */}
      <header
        className="border-b border-[#1c2230]/50 sticky top-0 z-50 bg-[#080c12]/95 backdrop-blur-sm"
        style={{ opacity: heroVisible ? 1 : 0, transition: 'opacity 0.5s ease' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-base tracking-tight text-white">Kpital</span>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/auth')}
              className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5">
              Connexion
            </button>
            <button onClick={() => navigate('/auth?mode=signup')}
              className="text-xs bg-[#4d9eff] hover:bg-[#6eb8ff] text-white font-medium px-4 py-1.5 rounded-lg transition-colors">
              S'inscrire
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#4d9eff]/6 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 bg-[#4d9eff]/10 border border-[#4d9eff]/20 text-[#4d9eff] text-xs px-3 py-1 rounded-full mb-8"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.6s ease 0ms' }}
          >
            <span className="w-1.5 h-1.5 bg-[#4d9eff] rounded-full animate-pulse" />
            Beta — Épargne progressive
          </div>

          {/* Titre */}
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight mb-5 tracking-tight"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease 150ms' }}
          >
            Atteignez vos projets<br />
            <span className="text-[#4d9eff]">un petit pas à la fois</span>
          </h1>

          {/* Sous-titre */}
          <p
            className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-10"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease 300ms' }}
          >
            Kpital vous aide à épargner pour ce qui compte vraiment. Des rappels intelligents vous guident
            tout au long du mois pour atteindre votre objectif sans effort.
          </p>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease 450ms' }}
          >
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="flex items-center gap-2 bg-[#4d9eff] hover:bg-[#6eb8ff] text-white font-medium text-sm px-6 py-3 rounded-xl transition-all hover:shadow-[0_0_40px_rgba(77,158,255,0.25)] group"
            >
              Commencer gratuitement
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => navigate('/auth')}
              className="text-sm text-gray-500 hover:text-white transition-colors px-4 py-3">
              J'ai déjà un compte
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard preview animé */}
      <section className="px-6 pb-20">
        <div
          ref={dashRef}
          className="max-w-2xl mx-auto"
          style={{
            opacity: dashInView ? 1 : 0,
            transform: dashInView ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
            transition: 'all 0.8s ease',
          }}
        >
          <div className="bg-[#0d1117] border border-[#1c2230] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs text-gray-500 font-medium">Aperçu du tableau de bord</p>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#1c2230]" />
                <div className="w-2 h-2 rounded-full bg-[#1c2230]" />
                <div className="w-2 h-2 rounded-full bg-[#4d9eff]/40" />
              </div>
            </div>
            {goals.map((item, i) => (
              <div key={item.name} className="mb-5 last:mb-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-300 font-medium">{item.name}</span>
                  <span className="text-xs font-medium" style={{ color: item.color }}>{item.pct}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                  <span>{item.current} €</span>
                  <span>{item.target} €</span>
                </div>
                <AnimatedBar pct={item.pct} color={item.color} inView={dashInView} delay={i * 200} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phrase illuminée */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          {(() => {
            const { ref, inView } = useInView(0.3);
            return (
              <div ref={ref}>
                <p className="text-2xl sm:text-3xl font-semibold leading-relaxed tracking-tight">
                  <IlluminatedText
                    text="Chaque grand projet commence"
                    inView={inView}
                    delay={0}
                  />
                  {' '}
                  <IlluminatedText
                    text="par un premier versement."
                    inView={inView}
                    delay={300}
                    className="text-[#4d9eff]"
                  />
                </p>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs text-[#4d9eff] font-medium uppercase tracking-widest mb-3">Comment ça marche</p>
            <h2 className="text-2xl font-bold">En 3 étapes, c'est lancé</h2>
          </AnimatedSection>

          <div ref={stepsRef} className="flex flex-col gap-0">
            {[
              { num: '01', title: 'Créez votre objectif', desc: "Donnez un nom à votre projet, entrez le montant cible et la date souhaitée. Kpital calcule automatiquement votre mensualité." },
              { num: '02', title: 'Recevez vos rappels', desc: "Tout au long du mois, des rappels intelligents vous invitent à mettre de côté de petites sommes. Jamais trop, jamais trop tard." },
              { num: '03', title: 'Atteignez votre but', desc: "Dès l'objectif atteint, accédez à des offres exclusives de nos partenaires pour concrétiser votre projet." },
            ].map((step, i) => (
              <div
                key={step.num}
                className="flex gap-6 py-8 border-b border-[#1c2230] last:border-none"
                style={{
                  opacity: stepsInView ? 1 : 0,
                  transform: stepsInView ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `all 0.6s ease ${i * 150}ms`,
                }}
              >
                <div className="text-2xl font-bold text-[#1c2230] w-10 flex-shrink-0 pt-0.5">{step.num}</div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-10">
            <p className="text-xs text-[#4d9eff] font-medium uppercase tracking-widest mb-3">Fonctionnalités</p>
            <h2 className="text-2xl font-bold mb-2">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 text-sm">Simple, efficace, sans friction.</p>
          </AnimatedSection>

          <div ref={featRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-[#0d1117] border border-[#1c2230] rounded-xl p-5 hover:border-[#4d9eff]/30 transition-all hover:-translate-y-0.5"
                style={{
                  opacity: featInView ? 1 : 0,
                  transform: featInView ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease ${i * 80}ms`,
                }}
              >
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

      {/* CTA final */}
      <section className="px-6 pb-24">
        <div
          ref={ctaRef}
          className="max-w-2xl mx-auto text-center bg-gradient-to-b from-[#0d1a30] to-[#0d1117] border border-[#4d9eff]/20 rounded-2xl p-12"
          style={{
            opacity: ctaInView ? 1 : 0,
            transform: ctaInView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.7s ease',
          }}
        >
          <div className="inline-flex items-center gap-2 bg-[#4d9eff]/10 border border-[#4d9eff]/20 text-[#4d9eff] text-xs px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-[#4d9eff] rounded-full animate-pulse" />
            Accès beta gratuit
          </div>
          <h2 className="text-2xl font-bold mb-3">Prêt à commencer ?</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Rejoignez Kpital et transformez vos projets en réalité,<br />un versement à la fois.
          </p>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="inline-flex items-center gap-2 bg-[#4d9eff] hover:bg-[#6eb8ff] text-white font-medium text-sm px-8 py-3.5 rounded-xl transition-all hover:shadow-[0_0_40px_rgba(77,158,255,0.3)] group"
          >
            Créer mon compte gratuitement
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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