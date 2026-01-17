import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to /chat
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      // Successful login - navigate to /chat
      navigate('/chat');
    } catch (err: any) {
      // Error handling based on status codes from DISCOVERY.md Section 7.1
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-[440px] rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10">
        {/* Company Branding */}
        <div className="mb-10 flex flex-col items-center">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-[#a18cf0] flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-5">
            <Atom className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Nexus AI</h1>
          <p className="text-slate-500 font-medium">
            Вход в систему
          </p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear error on new input
                if (error) setError('');
              }}
              placeholder="example@nexus.ai"
              required
              disabled={submitting}
              className="w-full h-14 bg-slate-50/50 border border-slate-200/60 rounded-3xl px-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
              Пароль
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Clear error on new input
                if (error) setError('');
              }}
              placeholder="••••••••"
              required
              disabled={submitting}
              className="w-full h-14 bg-slate-50/50 border border-slate-200/60 rounded-3xl px-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#8466e4] hover:bg-[#7254d3] text-white font-bold h-14 rounded-3xl shadow-lg shadow-[#8466e4]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Signing in...' : 'Войти'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-6 right-8 z-10">
        <p className="text-slate-400 text-[11px] font-medium tracking-widest uppercase">
          © 2024 NEXUS AI. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
        </p>
      </footer>
    </div>
  );
}
