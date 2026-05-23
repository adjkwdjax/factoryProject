import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Неверный логин или пароль');
      }
    } catch (err) {
      setError('Ошибка подключения. Убедитесь, что сервер запущен.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (testUser: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      // Demo users have password 'password123'
      const success = await login(testUser, 'password123');
      if (!success) {
        setError('Ошибка входа с demo аккаунтом');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.10),_transparent_36%),linear-gradient(135deg,_#fffaf0,_#f8fafc)] flex items-center justify-center p-4 text-slate-900">
      <div className="w-full max-w-2xl">
        {/* Logo и заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-700 rounded-2xl shadow-lg shadow-amber-950/40 mb-4">
            <span className="text-3xl font-bold text-white">PT</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Production Tasks</h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest">Система управления производством</p>
        </div>

        {/* Форма входа */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl mb-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Логин
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="test_admin1"
                disabled={isSubmitting || isLoading}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting || isLoading}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLoading || !username || !password}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg uppercase tracking-widest text-sm transition-colors shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>

        {/* Demo аккаунты */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">Demo аккаунты</p>
          
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('test_admin1')}
              disabled={isSubmitting || isLoading}
              className="w-full bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-slate-200 hover:border-slate-300"
            >
              👨‍💼 Начальник цеха (test_admin1)
            </button>
            <button
              onClick={() => handleDemoLogin('test_head1')}
              disabled={isSubmitting || isLoading}
              className="w-full bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-slate-200 hover:border-slate-300"
            >
              🟡 Начальник подразделения (test_head1)
            </button>
            <button
              onClick={() => handleDemoLogin('test_worker1')}
              disabled={isSubmitting || isLoading}
              className="w-full bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-slate-200 hover:border-slate-300"
            >
              🔧 Рабочий 1 (test_worker1)
            </button>
            <button
              onClick={() => handleDemoLogin('test_worker2')}
              disabled={isSubmitting || isLoading}
              className="w-full bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-slate-200 hover:border-slate-300"
            >
              🔧 Рабочий 2 (test_worker2)
            </button>
            <button
              onClick={() => handleDemoLogin('test_worker3')}
              disabled={isSubmitting || isLoading}
              className="w-full bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-slate-200 hover:border-slate-300"
            >
              🔧 Рабочий 3 (test_worker3)
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Пароль для всех: <span className="text-slate-700 font-mono">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
