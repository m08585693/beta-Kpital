import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/dashboard');
      } else {
        await signUp(email, password);
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c12] flex items-center justify-center px-4">
      {/* Glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4d9eff]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-white font-bold text-2xl tracking-tight hover:text-[#4d9eff] transition-colors"
          >
            Kpital
          </button>
          <p className="text-xs text-gray-500 mt-2">
            {mode === 'login' ? 'Bon retour parmi nous 👋' : 'Créez votre compte gratuitement'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0d1117] border border-[#1c2230] rounded-2xl p-6">
          {/* Onglets */}
          <div className="flex items-center gap-1 bg-[#080c12] border border-[#1c2230] rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 text-xs py-2 rounded-lg transition-colors font-medium ${
                mode === 'login'
                  ? 'bg-[#4d9eff]/10 text-[#4d9eff]'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 text-xs py-2 rounded-lg transition-colors font-medium ${
                mode === 'signup'
                  ? 'bg-[#4d9eff]/10 text-[#4d9eff]'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="w-full bg-[#080c12] border border-[#1c2230] text-white text-xs rounded-lg px-3 py-2.5 placeholder-gray-600 focus:outline-none focus:border-[#4d9eff]/50 transition-colors"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#080c12] border border-[#1c2230] text-white text-xs rounded-lg px-3 py-2.5 pr-9 placeholder-gray-600 focus:outline-none focus:border-[#4d9eff]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Succès */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <p className="text-xs text-green-400">{success}</p>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#4d9eff] hover:bg-[#6eb8ff] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Se connecter' : "Créer mon compte"}
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          {mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            className="text-[#4d9eff] hover:underline"
          >
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  );
}