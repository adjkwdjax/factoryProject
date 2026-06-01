import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './components/views/LoginPage';
import { AdminDashboard } from './components/views/AdminDashboard';
import { AdminTasks } from './components/views/AdminTasks';
import { AdminUsersAndDepts } from './components/views/AdminUsersAndDepts';
import { AdminEquipment } from './components/views/AdminEquipment';
import { WorkerTasks } from './components/views/WorkerTasks';
import { WorkerEquipment } from './components/views/WorkerEquipment';
import { IncidentsView } from './components/views/Incidents';
import { MessagesView } from './components/views/Messages';

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  

  const [currentNav, setCurrentNav] = useState('');


  if (!currentNav && currentUser) {
    setCurrentNav(currentUser.role === 'WORKER' ? 'my-tasks' : 'dashboard');
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-sm">Загрузка портала завода...</div>;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderView = () => {
    switch (currentNav) {
      case 'dashboard': return <AdminDashboard />;
      case 'tasks': return <AdminTasks showHistory={false} />;
      case 'tasks-history': return <AdminTasks showHistory={true} />;
      case 'equipment': return <AdminEquipment />;
      case 'users': return <AdminUsersAndDepts />;
      
      case 'my-tasks': return <WorkerTasks showHistory={false} />;
      case 'my-tasks-history': return <WorkerTasks showHistory={true} />;
      case 'equipment-status': return <WorkerEquipment />;
      case 'report-incident': return <IncidentsView />;
      case 'incidents': return <IncidentsView />;
      
      case 'messages': return <MessagesView />;
      
      default: return <div>404: View not found</div>;
    }
  };

  return (
    <MainLayout currentNav={currentNav} onNavigate={setCurrentNav}>
      {renderView()}
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

