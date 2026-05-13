import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { api } from '../../services/api';
import { Task, User } from '../../lib/mockData';
import { CheckCircle, Clock } from 'lucide-react';

export function AdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
         <h1 className="text-xl font-semibold text-slate-100">Оперативная сводка</h1>
         <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-800 text-[10px] text-slate-400 uppercase font-bold">Управление</span>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Выполнено</p>
              <h4 className="text-2xl font-bold text-slate-100">{completedCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">В ожидании</p>
              <h4 className="text-2xl font-bold text-slate-100">{pendingCount}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
              <span className="text-xl font-bold leading-none">%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Прогресс смены</p>
              <h4 className="text-2xl font-bold text-slate-100">{progressPercent}%</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Эффективность персонала (%)</h3>
          <div className="space-y-6 flex-1">
            {workerStats.map(stat => (
              <div key={stat.id}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-300">{stat.name}</span>
                  <span className={`${stat.percent > 50 ? 'text-blue-400' : 'text-orange-400'} font-bold`}>{stat.percent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stat.percent > 80 ? 'bg-green-500' : stat.percent > 40 ? 'bg-blue-500' : 'bg-orange-500'}`}
                    style={{ width: `${stat.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {workerStats.length === 0 && <p className="text-xs text-slate-500">Нет данных о работниках.</p>}
          </div>
          <button className="mt-8 w-full py-2 border border-slate-700 hover:bg-slate-800 transition-colors rounded-lg text-xs font-semibold text-slate-400 uppercase tracking-wide">Детальный отчет</button>
        </section>

        {/* Can put something else here, or leave the grid layout as an example */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>
           <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider z-10">Сводка по задачам</h3>
           <div className="flex-1 flex flex-col justify-center items-center gap-2 z-10">
              <div className="text-4xl font-light text-slate-100">{tasks.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Всего задач</div>
           </div>
        </section>
      </div>
    </div>
  );
}
