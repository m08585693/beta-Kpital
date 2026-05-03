import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signIn, signUp, user } = useAuth();

  const [isSignUp, setIsSignUp] = useState(params.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login')) {
        setError('Email ou mot de passe incorrect.');
      } else if (error.message.includes('already registered')) {
        setError('Cet email est déjà utilisé. Essayez de vous connecter.');
      } else if (error.message.includes('Password should be')) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      } else {
        setError(error.message);
      }
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c12] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors text-xs mb-8"
        >
          <ArrowLeft size={12} />
          Retour à l'accueil
        </button>

        <div className="mb-8">
          <h1 className="text-xl font-bold text-white mb-1">
            {isSignUp ? 'Créer un compte' : 'Bon retour'}
          </h1>
          <p className="text-gray-500 text-xs">
            {isSignUp
              ? 'Commencez à épargner pour vos projets dès aujourd\'hui.'
              : 'Connectez-vous pour voir votre progression.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5" htmlFor="email">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="vous@exemple.com"
              className="w-full bg-[#0d1117] border border-[#1c2230] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4d9eff]/60 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5" htmlFor="password">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-[#0d1117] border border-[#1c2230] rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4d9eff]/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4d9eff] hover:bg-[#6eb8ff] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors mt-1"
          >
            {loading ? 'Chargement...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-[#4d9eff] hover:text-[#6eb8ff] transition-colors"
          >
            {isSignUp ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </p>
      </div>
    </div>
  );
}
