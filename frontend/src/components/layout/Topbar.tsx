import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { AlertTriangle, Flame, Bell, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Incident } from '../../lib/mockData';
import { api } from '../../services/api';
import { format } from 'date-fns';

export function Topbar() {
  const { currentUser, users, loginAs, logout } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const allIncidents = await api.getIncidents();
      setIncidents(allIncidents.filter(i => i.status === 'OPEN'));
    };
    fetchAlerts();
    
    // Poll for new incidents (simple mock for realtime)
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  return (
    <>
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md shrink-0 w-full z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
            F
          </div>
          <span className="font-semibold tracking-tight text-xl text-slate-100">...</span>
        </div>

        <div className="flex gap-4 items-center">
           {incidents.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                <span>Аварии: {incidents.length}</span>
              </div>
           )}
           <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Система онлайн
           </div>
           <div className="h-8 w-[1px] bg-slate-800 mx-2"></div>
           <div className="flex items-center text-sm gap-3">
              <select 
                value={currentUser.id} 
                onChange={(e) => loginAs(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Выход
              </button>
           </div>
        </div>
      </header>
    </>
  );
}
