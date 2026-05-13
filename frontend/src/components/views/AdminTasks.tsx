import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { api } from '../../services/api';
import { Task, User } from '../../lib/mockData';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Plus, Trash2, Edit2 } from 'lucide-react';

export function AdminTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '', dueDate: '' });
  
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const loadData = async () => {
    const [t, u] = await Promise.all([api.getTasks(), api.getUsers()]);
    setTasks(t);
    setUsers(u);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!newTask.title || !newTask.assigneeId || !newTask.dueDate) return;
    await api.addTask({
      ...newTask,
      creatorId: currentUser!.id,
      status: 'PENDING'
    });
    setNewTask({ title: '', description: '', assigneeId: '', dueDate: '' });
    setIsCreating(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить задачу?')) {
      await api.deleteTask(id);
      loadData();
    }
  };

  const handleComment = async (taskId: string) => {
    if (!commentText.trim()) return;
    await api.addCommentToTask(taskId, currentUser!.id, commentText);
    setCommentText('');
    loadData();
  };

  if (isLoading) return <div>Загрузка управления задачами...</div>;

  return (
    <div className="space-y-6 flex flex-col flex-1">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-100">Управление задачами</h1>
        <Button onClick={() => setIsCreating(true)}><Plus className="w-4 h-4 mr-2"/> Новая задача</Button>
      </div>

      {isCreating && (
        <Card className="bg-slate-900/80 border-blue-900/30">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4" /> СОЗДАНИЕ В НАРЯД
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Название</label>
                <Input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Исполнитель</label>
                <Select value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                  <option value="">Выберите работника</option>
                  {users.filter(u => u.role === 'WORKER').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Описание</label>
                <Textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Срок выполнения (Дедлайн)</label>
                <Input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Отмена</Button>
              <Button onClick={handleCreate} disabled={!newTask.title || !newTask.assigneeId || !newTask.dueDate}>Добавить задачу</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col shadow-sm">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-semibold text-slate-100">Активные наряды</h3>
        </div>
        
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar min-h-0">
          {tasks.map(task => {
            const assignee = users.find(u => u.id === task.assigneeId);
            const isExpanded = expandedTaskId === task.id;
            const isCompleted = task.status === 'COMPLETED';

            return (
              <div key={task.id} className="group flex flex-col bg-slate-950/50 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all overflow-hidden">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {task.title}
                    </h4>
                    <p className={`text-xs mt-1.5 ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                      {task.description}
                    </p>
                    <div className="flex gap-4 mt-3">
                      <span className="text-[10px] flex items-center gap-1.5 text-slate-500 font-medium">
                        <Edit2 className="w-3 h-3" /> {assignee?.name || 'Неизвестно'}
                      </span>
                      <span className="text-[10px] flex items-center gap-1.5 text-slate-500 font-medium">
                        До {format(new Date(task.dueDate), 'dd.MM')}
                      </span>
                      {task.comments.length > 0 && (
                        <span className="text-[10px] flex items-center gap-1.5 text-slate-500 font-medium">
                          <MessageSquare className="w-3 h-3" /> Коммент: {task.comments.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase ${
                      isCompleted ? 'bg-slate-800 text-slate-500' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {isCompleted ? 'Выполнено' : 'В процессе'}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedTaskId(isExpanded ? null : task.id)} className="text-slate-400 hover:text-slate-200">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)} className="text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-800 p-4 sm:p-5 bg-slate-900 space-y-4">
                    <div className="space-y-3">
                      {task.comments.length === 0 ? (
                        <p className="text-xs text-slate-500">Нет комментариев.</p>
                      ) : (
                        task.comments.map(comment => {
                          const author = users.find(u => u.id === comment.authorId);
                          return (
                            <div key={comment.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm">
                              <div className="flex justify-between items-center text-xs mb-1.5">
                                <span className="font-bold text-slate-300">{author?.name}</span>
                                <span className="text-slate-500">{format(new Date(comment.timestamp), 'dd.MM HH:mm')}</span>
                              </div>
                              <p className="text-slate-400 text-xs">{comment.text}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Добавить комментарий..." 
                        value={commentText} 
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleComment(task.id)}
                        className="py-2 text-xs"
                      />
                      <Button size="sm" onClick={() => handleComment(task.id)}>Отправить</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {tasks.length === 0 && <p className="text-slate-500 text-center py-8 text-sm">Задачи пока не созданы.</p>}
        </div>
      </div>
    </div>
  );
}
