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
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white/90 backdrop-blur-md shrink-0 w-full z-50 text-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-amber-900/20">
            F
          </div>
          <span className="font-semibold tracking-tight text-xl text-slate-900">...</span>
        </div>

        <div className="flex gap-4 items-center">
           {incidents.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-full border border-red-200 animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                <span>Аварии: {incidents.length}</span>
              </div>
           )}
           <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Система онлайн
           </div>
           <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
           <div className="flex items-center text-sm gap-3">
              <select 
                value={currentUser.id} 
                onChange={(e) => loginAs(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors"
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
