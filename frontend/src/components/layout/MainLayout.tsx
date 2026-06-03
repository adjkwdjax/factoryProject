import { ReactNode, useEffect, useState } from 'react';
import { Topbar } from './Topbar';
import { useAuth } from '../../context/AuthContext';
import Popup from '../ui/Popup';
import { Button } from '../ui/Button';
import { Textarea, Select } from '../ui/Input';
import { api } from '../../services/api';
import { Equipment } from '../../lib/mockData';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Wrench, 
  Users, 
  MessageSquare,
  AlertOctagon
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ currentNav, onNavigate, onOpenIncidentReport }: { currentNav: string, onNavigate: (nav: string) => void, onOpenIncidentReport: () => void }) {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const adminLinks = [
    { id: 'dashboard', label: 'Аналитическая панель', icon: LayoutDashboard },
    { id: 'tasks', label: 'Актуальные задачи', icon: CheckSquare },
    { id: 'tasks-history', label: 'История задач', icon: CheckSquare },
    { id: 'equipment', label: 'Оборудование', icon: Wrench },
    { id: 'users', label: 'Сотрудники и подразделения', icon: Users },
    { id: 'messages', label: 'Сообщения', icon: MessageSquare },
    { id: 'incidents', label: 'Инциденты и аварии', icon: AlertOctagon },
  ];

  const workerLinks = [
    { id: 'my-tasks', label: 'Мои актуальные задачи', icon: CheckSquare },
    { id: 'my-tasks-history', label: 'История моих задач', icon: CheckSquare },
    { id: 'equipment-status', label: 'Статус оборудования', icon: Wrench },
    { id: 'messages', label: 'Сообщения', icon: MessageSquare },
    { id: 'report-incident', label: 'История инцидентов', icon: AlertOctagon },
  ];

  const links = currentUser.role === 'WORKER' ? workerLinks : adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

      <div className="p-6 border-b border-slate-200 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-sm font-bold text-amber-900 shadow-sm shrink-0">
            {currentUser.name.substring(0,2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</div>
            <div className="text-[10px] text-amber-700 uppercase tracking-widest font-bold truncate mt-0.5">
              {currentUser.role === 'WORKER' ? 'Работник' : currentUser.role === 'DEPARTMENT_HEAD' ? 'Начальник подразделения' : 'Начальник цеха'}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2 relative z-10">
        {links.map(link => {
          const Icon = link.icon;
          const isActive = currentNav === link.id || (currentNav === 'report-incident' && link.id === 'incidents');
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={cn(
                "flex w-full items-center gap-4 px-4 py-3 rounded-lg transition-all text-left font-medium",
                isActive 
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-200" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm truncate">{link.label}</span>
            </button>
          )
        })}
      </nav>
      
      <div className="p-6 space-y-4 relative z-10">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><AlertOctagon className="w-3 h-3"/> Экстренная кнопка</div>
          <button onClick={onOpenIncidentReport} className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-lg shadow-amber-200 transition-all text-xs uppercase tracking-wider">Сообщить об аварии или поломке оборудования</button>
        </div>
      </div>
    </aside>
  );
}

export function MainLayout({ children, currentNav, onNavigate }: { children: ReactNode, currentNav: string, onNavigate: (nav: string) => void }) {
  const { currentUser } = useAuth();
  const [isIncidentPopupOpen, setIsIncidentPopupOpen] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
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

  useEffect(() => {
    if (!isIncidentPopupOpen || !currentUser) return;

    const loadEquipment = async () => {
      const allEquipment = await api.getEquipment();
      setEquipment(currentUser.role === 'ADMIN' ? allEquipment : allEquipment.filter(eq => eq.departmentId === currentUser.departmentId));
    };

    loadEquipment();
  }, [isIncidentPopupOpen, currentUser]);

  const handleCloseIncidentPopup = () => {
    setIsIncidentPopupOpen(false);
    setForm({ type: 'BROKEN_EQUIPMENT', urgency: 'HIGH', description: '', equipmentId: '' });
  };

  const handleReportIncident = async () => {
    if (!currentUser || !form.description) return;

    await api.reportIncident({
      type: form.type,
      urgency: form.urgency,
      description: form.description,
      equipmentId: form.type === 'BROKEN_EQUIPMENT' ? form.equipmentId : undefined,
      reporterId: currentUser.id,
    });

    handleCloseIncidentPopup();
    alert('Сообщение об инциденте успешно отправлено!');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Topbar onOpenIncidentReport={() => setIsIncidentPopupOpen(true)} />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        <Sidebar currentNav={currentNav} onNavigate={onNavigate} onOpenIncidentReport={() => setIsIncidentPopupOpen(true)} />
        <main className="flex-1 w-full overflow-y-auto p-8 custom-scrollbar bg-slate-50">
          <div className="w-full h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>

      <Popup
        isOpen={isIncidentPopupOpen}
        onClose={handleCloseIncidentPopup}
        title="Сообщить об аварии"
      >
        <div className="space-y-4 min-w-[min(92vw,720px)]">
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
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
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
                className={form.type === 'ACCIDENT' ? 'focus:ring-red-500 border-red-200 bg-red-50' : ''}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={handleCloseIncidentPopup}>
              Отмена
            </Button>
            <Button variant="danger" disabled={!form.description} onClick={handleReportIncident}>
              Сообщить об аварии
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
}
