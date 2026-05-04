import Layout from '../components/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, ExternalLink } from 'lucide-react';

const partners = [
  {
    name: 'Skippair',
    category: 'Voyage',
    emoji: '✈️',
    desc: 'Voyagez en échange de services à bord. Accédez à des croisières et traversées exclusives réservées aux membres Kpital.',
    offers: ['Traversées Méditerranée', 'Croisières Atlantique', 'Tours du monde'],
    url: 'https://www.skippair.com',
    color: '#4d9eff',
  },
  {
    name: 'Agences de voyage',
    category: 'Voyage',
    emoji: '🌍',
    desc: 'Nos partenaires agences vous proposent des offres exclusives dès que vous atteignez votre objectif épargne voyage.',
    offers: ['Séjours sur mesure', 'Vols + hôtel', 'Voyages en groupe'],
    url: '#',
    color: '#4d9eff',
  },
  {
    name: 'Concessionnaires auto',
    category: 'Automobile',
    emoji: '🚗',
    desc: "Des remises exclusives chez nos partenaires automobiles pour l'achat de votre véhicule neuf ou d'occasion.",
    offers: ['Véhicules neufs', 'Véhicules d\'occasion', 'Financement préférentiel'],
    url: '#',
    color: '#a78bfa',
  },
  {
    name: 'Banques partenaires',
    category: 'Finance',
    emoji: '🏦',
    desc: 'Ouvrez un compte rémunéré chez nos partenaires bancaires et faites fructifier votre épargne pendant que vous progressez.',
    offers: ['Compte rémunéré 2%', 'Livret épargne', 'Compte sans frais'],
    url: '#',
    color: '#34d399',
  },
  {
    name: 'Organismes de formation',
    category: 'Études',
    emoji: '🎓',
    desc: 'Financez votre formation ou vos études avec des réductions exclusives chez nos partenaires éducatifs.',
    offers: ['Formations certifiantes', 'Bootcamps', 'Cours en ligne'],
    url: '#',
    color: '#fbbf24',
  },
  {
    name: 'High-tech & équipement',
    category: 'Équipement',
    emoji: '💻',
    desc: "Des offres préférentielles sur l'achat de matériel high-tech, smartphones, ordinateurs et équipements.",
    offers: ['MacBook & iPad', 'Smartphones', 'Équipement bureau'],
    url: '#',
    color: '#f472b6',
  },
];

export default function Partners() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout>
      {/* Navigation onglets */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-[#0d1117] border border-[#1c2230] rounded-xl p-1">
          <button
            onClick={() => navigate('/dashboard')}
            className={`text-xs px-4 py-2 rounded-lg transition-colors font-medium ${
              location.pathname === '/dashboard'
                ? 'bg-[#4d9eff]/10 text-[#4d9eff]'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => navigate('/partners')}
            className={`text-xs px-4 py-2 rounded-lg transition-colors font-medium ${
              location.pathname === '/partners'
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

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-0.5">Exclusif Kpital</p>
        <h1 className="text-xl font-bold text-white">Offres partenaires</h1>
        <p className="text-xs text-gray-500 mt-1">
          Des offres exclusives sélectionnées pour récompenser vos efforts d'épargne.
        </p>
      </div>

      {/* Mise en avant Skippair */}
      <div className="bg-gradient-to-r from-[#0d2040] to-[#0d1117] border border-[#4d9eff]/30 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#4d9eff]/10 border border-[#4d9eff]/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              ✈️
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold text-sm">Skippair</span>
                <span className="text-xs bg-[#4d9eff]/10 text-[#4d9eff] border border-[#4d9eff]/20 px-2 py-0.5 rounded-full">
                  Partenaire exclusif
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                Voyagez en échange de services à bord. Skippair connecte les voyageurs avec des propriétaires
                de bateaux pour des expériences uniques — Méditerranée, Atlantique, tour du monde.
                Offre exclusive pour les membres Kpital.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Croisières Méditerranée', 'Traversées Atlantique', 'Tours du monde'].map((o) => (
                  <span key={o} className="text-xs bg-[#0d1117] border border-[#1c2230] text-gray-400 px-2 py-1 rounded-lg">
                    {o}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <a
            href="https://www.skippair.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs bg-[#4d9eff] hover:bg-[#6eb8ff] text-white font-medium px-4 py-2 rounded-lg transition-colors flex-shrink-0 ml-4"
          >
            Découvrir
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Grille partenaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {partners.slice(1).map((p) => (
          <div
            key={p.name}
            className="bg-[#0d1117] border border-[#1c2230] hover:border-[#4d9eff]/30 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${p.color}10`, border: `0.5px solid ${p.color}30` }}
                >
                  {p.emoji}
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{p.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: p.color }}>{p.category}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{p.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.offers.map((o) => (
                <span key={o} className="text-xs bg-[#111827] border border-[#1c2230] text-gray-500 px-2 py-0.5 rounded-md">
                  {o}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer partenariat */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-600">
          Vous souhaitez devenir partenaire ?{' '}
          <a href="mailto:contact@kpital.fr" className="text-[#4d9eff] hover:underline">
            Contactez-nous
          </a>
        </p>
      </div>
    </Layout>
  );
}