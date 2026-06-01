import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../services/api';
import { Message, User } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Send } from 'lucide-react';

export function MessagesView() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessageStr, setNewMessageStr] = useState('');

  const loadData = async () => {
    const [m, u] = await Promise.all([api.getMessages(), api.getUsers()]);
    setMessages(m);
    setUsers(u.filter(user => user.id !== currentUser?.id));
    
    if (!selectedUserId && u.length > 0) {
       const others = u.filter(user => user.id !== currentUser?.id);
       if (others.length > 0) setSelectedUserId(others[0].id);
    }
    
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [currentUser]);

  const handleSend = async () => {
    if (!newMessageStr.trim() || !selectedUserId) return;
    await api.sendMessage({
      senderId: currentUser!.id,
      receiverId: selectedUserId,
      text: newMessageStr.trim()
    });
    setNewMessageStr('');
    loadData();
  };

  if (isLoading) return <div>Загрузка сообщений...</div>;

  const conversationUsers = users;
  
  const conversationMessages = messages.filter(m => 
    (m.senderId === currentUser?.id && m.receiverId === selectedUserId) ||
    (m.receiverId === currentUser?.id && m.senderId === selectedUserId)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row gap-6 text-slate-900">
      
      {/* Users List */}
      <section className="bg-white border border-slate-200 rounded-2xl md:w-1/3 flex flex-col overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white z-10">
          <h2 className="text-xl font-semibold text-slate-900">Контакты</h2>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{users.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-200 min-h-0">
           {conversationUsers.map(u => (
             <button
               key={u.id}
               onClick={() => setSelectedUserId(u.id)}
               className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 ${selectedUserId === u.id ? 'bg-amber-50 border-1-2 border-amber-500' : 'border-l-2 border-transparent'}`}
             >
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${u.role === 'ADMIN' || u.role === 'DEPARTMENT_HEAD' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                 {u.name.charAt(0)}
               </div>
               <div className="overflow-hidden">
                 <p className="font-medium text-sm text-slate-900 truncate">{u.name}</p>
                 <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold truncate mt-0.5">{u.role === 'ADMIN' ? 'Начальник цеха' : u.role === 'DEPARTMENT_HEAD' ? 'Начальник подразделения' : 'Сотрудник'}</p>
               </div>
             </button>
           ))}
        </div>
      </section>

      {/* Chat Area */}
      <section className="bg-white border border-slate-200 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 bg-white z-10 flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <h3 className="font-semibold text-slate-900">
             {users.find(u => u.id === selectedUserId)?.name || 'Выберите контакт'}
           </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4 relative min-h-0">
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-100 via-white to-white pointer-events-none"></div>

          {conversationMessages.length === 0 ? (
             <div className="text-center text-slate-500 mt-20 text-xs font-bold uppercase tracking-widest relative z-10">
               Нет сообщений.
             </div>
          ) : (
            conversationMessages.map(msg => {
              const isMe = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`flex flex-col relative z-10 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 max-w-[80%] ${isMe ? 'bg-amber-100 text-slate-900 rounded-2xl rounded-br-sm shadow-sm border border-amber-200' : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm border border-slate-200'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1.5 font-bold uppercase tracking-widest ${isMe ? 'text-amber-700' : 'text-slate-500'}`}>
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex gap-3 z-10">
          <Input 
             placeholder="Введите сообщение..." 
             value={newMessageStr}
             onChange={(e) => setNewMessageStr(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             className="flex-1 bg-white border-slate-200"
          />
           <Button onClick={handleSend} className="w-12 h-[42px] p-0 flex items-center justify-center shrink-0 bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/20">
             <Send className="w-5 h-5 -ml-0.5" />
          </Button>
        </div>
      </section>

    </div>
  );
}
