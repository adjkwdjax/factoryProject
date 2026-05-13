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
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo и заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-900/50 mb-4">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Название</h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest">Система управления производством</p>
        </div>

        {/* Форма входа */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl mb-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Логин
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="test_admin1"
                disabled={isSubmitting || isLoading}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting || isLoading}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLoading || !username || !password}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg uppercase tracking-widest text-sm transition-colors shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>

        {/* Demo аккаунты */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Demo аккаунты</p>
          
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('test_admin1')}
              disabled={isSubmitting || isLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-slate-700 hover:border-slate-600"
            >
              👨‍💼 Администратор (test_admin1)
            </button>
            <button
              onClick={() => handleDemoLogin('test_worker1')}
              disabled={isSubmitting || isLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-slate-700 hover:border-slate-600"
            >
              🔧 Рабочий 1 (test_worker1)
            </button>
            <button
              onClick={() => handleDemoLogin('test_worker2')}
              disabled={isSubmitting || isLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-slate-700 hover:border-slate-600"
            >
              🔧 Рабочий 2 (test_worker2)
            </button>
            <button
              onClick={() => handleDemoLogin('test_worker3')}
              disabled={isSubmitting || isLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-slate-700 hover:border-slate-600"
            >
              🔧 Рабочий 3 (test_worker3)
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Пароль для всех: <span className="text-slate-400 font-mono">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
