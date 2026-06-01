import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Flame, LogOut, AlertTriangle, UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Incident } from '../../lib/mockData';
import { api } from '../../services/api';
import { format } from 'date-fns';
import Popup from '../ui/Popup';

type TopbarProps = {
  onOpenIncidentReport: () => void;
};

export function Topbar({ onOpenIncidentReport }: TopbarProps) {
  const { currentUser, users, loginAs, logout } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isIncidentsPopupOpen, setIsIncidentsPopupOpen] = useState(false);

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
            PT
          </div>
          <span className="font-semibold tracking-tight text-xl text-slate-900">Production Tasks</span>
        </div>

        <div className="flex gap-4 items-center">

           {incidents.length > 0 && (
              <button 
                onClick={() => setIsIncidentsPopupOpen(true)}
                className="flex items-center gap-3 text-sm font-bold text-red-600 uppercase tracking-widest bg-red-100 hover:bg-red-200 px-5 py-2.5 rounded-full border-2 border-red-300 animate-pulse shadow-md transition-colors cursor-pointer"
              >
                <Flame className="w-5 h-5" />
                <span>Актуальных аварий: {incidents.length}</span>
              </button>
           )}
           
           <div className="flex items-center text-sm gap-3">
              
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

      {isIncidentsPopupOpen && (
        <Popup isOpen={true} onClose={() => setIsIncidentsPopupOpen(false)} title="Актуальные аварии">
          <div className="space-y-4 min-w-[400px] sm:min-w-[500px]">
            {incidents.map(incident => {
              const reporter = users.find(u => u.id === incident.reporterId);
              return (
                <div key={incident.id} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-slate-900">{incident.description}</div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-red-200 text-red-800">
                      {incident.urgency === 'CRITICAL' ? 'Критично' : 'Высокий'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> Сообщил: {reporter?.name || 'Неизвестно'}</p>
                    <p className="flex justify-between mt-2 pt-2 border-t border-red-100">
                      <span className="font-mono text-[10px]">{format(new Date(incident.timestamp), 'dd.MM.yyyy HH:mm')}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Popup>
      )}
    </>
  );
}
