import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { api } from '../../services/api';
import { Equipment, Department } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { Wrench, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Popup from '../ui/Popup';

export function WorkerEquipment() {
  const { currentUser } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popUpisOpen, setPopUpIsOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [e, d] = await Promise.all([api.getEquipment(), api.getDepartments()]);
      
      const updatedE = e.map(item => {
        if (item.status === 'OPERATIONAL' && isPast(new Date(item.expirationDate)) && !isToday(new Date(item.expirationDate))) {
           return { ...item, status: 'EXPIRED' as const };
        }
        return item;
      });

      // Show equipment for the user's department
      const myEq = updatedE.filter(eq => eq.departmentId === currentUser?.departmentId);
      
      setEquipment(myEq);
      setDepartments(d);
      setIsLoading(false);
    };
    loadData();
  }, [currentUser]);

  if (isLoading) return <div>Загрузка оборудования...</div>;

  const currentDept = departments.find(d => d.id === currentUser?.departmentId);
  const expiredEq = equipment.filter(e => e.status === 'EXPIRED');

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-6">
        <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Wrench className="w-5 h-5 text-slate-500" />
            </div>
            Оборудование: {currentDept?.name || 'Моё подразделение'}
         </h1>
      </div>

      {expiredEq.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
             <h3 className="font-bold text-amber-400 text-sm uppercase tracking-widest mb-1">Оборудование требует ТО</h3>
             <p className="text-amber-500/80 text-xs text-medium">Агрегаты ({expiredEq.length} ед.) имеют истекший срок эксплуатации.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipment.map(eq => {
          const isExpired = eq.status === 'EXPIRED';
          const isBroken = eq.status === 'BROKEN';

          return (
            <Card 
              key={eq.id} 
              className={`
                bg-white border transition-all hover:bg-slate-50
                ${isBroken ? 'border-red-500/30' : ''} 
                 ${isExpired ? 'border-amber-200' : 'border-slate-200'}
              `}
            >
              <CardContent className="p-6 flex items-start gap-4 flex-col">
                  {eq.photo ? (
                      <img src={eq.photo} alt={eq.name} className="w-32 h-32 rounded-xl object-cover border border-slate-200 cursor-pointer" onClick={() => setSelectedPhoto(eq.photo)} />
                  ) : null}
                 <div className={`p-3 rounded-xl ${
                      isBroken ? 'bg-red-100 text-red-600' : 
                    isExpired ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-100 text-slate-600'
                  }`}>
                    {isBroken ? <Flame className="w-6 h-6" /> : 
                     isExpired ? <AlertTriangle className="w-6 h-6" /> : 
                     <Wrench className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-slate-900">{eq.name}</h4>
                    <p className="text-[10px] uppercase tracking-widest font-bold mt-1.5 flex items-center gap-1.5">
                      Статус: {' '}
                      <span className={`
                         px-1.5 py-0.5 rounded
                          ${isBroken ? 'bg-red-100 text-red-700' : 
                            isExpired ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}
                      `}>
                         {isBroken ? 'КРИТИЧНО' : isExpired ? 'ТРЕБУЕТ ТО' : 'ИСПРАВНО'}
                      </span>
                    </p>
                    <p className={`text-[10px] uppercase tracking-widest font-bold mt-2 ${isExpired ? 'text-amber-700' : 'text-slate-500'}`}>
                      Истекает: {format(new Date(eq.expirationDate), 'dd.MM')}
                    </p>
                  </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
    {selectedPhoto && (
      <Popup imageUrl={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    )}
    </>
  );
}
