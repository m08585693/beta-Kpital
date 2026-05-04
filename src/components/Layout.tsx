import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, PlusCircle, Handshake } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#080c12] text-white">
      <header className="border-b border-[#1c2230] sticky top-0 z-50 bg-[#080c12]/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white font-bold text-base tracking-tight hover:text-[#4d9eff] transition-colors"
          >
            Kpital
          </button>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-lg ${
                location.pathname === '/dashboard'
                  ? 'text-[#4d9eff] bg-[#4d9eff]/10'
                  : 'text-gray-400 hover:text-white hover:bg-[#1c2230]'
              }`}
            >
              <LayoutDashboard size={13} />
              <span className="hidden sm:inline">Tableau de bord</span>
            </button>
            <button
              onClick={() => navigate('/partners')}
              className={`flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-lg ${
                location.pathname === '/partners'
                  ? 'text-[#4d9eff] bg-[#4d9eff]/10'
                  : 'text-gray-400 hover:text-white hover:bg-[#1c2230]'
              }`}
            >
              <Handshake size={13} />
              <span className="hidden sm:inline">Nos partenaires</span>
            </button>
            <button
              onClick={() => navigate('/goals/new')}
              className="flex items-center gap-1.5 text-xs bg-[#4d9eff]/10 text-[#4d9eff] hover:bg-[#4d9eff]/20 transition-colors px-3 py-1.5 rounded-lg border border-[#4d9eff]/20"
            >
              <PlusCircle size={13} />
              <span className="hidden sm:inline">Nouvel objectif</span>
            </button>
            <div className="w-px h-5 bg-[#1c2230] mx-1" />
            <span className="text-xs text-gray-500 hidden sm:inline truncate max-w-[120px]">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-[#1c2230]"
              title="Se déconnecter"
            >
              <LogOut size={14} />
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}