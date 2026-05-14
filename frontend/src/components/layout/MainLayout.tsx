import { ReactNode, useState, useEffect } from 'react';
import { Topbar } from './Topbar';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Wrench, 
  Users, 
  MessageSquare,
  AlertOctagon
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ currentNav, onNavigate }: { currentNav: string, onNavigate: (nav: string) => void }) {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const adminLinks = [
    { id: 'dashboard', label: 'Отчеты и Информационная панель', icon: LayoutDashboard },
    { id: 'tasks', label: 'Управление задачами', icon: CheckSquare },
    { id: 'equipment', label: 'Оборудование', icon: Wrench },
    { id: 'users', label: 'Сотрудники и подразделения', icon: Users },
    { id: 'messages', label: 'Сообщения', icon: MessageSquare },
    { id: 'incidents', label: 'Инциденты и Аварии', icon: AlertOctagon },
  ];

  const workerLinks = [
    { id: 'my-tasks', label: 'Мои задачи', icon: CheckSquare },
    { id: 'equipment-status', label: 'Статус оборудования', icon: Wrench },
    { id: 'messages', label: 'Сообщения', icon: MessageSquare },
    { id: 'report-incident', label: 'Сообщить об инциденте', icon: AlertOctagon },
  ];

  const links = currentUser.role === 'ADMIN' ? adminLinks : workerLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

      <div className="p-6 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-200 shadow-sm shrink-0">
            {currentUser.name.substring(0,2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-slate-200 truncate">{currentUser.name}</div>
            <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold truncate mt-0.5">
               {currentUser.role === 'ADMIN' ? 'Начальник подразделения' : 'Работник'}
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
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm truncate">{link.label}</span>
            </button>
          )
        })}
      </nav>
      
      <div className="p-6 space-y-4 relative z-10">
        {currentUser.role === 'WORKER' && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
            <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><AlertOctagon className="w-3 h-3"/> Экстренная кнопка</div>
            <button onClick={() => onNavigate('report-incident')} className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-900/40 transition-all text-xs uppercase tracking-wider">Создать Аварию</button>
          </div>
        )}
      </div>
    </aside>
  );
}

export function MainLayout({ children, currentNav, onNavigate }: { children: ReactNode, currentNav: string, onNavigate: (nav: string) => void }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 font-sans text-slate-200 overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        <Sidebar currentNav={currentNav} onNavigate={onNavigate} />
        <main className="flex-1 w-full overflow-y-auto p-8 custom-scrollbar">
          <div className="w-full h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
