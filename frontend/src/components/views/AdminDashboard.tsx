import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { api } from '../../services/api';
import { Task, User } from '../../lib/mockData';
import { CheckCircle, Clock, X } from 'lucide-react';
import { parseISO, format, addDays, differenceInCalendarDays, startOfDay, min as dateMin, max as dateMax } from 'date-fns';
import { useRef } from 'react';
import Gantt from 'frappe-gantt';

export function AdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGantt, setShowGantt] = useState(false);

  useEffect(() => {
    Promise.all([api.getTasks(), api.getUsers()]).then(([t, u]) => {
      setTasks(t);
      setUsers(u.filter(user => user.role === 'WORKER'));
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <div>Загрузка отчетов...</div>;

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const pendingCount = tasks.length - completedCount;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Stats by worker
  const workerStats = users.map(user => {
    const userTasks = tasks.filter(t => t.assigneeId === user.id);
    const userCompleted = userTasks.filter(t => t.status === 'COMPLETED').length;
    const userPercent = userTasks.length ? Math.round((userCompleted / userTasks.length) * 100) : 0;
    return { ...user, total: userTasks.length, completed: userCompleted, percent: userPercent };
  });

  return (
    <>
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Оперативная сводка</h1>
         <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-[10px] text-amber-700 uppercase font-bold">Управление</span>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Выполнено</p>
              <h4 className="text-2xl font-bold text-slate-900">{completedCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">В ожидании</p>
              <h4 className="text-2xl font-bold text-slate-900">{pendingCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
              <span className="text-xl font-bold leading-none">%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Прогресс смены</p>
              <h4 className="text-2xl font-bold text-slate-900">{progressPercent}%</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Эффективность персонала (%)</h3>
          <div className="space-y-6 flex-1">
            {workerStats.map(stat => (
              <div key={stat.id}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-700">{stat.name}</span>
                  <span className={`${stat.percent > 50 ? 'text-amber-400' : 'text-orange-400'} font-bold`}>{stat.percent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stat.percent > 80 ? 'bg-green-500' : stat.percent > 40 ? 'bg-amber-500' : 'bg-orange-500'}`}
                    style={{ width: `${stat.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {workerStats.length === 0 && <p className="text-xs text-slate-500">Нет данных о работниках.</p>}
          </div>
          <button onClick={() => setShowGantt(true)} className="mt-8 w-full py-2 border border-slate-200 hover:bg-amber-50 transition-colors rounded-lg text-xs font-semibold text-slate-700 uppercase tracking-wide">Диаграмма Ганта</button>
        </section>

        {/* Can put something else here, or leave the grid layout as an example */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100 via-white to-white pointer-events-none"></div>
            <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider z-10">Сводка по задачам</h3>
           <div className="flex-1 flex flex-col justify-center items-center gap-2 z-10">
              <div className="text-4xl font-light text-slate-900">{tasks.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Всего задач</div>
           </div>
        </section>
      </div>
    </div>
    {showGantt && <GanttModal tasks={tasks} users={users} onClose={() => setShowGantt(false)} />}
    </>
  );
}

function GanttModal({ tasks, users, onClose }: { tasks: Task[]; users: User[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const ganttRef = useRef<any>(null);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    // dynamically load frappe-gantt CSS from CDN (avoids package exports issues)
    const linkId = 'frappe-gantt-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/frappe-gantt/dist/frappe-gantt.css';
      document.head.appendChild(link);
    }
    // initialize with a tick to avoid blocking main thread
    setInitializing(true);
    const timer = setTimeout(() => {
      try {
        const MAX_TASKS = 500;
        const MAX_SPAN_DAYS = 120;

        const safeTasks = tasks.slice(0, MAX_TASKS).map(t => {
          const startSource = t.created_at || t.dueDate;
          let start = parseISO(startSource || '');
          if (!(start instanceof Date) || isNaN(start.getTime())) start = new Date();
          const end = parseISO(t.dueDate || '');
          if (!(end instanceof Date) || isNaN(end.getTime())) return null;
          if (start > end) start = addDays(end, -1);
          return { id: t.id, name: t.title, start: start.toISOString().slice(0,10), end: end.toISOString().slice(0,10), progress: t.status === 'COMPLETED' ? 100 : 0, dependencies: '' };
        }).filter(Boolean) as Array<{ id: string; name: string; start: string; end: string; progress: number; dependencies: string }>;

        // compute overall span and clamp if huge
        const starts = safeTasks.map(st => parseISO(st.start));
        const ends = safeTasks.map(st => parseISO(st.end));
        const overallStart = dateMin(starts);
        const overallEnd = dateMax(ends);
        const spanDays = Math.max(1, differenceInCalendarDays(overallEnd, overallStart) + 1);

        // if span too large, clamp to window around today
        let viewStart = overallStart;
        let viewEnd = overallEnd;
        if (spanDays > MAX_SPAN_DAYS) {
          const today = startOfDay(new Date());
          viewStart = addDays(today, -30);
          viewEnd = addDays(today, 30);
        }

        // filter tasks that intersect view window to avoid rendering thousands
        const visibleTasks = safeTasks.filter(st => {
          const s = parseISO(st.start);
          const e = parseISO(st.end);
          return !(e < viewStart || s > viewEnd);
        });

        // clear container
        if (ref.current) ref.current.innerHTML = '';

        // init Gantt
        ganttRef.current = new (Gantt as any)(ref.current, visibleTasks, {
          view_mode: 'Day',
          date_format: 'YYYY-MM-DD',
          on_click: (task: any) => {},
        });
      } catch (err) {
        // avoid crashing the UI
        console.error('Gantt init error', err);
      } finally {
        setInitializing(false);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      try {
        if (ganttRef.current) {
          // remove rendered SVG/html
          if (ref.current) ref.current.innerHTML = '';
          ganttRef.current = null;
        }
      } catch (e) { /* ignore cleanup errors */ }
    };
  }, [tasks]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative bg-white border border-slate-200 rounded-lg shadow-xl w-[80vw] h-[80vh] max-w-none p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Детальный отчет — Диаграмма Ганта</h3>
            <div className="text-xs text-slate-500">Показаны задачи за период; масштаб — день.</div>
          </div>
          <button onClick={onClose} title="Закрыть" className="p-2 rounded hover:bg-slate-100"><X className="w-5 h-5"/></button>
        </div>
        <div className="text-sm text-slate-600 mb-3">Подсказка: щёлкните по задаче для деталей.</div>
        <div ref={ref} className="flex-1 min-h-0 overflow-auto" />
      </div>
    </div>
  );
}
