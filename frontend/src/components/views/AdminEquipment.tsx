import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { api } from '../../services/api';
import { Department, Equipment } from '../../lib/mockData';
import { Plus, AlertTriangle, CheckCircle, Flame, Upload } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Popup from '../ui/Popup';

export function AdminEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newEq, setNewEq] = useState({ name: '', expirationDate: '', departmentId: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadData = async () => {
    const [e, d] = await Promise.all([api.getEquipment(), api.getDepartments()]);
    // automatically mark expired if date is past
    const updatedE = e.map(item => {
      if (item.status === 'OPERATIONAL' && isPast(new Date(item.expirationDate)) && !isToday(new Date(item.expirationDate))) {
         return { ...item, status: 'EXPIRED' as const };
      }
      return item;
    });

    setEquipment(updatedE);
    setDepartments(d);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    let url: string | null = null;
    if (photoFile) {
      url = URL.createObjectURL(photoFile);
      setPreviewUrl(url);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [photoFile]);

  const handleAdd = async () => {
    if (!newEq.name || !newEq.expirationDate || !newEq.departmentId) return;
    await api.addEquipment({
      ...newEq,
      photoFile,
      status: 'OPERATIONAL'
    });
    setNewEq({ name: '', expirationDate: '', departmentId: '' });
    setPhotoFile(null);
    loadData();
  };

  if (isLoading) return <div>Загрузка базы оборудования...</div>;

  return (
    <div className="space-y-6 flex flex-col flex-1">
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Учет оборудования</h1>
      </div>
      
      <Card className="bg-white border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-amber-700 mb-4 uppercase tracking-wider flex items-center gap-2">
             <Plus className="w-4 h-4" /> ДОБАВИТЬ ОБОРУДОВАНИЕ
          </h3>
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Наименование</label>
              <Input value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Подразделение</label>
              <Select value={newEq.departmentId} onChange={e => setNewEq({...newEq, departmentId: e.target.value})}>
                <option value="">Выберите подразделение...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Окончание срока эксплуатации</label>
              <Input type="date" value={newEq.expirationDate} onChange={e => setNewEq({...newEq, expirationDate: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Фото</label>
              <Input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
              {photoFile && previewUrl && (
                <img src={previewUrl} alt="preview" className="w-24 h-24 rounded-md mt-2 object-cover border border-slate-200 cursor-pointer" onClick={() => setSelectedPhoto(previewUrl)} />
              )}
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={!newEq.name || !newEq.expirationDate || !newEq.departmentId}>
              Добавить
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col flex-1 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Текущее оборудование</h3>
        <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar min-h-0">
          {equipment.map(eq => {
            const dept = departments.find(d => d.id === eq.departmentId);
            const isExpired = eq.status === 'EXPIRED';
            const isBroken = eq.status === 'BROKEN';

            return (
              <div 
                key={eq.id} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isBroken ? 'bg-red-500/5 border-red-500/20' : 
                  isExpired ? 'bg-orange-500/5 border-orange-500/20' : 
                  'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center gap-4 w-full">
                  <div className="flex items-center gap-4">
                    {eq.photo ? (
                      <img src={eq.photo} alt={eq.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200 cursor-pointer" onClick={() => setSelectedPhoto(eq.photo)} />
                    ) : (
                      <div className="w-14 h-14 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-500 text-[10px] uppercase tracking-widest">
                        Фото
                      </div>
                    )}
                    <div className={`p-2 rounded-lg ${
                      isBroken ? 'bg-red-100 text-red-600' : 
                      isExpired ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {isBroken ? <Flame className="w-5 h-5" /> : 
                       isExpired ? <AlertTriangle className="w-5 h-5" /> : 
                       <CheckCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{eq.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                        Локация: {dept?.name || 'Неизвестно'} • Истекает: {format(new Date(eq.expirationDate), 'dd.MM.yyyy')}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                       isBroken ? 'bg-red-100 text-red-700 border border-red-200' : 
                       isExpired ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                       'bg-slate-100 text-slate-600 border border-slate-200'
                   }`}>
                     {isBroken ? 'Критично' : isExpired ? 'Требует ТО' : 'Исправно'}
                   </span>
                </div>
              </div>
            )
          })}
          {equipment.length === 0 && <p className="text-sm text-slate-500 p-4">Нет оборудования.</p>}
        </div>
      </section>
      {selectedPhoto && (
        <Popup imageUrl={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
}
