import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../services/api';
import { Task, User } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Check, Clock, UserIcon } from 'lucide-react';
import { formatLocalDateTime, getDeadlineTimeText } from '../../lib/dateTime';

export function WorkerTasks({ showHistory = false }: { showHistory?: boolean }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const loadData = async () => {
    const [t, u] = await Promise.all([api.getTasks(), api.getUsers()]);
    // Only show tasks assigned to current worker
    setTasks(t.filter(task => task.assigneeId === currentUser!.id));
    setUsers(u);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const intervalId = window.setInterval(loadData, 3000);
    return () => window.clearInterval(intervalId);
  }, [currentUser]);

  const handleComplete = async (taskId: string) => {
    await api.updateTask(taskId, { status: 'COMPLETED' });
    loadData();
  };

  const handleComment = async (taskId: string) => {
    if (!commentText.trim()) return;
    await api.addCommentToTask(taskId, currentUser!.id, commentText);
    setCommentText('');
    loadData();
  };

  if (isLoading) return <div>Загрузка задач...</div>;

  const filteredTasks = tasks.filter(task => showHistory ? task.status === 'COMPLETED' : task.status === 'PENDING');

  return (
    <div className="space-y-6 flex flex-col flex-1">
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{showHistory ? 'История задач' : 'Мои задачи'}</h1>
        {!showHistory && (
          <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-bold tracking-widest">{filteredTasks.length} Активных</span>
           </div>
        )}
      </div>
      
      <div className="space-y-4">
        {filteredTasks.map(task => {
          const isExpanded = expandedTaskId === task.id;
          const isCompleted = task.status === 'COMPLETED';

          return (
            <div key={task.id} className={`flex flex-col bg-white border ${isCompleted ? 'border-slate-200 opacity-60' : 'border-amber-200'} rounded-2xl transition-all overflow-hidden shadow-sm`}>
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6 items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className={`text-lg font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.title}
                      </h4>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1 ${
                        isCompleted ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {isCompleted ? 'Выполнено' : 'В процессе'}
                      </span>
                    </div>
                    <p className={`text-sm ${isCompleted ? 'text-slate-600' : 'text-slate-600'}`}>{task.description}</p>
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200">
                      <span className="text-[10px] flex items-center gap-1.5 text-slate-500 font-medium tracking-widest uppercase">
                        <UserIcon className="w-3 h-3" /> Назначил: {users.find(u => u.id === task.creatorId)?.name}
                      </span>
                      <span className={`text-[10px] flex items-center gap-1.5 font-medium tracking-widest uppercase ${!isCompleted && new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" /> До: {formatLocalDateTime(task.dueDate)}
                      </span>
                      <span className={`text-[10px] flex items-center gap-1.5 font-medium tracking-widest uppercase ${!isCompleted && new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" /> Время: {getDeadlineTimeText(task.dueDate, task.completedAt)}
                      </span>
                      {isCompleted && task.completedAt && (
                        <span className="text-[10px] flex items-center gap-1.5 font-medium tracking-widest uppercase text-green-600">
                          <Check className="w-3 h-3" /> Выполнена: {formatLocalDateTime(task.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    {!isCompleted && (
                      <Button onClick={() => handleComplete(task.id)} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/20 uppercase tracking-widest text-xs font-bold">
                        Отметить как выполненную
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => setExpandedTaskId(isExpanded ? null : task.id)} className="w-full sm:w-auto text-xs uppercase tracking-widest border border-slate-200 mt-2 text-slate-700">
                       {isExpanded ? 'Скрыть комментарии' : `Комментарии (${task.comments.length})`}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200 p-5 sm:p-6 bg-slate-50 space-y-4">
                    {task.comments.length === 0 ? (
                      <p className="text-xs text-slate-500">Пока нет комментариев.</p>
                    ) : (
                      <div className="space-y-3">
                        {task.comments.map(comment => {
                          const author = users.find(u => u.id === comment.authorId);
                          const isMe = comment.authorId === currentUser?.id;
                          return (
                            <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              <div className={`p-3 rounded-xl max-w-[80%] ${isMe ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-slate-200'}`}>
                                <div className={`flex items-center gap-2 mb-1.5 text-[10px] uppercase tracking-widest font-bold ${isMe ? 'text-amber-700' : 'text-slate-500'}`}>
                                  <span>{isMe ? 'Вы' : author?.name}</span>
                                  <span>{formatLocalDateTime(comment.timestamp)}</span>
                                </div>
                                <p className="text-xs text-slate-700">{comment.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                      <Input 
                        placeholder="Ответить..." 
                        value={commentText} 
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleComment(task.id)}
                        className="text-xs py-2"
                      />
                      <Button onClick={() => handleComment(task.id)} size="sm">Отправить</Button>
                    </div>
                  </div>
                )}
            </div>
          );
        })}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Check className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{showHistory ? 'Истории пока нет' : 'Задач нет'}</h3>
            <p className="text-slate-500 text-xs mt-2">{showHistory ? 'Вы еще не выполнили ни одной задачи.' : 'Все поручения выполнены.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
