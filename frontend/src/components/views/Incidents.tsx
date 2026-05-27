import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { Equipment, Incident, User } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function IncidentsView() {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    const [incidentList, equipmentList, userList] = await Promise.all([
      api.getIncidents(),
      api.getEquipment(),
      api.getUsers(),
    ]);

    setIncidents(incidentList);
    setEquipment(
      currentUser?.role === 'ADMIN'
        ? equipmentList
        : equipmentList.filter(eq => eq.departmentId === currentUser?.departmentId)
    );
    setUsers(userList);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleResolve = async (id: string) => {
    if (confirm('Пометить инцидент как разрешенный?')) {
      await api.resolveIncident(id);
      loadData();
    }
  };

  if (isLoading) return <div>Загрузка инцидентов...</div>;

  return (
    <div className="space-y-6 flex flex-col flex-1">
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">История инцидентов</h1>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col flex-1 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">История инцидентов</h3>
        <div className="space-y-3 overflow-y-auto custom-scrollbar min-h-0">
          {incidents.map(inc => {
            const reporter = users.find(u => u.id === inc.reporterId);
            const eq = equipment.find(e => e.id === inc.equipmentId);
            const isResolved = inc.status === 'RESOLVED';
            const isCritical = inc.urgency === 'CRITICAL';

            return (
              <div
                key={inc.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isResolved
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : isCritical
                      ? 'bg-red-50 border-red-200 shadow-sm'
                      : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-widest ${
                          isResolved
                            ? 'bg-slate-100 text-slate-500'
                            : isCritical
                              ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inc.type === 'ACCIDENT' ? 'АВАРИЯ' : 'ПОЛОМКА'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {format(new Date(inc.timestamp), 'dd.MM HH:mm')}
                      </span>
                    </div>

                    <p className={`text-[15px] font-medium leading-relaxed ${!isResolved && isCritical ? 'text-red-900' : 'text-slate-800'}`}>
                      {inc.description}
                    </p>

                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-4 pt-4 border-t border-slate-200">
                      <p>
                        Сообщил: <span className="text-slate-700">{reporter?.name || 'Неизвестно'}</span>
                      </p>
                      {eq && (
                        <p className="mt-1">
                          Оборудование: <span className="text-slate-700">{eq.name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-start gap-4">
                    <div className={`flex items-center text-xs font-bold uppercase tracking-widest ${isResolved ? 'text-slate-500' : isCritical ? 'text-red-600' : 'text-amber-700'}`}>
                      {isResolved ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Разрешено
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-1.5" /> Активно
                        </>
                      )}
                    </div>

                    {currentUser?.role === 'ADMIN' && !isResolved && (
                      <Button
                        onClick={() => handleResolve(inc.id)}
                        className="text-xs uppercase tracking-widest font-bold bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/20"
                      >
                        Устранено
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {incidents.length === 0 && <p className="text-xs text-slate-500">Нет записей об инцидентах.</p>}
        </div>
      </section>
    </div>
  );
}