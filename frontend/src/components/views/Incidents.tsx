import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea, Select } from '../ui/Input';
import { api } from '../../services/api';
import { Equipment, Incident, User } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { AlertCircle, Flame, CheckCircle } from 'lucide-react';

export function IncidentsView() {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState<{
    type: 'ACCIDENT' | 'BROKEN_EQUIPMENT';
    urgency: 'HIGH' | 'CRITICAL';
    description: string;
    equipmentId: string;
  }>({
    type: 'BROKEN_EQUIPMENT',
    urgency: 'HIGH',
    description: '',
    equipmentId: ''
  });

  const loadData = async () => {
    const [i, e, u] = await Promise.all([api.getIncidents(), api.getEquipment(), api.getUsers()]);
    setIncidents(i);
    // Workers see their department's eq. Admins see all eq to assign generic broken status if needed.
    setEquipment(currentUser?.role === 'ADMIN' ? e : e.filter(eq => eq.departmentId === currentUser?.departmentId));
    setUsers(u);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [currentUser]);

  const handleSubmit = async () => {
    if (!form.description) return;
    await api.reportIncident({
      type: form.type,
      urgency: form.urgency,
      description: form.description,
      equipmentId: form.type === 'BROKEN_EQUIPMENT' ? form.equipmentId : undefined,
      reporterId: currentUser!.id,
    });
    setForm({ type: 'BROKEN_EQUIPMENT', urgency: 'HIGH', description: '', equipmentId: '' });
    loadData();
    alert("Сообщение об инциденте успешно отправлено!");
  };

  const handleResolve = async (id: string) => {
    if (confirm("Пометить инцидент как разрешенный?")) {
      await api.resolveIncident(id);
      loadData();
    }
  };

  if (isLoading) return <div>Загрузка инцидентов...</div>;

  return (
    <div className="space-y-6 flex flex-col flex-1">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
         <h1 className="text-xl font-semibold text-slate-100">Инциденты и Аварии</h1>
      </div>

      {/* Report Form */}
      <Card className="bg-slate-900/80 border-red-900/30">
        <CardContent className="space-y-4 p-6">
          <h3 className="text-sm font-bold text-red-500 mb-4 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> СООБЩИТЬ О ПРОБЛЕМЕ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Тип инцидента</label>
              <Select value={form.type} onChange={e => setForm({...form, type: e.target.value as any, urgency: e.target.value === 'ACCIDENT' ? 'CRITICAL' : 'HIGH'})}>
                <option value="BROKEN_EQUIPMENT">Поломка оборудования</option>
                <option value="ACCIDENT">Авария на производстве</option>
              </Select>
            </div>
            
            {form.type === 'BROKEN_EQUIPMENT' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Оборудование</label>
                <Select value={form.equipmentId} onChange={e => setForm({...form, equipmentId: e.target.value})}>
                  <option value="">Выберите оборудование...</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} (ID: {eq.id})</option>
                  ))}
                </Select>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Уровень срочности</label>
              <Select value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value as any})} disabled={form.type === 'ACCIDENT'}>
                <option value="HIGH">Высокая (Требуется внимание)</option>
                <option value="CRITICAL">Критическая (Угроза остановки / безопасности)</option>
              </Select>
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Описание проблемы</label>
              <Textarea 
                placeholder="Подробно опишите что случилось..." 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                className={form.type === 'ACCIDENT' ? 'focus:ring-red-500 border-red-500/50 bg-red-500/10' : ''}
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="danger" disabled={!form.description} onClick={handleSubmit}>
              <Flame className="w-4 h-4 mr-2" />
              Отправить срочное сообщение
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Incident Feed */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col flex-1 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">История инцидентов</h3>
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
                  isResolved ? 'bg-slate-950/50 border-slate-800 opacity-60' : 
                  isCritical ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]' : 
                  'bg-orange-500/10 border-orange-500/30'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-widest ${
                        isResolved ? 'bg-slate-800 text-slate-500' : 
                        isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 
                        'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        {inc.type === 'ACCIDENT' ? 'АВАРИЯ' : 'ПОЛОМКА'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {format(new Date(inc.timestamp), 'dd.MM HH:mm')}
                      </span>
                    </div>
                    
                    <p className={`text-[15px] font-medium leading-relaxed ${!isResolved && isCritical ? 'text-red-100' : 'text-slate-200'}`}>
                      {inc.description}
                    </p>
                    
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-4 pt-4 border-t border-slate-800/50">
                      <p>Сообщил: <span className="text-slate-300">{reporter?.name || 'Неизвестно'}</span></p>
                      {eq && <p className="mt-1">Оборудование: <span className="text-slate-300">{eq.name}</span></p>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-start gap-4">
                    <div className={`flex items-center text-xs font-bold uppercase tracking-widest ${isResolved ? 'text-slate-500' : isCritical ? 'text-red-400' : 'text-orange-400'}`}>
                      {isResolved ? (
                         <><CheckCircle className="w-4 h-4 mr-1.5"/> Разрешено</>
                      ) : (
                         <><AlertCircle className="w-4 h-4 mr-1.5"/> Активно</>
                      )}
                    </div>

                    {currentUser?.role === 'ADMIN' && !isResolved && (
                      <Button onClick={() => handleResolve(inc.id)} className="text-xs uppercase tracking-widest font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20">
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
