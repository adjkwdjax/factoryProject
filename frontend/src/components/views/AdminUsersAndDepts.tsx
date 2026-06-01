import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { api } from '../../services/api';
import { Department, User } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export function AdminUsersAndDepts() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { currentUser } = useAuth();
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'WORKER' as 'ADMIN'|'DEPARTMENT_HEAD'|'WORKER', departmentId: '' });
  const [newDeptName, setNewDeptName] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState({ name: '', username: '', password: '', role: 'WORKER' as 'ADMIN'|'DEPARTMENT_HEAD'|'WORKER', departmentId: '' });

  const loadData = async () => {
    const [u, d] = await Promise.all([api.getUsers(), api.getDepartments()]);
    setUsers(u);
    setDepartments(d);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.departmentId) return;
    await api.addUser({
      name: newUser.name,
      username: newUser.username || undefined,
      password: newUser.password || undefined,
      role: newUser.role,
      departmentId: newUser.departmentId,
    } as any);
    setNewUser({ name: '', username: '', password: '', role: 'WORKER', departmentId: '' });
    loadData();
  };

  const startEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditingUser({
      name: user.name,
      username: (user as any).username || '',
      password: '',
      role: user.role,
      departmentId: user.departmentId,
    });
  };

  const handleEditUser = async () => {
    if (!editingUserId || !editingUser.name || !editingUser.departmentId) return;
    await api.updateUser(editingUserId, editingUser as any);
    setEditingUserId(null);
    loadData();
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Удалить сотрудника?')) {
      await api.deleteUser(id);
      loadData();
    }
  };

  const handleAddDept = async () => {
    if (!newDeptName) return;
    await api.addDepartment({ name: newDeptName });
    setNewDeptName('');
    loadData();
  };

  if (isLoading) return <div>Загрузка данных...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
      {/* Departments Section */}
      <section className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-slate-900">Подразделения</h2>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{departments.length}</span>
        </div>
        
        {currentUser?.role === 'ADMIN' && (
          <div className="p-5 border-b border-slate-200 bg-slate-50 z-10">
            <form onSubmit={e => { e.preventDefault(); handleAddDept(); }} className="flex gap-3">
              <Input 
                placeholder="Название нового подразделения" 
                value={newDeptName} 
                onChange={e => setNewDeptName(e.target.value)} 
                className="bg-white border-slate-200 h-[42px]"
              />
              <Button type="submit" className="w-[42px] p-0 flex items-center justify-center shrink-0 bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/20">
                 <Plus className="w-5 h-5"/>
              </Button>
            </form>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative min-h-0">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-900/5 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>

          <ul className="divide-y divide-slate-200 relative z-10">
            {departments.map(dept => (
              <li key={dept.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <span className="font-medium text-slate-900">{dept.name}</span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-slate-500 border border-slate-200 bg-slate-50 px-2 py-1 rounded">ID: {dept.id}</span>
              </li>
            ))}
            {departments.length === 0 && <li className="p-5 text-slate-500 text-xs">Нет подразделений.</li>}
          </ul>
        </div>
      </section>

      {/* Users Section */}
      <section className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-slate-900">Персонал</h2>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{users.length}</span>
        </div>
        
        {currentUser?.role === 'ADMIN' && (
          <div className="p-5 border-b border-slate-200 bg-slate-50 space-y-4 z-10">
            <p className="text-[10px] tracking-widest uppercase font-bold text-amber-700">Новый сотрудник</p>
            <div className="grid grid-cols-1 gap-3">
              <Input 
                placeholder="ФИО сотрудника" 
                value={newUser.name} 
                onChange={e => setNewUser({...newUser, name: e.target.value})} 
                className="bg-white border-slate-200"
              />
              <Input 
                placeholder="Логин (username) — необязательно" 
                value={newUser.username} 
                onChange={e => setNewUser({...newUser, username: e.target.value})} 
                className="bg-white border-slate-200"
              />
              <Input 
                placeholder="Пароль — необязательно" 
                value={newUser.password} 
                onChange={e => setNewUser({...newUser, password: e.target.value})} 
                type="password"
                className="bg-white border-slate-200"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Select className="flex-1 bg-white border-slate-200 text-sm" value={newUser.departmentId} onChange={e => setNewUser({...newUser, departmentId: e.target.value})}>
                  <option value="">Выберите подразделение...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
                <Select className="flex-1 bg-white border-slate-200 text-sm" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                  <option value="WORKER">Работник</option>
                  <option value="DEPARTMENT_HEAD">Начальник подразделения</option>
                  <option value="ADMIN">Начальник цеха</option>
                </Select>
              </div>
              <Button onClick={handleAddUser} disabled={!newUser.name || !newUser.departmentId} className="w-full mt-1 bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/20 uppercase tracking-widest text-xs font-bold">
                Добавить
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative min-h-0">
           {/* Subtle background gradient */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-900/5 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>

          <ul className="divide-y divide-slate-200 relative z-10">
            {users.map(user => {
              const dept = departments.find(d => d.id === user.departmentId);
              return (
                <li key={user.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  {editingUserId === user.id ? (
                    <div className="w-full space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                        <Input value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} placeholder="Логин (username)" />
                        <Input value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} placeholder="Новый пароль (оставьте пустым, чтобы не менять)" type="password" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select value={editingUser.departmentId} onChange={e => setEditingUser({...editingUser, departmentId: e.target.value})}>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Select>
                        <Select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}>
                          <option value="WORKER">Работник</option>
                          <option value="DEPARTMENT_HEAD">Начальник подразделения</option>
                          <option value="ADMIN">Начальник цеха</option>
                        </Select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setEditingUserId(null)}><X className="w-4 h-4 mr-2" />Отмена</Button>
                        <Button onClick={handleEditUser}>Сохранить</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium text-black">{user.name}</p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">{dept?.name || 'Нет подразделения'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest font-bold ${
                          user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 border border-amber-200' : user.role === 'DEPARTMENT_HEAD' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {user.role === 'ADMIN' ? 'Начальник цеха' : user.role === 'DEPARTMENT_HEAD' ? 'Начальник подразделения' : 'Работник'}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => startEditUser(user)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
             {users.length === 0 && <li className="p-5 text-slate-500 text-xs">Нет сотрудников.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
