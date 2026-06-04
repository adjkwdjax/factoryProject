import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { api } from '../../services/api';
import { Department, Equipment } from '../../lib/mockData';
import { Plus, AlertTriangle, CheckCircle, Flame, Edit2, Save, Trash2, X } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Popup from '../ui/Popup';
import { useAuth } from '../../context/AuthContext';

const defaultStatus: Equipment['status'] = 'OPERATIONAL';

export function AdminEquipment() {
  const { currentUser } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newEq, setNewEq] = useState({ name: '', expirationDate: '', departmentId: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEq, setEditingEq] = useState({
    name: '',
    expirationDate: '',
    departmentId: '',
    status: defaultStatus,
  });
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  const loadData = async () => {
    const [e, d] = await Promise.all([api.getEquipment(), api.getDepartments()]);
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

  useEffect(() => {
    let url: string | null = null;
    if (editPhotoFile) {
      url = URL.createObjectURL(editPhotoFile);
      setEditPreviewUrl(url);
    } else {
      setEditPreviewUrl(null);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [editPhotoFile]);

  const visibleDepartments = currentUser?.role === 'DEPARTMENT_HEAD'
    ? departments.filter(department => department.id === currentUser.departmentId)
    : departments;

  const visibleEquipment = currentUser?.role === 'DEPARTMENT_HEAD'
    ? equipment.filter(eq => eq.departmentId === currentUser.departmentId)
    : equipment;

  const handleAdd = async () => {
    if (!newEq.name || !newEq.expirationDate || !newEq.departmentId) return;
    await api.addEquipment({
      ...newEq,
      photoFile,
      status: 'OPERATIONAL',
    });
    setNewEq({ name: '', expirationDate: '', departmentId: '' });
    setPhotoFile(null);
    loadData();
  };

  const startEditing = (eq: Equipment) => {
    setEditingId(eq.id);
    setEditingEq({
      name: eq.name,
      expirationDate: eq.expirationDate,
      departmentId: eq.departmentId,
      status: eq.status,
    });
    setEditPhotoFile(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPhotoFile(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editingEq.name || !editingEq.expirationDate || !editingEq.departmentId) return;
    await api.updateEquipment(id, {
      ...editingEq,
      photoFile: editPhotoFile,
    });
    setEditingId(null);
    setEditPhotoFile(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить оборудование?')) return;
    await api.deleteEquipment(id);
    if (editingId === id) cancelEditing();
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
              <Input value={newEq.name} onChange={e => setNewEq({ ...newEq, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Подразделение</label>
              <Select value={newEq.departmentId} onChange={e => setNewEq({ ...newEq, departmentId: e.target.value })}>
                <option value="">Выберите подразделение...</option>
                {visibleDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Окончание срока эксплуатации</label>
              <Input type="date" value={newEq.expirationDate} onChange={e => setNewEq({ ...newEq, expirationDate: e.target.value })} />
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
          {visibleEquipment.map(eq => {
            const dept = departments.find(d => d.id === eq.departmentId);
            const isExpired = eq.status === 'EXPIRED';
            const isBroken = eq.status === 'BROKEN';
            const isEditing = editingId === eq.id;

            return (
              <div
                key={eq.id}
                className={`p-4 rounded-xl border transition-all ${
                  isBroken ? 'bg-red-500/5 border-red-500/20' :
                  isExpired ? 'bg-orange-500/5 border-orange-500/20' :
                  'bg-slate-50 border-slate-200'
                }`}
              >
                {isEditing ? (
                  <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-4 w-full items-start">
                    <div className="space-y-2">
                      {(editPreviewUrl || eq.photo) ? (
                        <img src={editPreviewUrl || eq.photo || ''} alt={eq.name} className="w-24 h-24 rounded-xl object-cover border border-slate-200 cursor-pointer" onClick={() => setSelectedPhoto(editPreviewUrl || eq.photo || null)} />
                      ) : (
                        <div className="w-24 h-24 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-500 text-[10px] uppercase tracking-widest">
                          Фото
                        </div>
                      )}
                      <Input type="file" accept="image/*" className="text-xs p-2" onChange={e => setEditPhotoFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Наименование</label>
                        <Input value={editingEq.name} onChange={e => setEditingEq({ ...editingEq, name: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Подразделение</label>
                        <Select value={editingEq.departmentId} onChange={e => setEditingEq({ ...editingEq, departmentId: e.target.value })} disabled={currentUser?.role === 'DEPARTMENT_HEAD'}>
                          {visibleDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Срок эксплуатации</label>
                        <Input type="date" value={editingEq.expirationDate} onChange={e => setEditingEq({ ...editingEq, expirationDate: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Статус</label>
                        <Select value={editingEq.status} onChange={e => setEditingEq({ ...editingEq, status: e.target.value as Equipment['status'] })}>
                          <option value="OPERATIONAL">Исправно</option>
                          <option value="BROKEN">Критично</option>
                          <option value="EXPIRED">Требует ТО</option>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" onClick={() => handleUpdate(eq.id)} disabled={!editingEq.name || !editingEq.expirationDate || !editingEq.departmentId}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEditing}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
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
                          Локация: {dept?.name || 'Неизвестно'} • Окончание срока эксплуатации: {format(new Date(eq.expirationDate), 'dd.MM.yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                        isBroken ? 'bg-red-100 text-red-700 border border-red-200' :
                        isExpired ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {isBroken ? 'Критично' : isExpired ? 'Требует ТО' : 'Исправно'}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => startEditing(eq)} className="text-slate-500 hover:text-slate-900">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(eq.id)} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {visibleEquipment.length === 0 && <p className="text-sm text-slate-500 p-4">Нет оборудования.</p>}
        </div>
      </section>
      {selectedPhoto && (
        <Popup imageUrl={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
}
