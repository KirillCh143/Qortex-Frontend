import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect authenticated users to /chat
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/chat', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
      // Successful login - navigate to /chat
      navigate('/chat')
    } catch (err: any) {
      // Error handling based on status codes from DISCOVERY.md Section 7.1
      if (err.response?.status === 401) {
        setError('Неверный email или пароль')
      } else if (err.response?.status === 404) {
        setError('Пользователь не найден')
      } else {
        setError('Произошла ошибка. Повторите попытку позже.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* --- START: Custom Background --- */}
      <div className="site-background">
        <div className="bg-gradient-main">
          {/* Blobs */}
          <div className="bg-blur-circle bg-blur-left-orange"></div>
          <div className="bg-blur-circle bg-blur-left-pink"></div>
          <div className="bg-blur-circle bg-blur-right-cyan"></div>
          <div className="bg-blur-circle bg-blur-right-green"></div>

          {/* Left Bars */}
          <div
            className="bg-fade-bar left-bar"
            style={{ '--offset': '0px', '--opacity': 1.0 } as React.CSSProperties}
          ></div>
          <div
            className="bg-fade-bar left-bar"
            style={{ '--offset': '80px', '--opacity': 0.9 } as React.CSSProperties}
          ></div>
          <div
            className="bg-fade-bar left-bar"
            style={{ '--offset': '160px', '--opacity': 0.8 } as React.CSSProperties}
          ></div>
          <div
            className="bg-fade-bar left-bar"
            style={{ '--offset': '240px', '--opacity': 0.7 } as React.CSSProperties}
          ></div>
          <div
            className="bg-fade-bar left-bar"
            style={{ '--offset': '320px', '--opacity': 0.6 } as React.CSSProperties}
          ></div>
          <div
            className="bg-fade-bar left-bar"
            style={{ '--offset': '400px', '--opacity': 0.5 } as React.CSSProperties}
          ></div>

          {/* Right Bars */}
          <div
            className="bg-fade-bar right-bar"
            style={{ '--offset': '0px', '--opacity': 1.0 } as React.CSSProperties}
          ></div>
          <div
            className="bg-fade-bar right-bar"
            style={{ '--offset': '80px', '--opacity': 0.9 } as React.CSSProperties}
          ></div>
          <div
            className="bg-fade-bar right-bar"
            style={{ '--offset': '160px', '--opacity': 0.8 } as React.CSSProperties}
          ></div>
          <div
            className="bg-fade-bar right-bar"
            style={{ '--offset': '240px', '--opacity': 0.7 } as React.CSSProperties}
          ></div>
          <div
            className="bg-fade-bar right-bar"
            style={{ '--offset': '320px', '--opacity': 0.6 } as React.CSSProperties}
          ></div>
          <div
            className="bg-fade-bar right-bar"
            style={{ '--offset': '400px', '--opacity': 0.5 } as React.CSSProperties}
          ></div>
        </div>
      </div>
      {/* --- END: Custom Background --- */}

      <div className="relative z-10 w-full max-w-[440px] rounded-3xl bg-white/80 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-violet-100 p-10">
        {/* Company Branding */}
        <div className="mb-10 flex flex-col items-center">
          <div className="size-18 rounded-2xl bg-gradient-to-br from-[#8d6df5] to-[#7049f3] flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-5">
            <img src="/logo.svg" alt="Logo" className="h-14 w-14" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">База знаний</h1>
          <p className="text-slate-500 font-medium">Вход в систему</p>
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
              Электронная почта
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                // Clear error on new input
                if (error) setError('')
              }}
              placeholder="example@mail.com"
              required
              disabled={submitting}
              className="w-full h-14 bg-slate-50/50 border border-slate-200/60 hover:border-slate-300 rounded-xl px-5 text-slate-900 placeholder-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#8466e4] transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700 mb-2 ml-1"
            >
              Пароль
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                // Clear error on new input
                if (error) setError('')
              }}
              placeholder="••••••••"
              required
              disabled={submitting}
              className="w-full h-14 bg-slate-50/50 border border-slate-200/60 hover:border-slate-300 rounded-xl px-5 text-slate-900 placeholder-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#8466e4] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full bg-[#7049f3] hover:bg-[#6542db] text-white font-bold h-14 rounded-xl shadow-lg shadow-[#8466e4]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Осуществляется вход' : 'Войти'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
        <p className="text-slate-400 text-[11px] font-medium tracking-widest uppercase">
          © 2026 ВСЕ ПРАВА ЗАЩИЩЕНЫ.
        </p>
      </footer>
    </div>
  )
}
