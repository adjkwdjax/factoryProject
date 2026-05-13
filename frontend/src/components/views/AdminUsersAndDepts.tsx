import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { api } from '../../services/api';
import { Department, User } from '../../lib/mockData';
import { Plus } from 'lucide-react';

export function AdminUsersAndDepts() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newUser, setNewUser] = useState({ name: '', role: 'WORKER' as 'ADMIN'|'WORKER', departmentId: '' });
  const [newDeptName, setNewDeptName] = useState('');

  const loadData = async () => {
    const [u, d] = await Promise.all([api.getUsers(), api.getDepartments()]);
    setUsers(u);
    setDepartments(d);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.departmentId) return;
    await api.addUser(newUser);
    setNewUser({ name: '', role: 'WORKER', departmentId: '' });
    loadData();
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
      <section className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-slate-100">Подразделения (Цеха)</h2>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{departments.length}</span>
        </div>
        
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 z-10">
          <form onSubmit={e => { e.preventDefault(); handleAddDept(); }} className="flex gap-3">
            <Input 
              placeholder="Название нового цеха" 
              value={newDeptName} 
              onChange={e => setNewDeptName(e.target.value)} 
              className="bg-slate-950 border-slate-700 h-[42px]"
            />
            <Button type="submit" className="w-[42px] p-0 flex items-center justify-center shrink-0 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20">
               <Plus className="w-5 h-5"/>
            </Button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative min-h-0">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/5 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>

          <ul className="divide-y divide-slate-800/50 relative z-10">
            {departments.map(dept => (
              <li key={dept.id} className="p-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <span className="font-medium text-slate-200">{dept.name}</span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-slate-500 border border-slate-700 bg-slate-800 px-2 py-1 rounded">ID: {dept.id}</span>
              </li>
            ))}
            {departments.length === 0 && <li className="p-5 text-slate-500 text-xs">Нет подразделений.</li>}
          </ul>
        </div>
      </section>

      {/* Users Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-slate-100">Персонал</h2>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{users.length}</span>
        </div>
        
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 space-y-4 z-10">
          <p className="text-[10px] tracking-widest uppercase font-bold text-blue-400">Новый сотрудник</p>
          <div className="grid grid-cols-1 gap-3">
            <Input 
              placeholder="ФИО сотрудника" 
              value={newUser.name} 
              onChange={e => setNewUser({...newUser, name: e.target.value})} 
              className="bg-slate-950 border-slate-700"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Select className="flex-1 bg-slate-950 border-slate-700 text-sm" value={newUser.departmentId} onChange={e => setNewUser({...newUser, departmentId: e.target.value})}>
                <option value="">Выберите цех...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
              <Select className="flex-1 bg-slate-950 border-slate-700 text-sm" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                <option value="WORKER">Работник</option>
                <option value="ADMIN">Начальник цеха</option>
              </Select>
            </div>
            <Button onClick={handleAddUser} disabled={!newUser.name || !newUser.departmentId} className="w-full mt-1 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 uppercase tracking-widest text-xs font-bold">
              Добавить
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative min-h-0">
           {/* Subtle background gradient */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/5 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>

          <ul className="divide-y divide-slate-800/50 relative z-10">
            {users.map(user => {
              const dept = departments.find(d => d.id === user.departmentId);
              return (
                <li key={user.id} className="p-5 hover:bg-slate-800/30 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-200">{user.name}</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">{dept?.name || 'Нет подразделения'}</p>
                  </div>
                  <div>
                     <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest font-bold ${
                      user.role === 'ADMIN' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {user.role === 'ADMIN' ? 'Начальник' : 'Работник'}
                    </span>
                  </div>
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
