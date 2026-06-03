import { useAuth } from '../../context/AuthContext';
import { Flame, LogOut, UserIcon, Bell, CheckSquare, AlertOctagon, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Equipment, Incident, Task, User } from '../../lib/mockData';
import { api } from '../../services/api';
import Popup from '../ui/Popup';
import { formatLocalDateTime } from '../../lib/dateTime';

type TopbarProps = {
  onOpenIncidentReport: () => void;
};

type NotificationItem = {
  id: string;
  type: 'TASK' | 'INCIDENT';
  title: string;
  body: string;
  timestamp: string;
  unread: boolean;
};

export function Topbar({ onOpenIncidentReport }: TopbarProps) {
  const { currentUser, users, logout } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isIncidentsPopupOpen, setIsIncidentsPopupOpen] = useState(false);
  const [isNotificationsPopupOpen, setIsNotificationsPopupOpen] = useState(false);
  const knownIncidentIds = useRef<Set<string>>(new Set());
  const knownTaskIds = useRef<Set<string>>(new Set());
  const hasLoadedNotifications = useRef(false);

  useEffect(() => {
    if (!currentUser) return;
    knownIncidentIds.current = new Set();
    knownTaskIds.current = new Set();
    hasLoadedNotifications.current = false;

    const isRelevantTask = (task: Task, userList: User[]) => {
      if (currentUser.role === 'ADMIN') return true;
      if (currentUser.role === 'WORKER') return task.assigneeId === currentUser.id;

      const assignee = userList.find(user => user.id === task.assigneeId);
      return assignee?.departmentId === currentUser.departmentId;
    };

    const isRelevantIncident = (incident: Incident, userList: User[], equipmentList: Equipment[]) => {
      if (currentUser.role === 'ADMIN') return true;
      if (incident.reporterId === currentUser.id) return true;

      const reporter = userList.find(user => user.id === incident.reporterId);
      const relatedEquipment = equipmentList.find(eq => eq.id === incident.equipmentId);
      return reporter?.departmentId === currentUser.departmentId || relatedEquipment?.departmentId === currentUser.departmentId;
    };

    const fetchAlerts = async () => {
      const [allIncidents, allTasks, allUsers, allEquipment] = await Promise.all([
        api.getIncidents(),
        api.getTasks(),
        api.getUsers(),
        api.getEquipment(),
      ]);

      const relevantIncidents = allIncidents.filter(incident => isRelevantIncident(incident, allUsers, allEquipment));
      const relevantTasks = allTasks.filter(task => isRelevantTask(task, allUsers));
      setIncidents(relevantIncidents.filter(i => i.status === 'OPEN'));

      const nextIncidentIds = new Set(relevantIncidents.map(incident => incident.id));
      const nextTaskIds = new Set(relevantTasks.map(task => task.id));

      if (!hasLoadedNotifications.current) {
        knownIncidentIds.current = nextIncidentIds;
        knownTaskIds.current = nextTaskIds;
        hasLoadedNotifications.current = true;
        return;
      }

      const newIncidentNotifications = relevantIncidents
        .filter(incident => !knownIncidentIds.current.has(incident.id))
        .map(incident => ({
          id: `incident-${incident.id}`,
          type: 'INCIDENT' as const,
          title: incident.type === 'ACCIDENT' ? 'Новая авария' : 'Новый инцидент',
          body: incident.description,
          timestamp: incident.timestamp,
          unread: true,
        }));

      const newTaskNotifications = relevantTasks
        .filter(task => !knownTaskIds.current.has(task.id))
        .map(task => ({
          id: `task-${task.id}`,
          type: 'TASK' as const,
          title: 'Новая задача',
          body: task.title,
          timestamp: task.created_at || task.dueDate,
          unread: true,
        }));

      const freshNotifications = [...newIncidentNotifications, ...newTaskNotifications];
      if (freshNotifications.length > 0) {
        setNotifications(prev => [...freshNotifications, ...prev].slice(0, 12));
      }

      knownIncidentIds.current = nextIncidentIds;
      knownTaskIds.current = nextTaskIds;
    };

    fetchAlerts();

    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) return null;

  const unreadCount = notifications.filter(notification => notification.unread).length;

  const openNotifications = () => {
    setIsNotificationsPopupOpen(true);
    setNotifications(prev => prev.map(notification => ({ ...notification, unread: false })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

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
           <button
             onClick={openNotifications}
             className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
             title="Уведомления"
           >
             <Bell className="w-5 h-5" />
             {unreadCount > 0 && (
               <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                 {unreadCount}
               </span>
             )}
           </button>

           {incidents.length > 0 && (
              <button 
                onClick={() => setIsIncidentsPopupOpen(true)}
                className="flex items-center gap-3 text-sm font-bold text-red-600 uppercase tracking-widest bg-red-100 hover:bg-red-200 px-5 py-2.5 rounded-full border-2 border-red-300 animate-pulse shadow-md transition-colors cursor-pointer"
              >
                <Flame className="w-5 h-5" />
                <span>{incidents.length === 1 ? 'ВНИМАНИЕ! АВАРИЯ НА ПРОИЗВОДСТВЕ!' : 'ВНИМАНИЕ! АВАРИИ НА ПРОИЗВОДСТВЕ!'}</span>
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
                      <span className="font-mono text-[10px]">{formatLocalDateTime(incident.timestamp)}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Popup>
      )}

      {isNotificationsPopupOpen && (
        <Popup isOpen={true} onClose={() => setIsNotificationsPopupOpen(false)} title="Уведомления">
          <div className="space-y-3 min-w-[400px] sm:min-w-[520px]">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">Новых уведомлений пока нет.</p>
            ) : (
              notifications.map(notification => {
                const Icon = notification.type === 'TASK' ? CheckSquare : AlertOctagon;
                return (
                  <div key={notification.id} className={`p-4 rounded-xl border ${notification.type === 'TASK' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${notification.type === 'TASK' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{notification.title}</div>
                            <p className="text-xs text-slate-600 mt-1 break-words">{notification.body}</p>
                          </div>
                          <button onClick={() => dismissNotification(notification.id)} className="text-slate-400 hover:text-slate-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-3">
                          {formatLocalDateTime(notification.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Popup>
      )}

      <div className="fixed right-5 bottom-5 z-[1100] space-y-3 pointer-events-none">
        {notifications.filter(notification => notification.unread).slice(0, 3).map(notification => {
          const Icon = notification.type === 'TASK' ? CheckSquare : AlertOctagon;
          return (
            <div key={notification.id} className={`pointer-events-auto w-80 p-4 rounded-xl border shadow-lg bg-white ${notification.type === 'TASK' ? 'border-amber-200' : 'border-red-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notification.type === 'TASK' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900">{notification.title}</div>
                  <div className="text-xs text-slate-600 mt-1 line-clamp-2">{notification.body}</div>
                </div>
                <button onClick={() => dismissNotification(notification.id)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
