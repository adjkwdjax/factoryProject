export type Role = 'ADMIN' | 'WORKER';

export interface User {
  id: string;
  name: string;
  role: Role;
  departmentId: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Equipment {
  id: string;
  name: string;
  expirationDate: string;
  status: 'OPERATIONAL' | 'BROKEN' | 'EXPIRED';
  departmentId: string;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  creatorId: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED';
  comments: Comment[];
}

export interface Incident {
  id: string;
  type: 'ACCIDENT' | 'BROKEN_EQUIPMENT';
  description: string;
  reporterId: string;
  timestamp: string;
  status: 'OPEN' | 'RESOLVED';
  equipmentId?: string;
  urgency: 'HIGH' | 'CRITICAL';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Цех сборки' },
  { id: 'd2', name: 'Литейный цех' },
  { id: 'd3', name: 'Упаковочный цех' },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Иванов Иван (Начальник)', role: 'ADMIN', departmentId: 'd1' },
  { id: 'u2', name: 'Петров Петр (Сборщик)', role: 'WORKER', departmentId: 'd1' },
  { id: 'u3', name: 'Сидоров Сидор (Сварщик)', role: 'WORKER', departmentId: 'd2' },
  { id: 'u4', name: 'Алексеев Алексей (Сборщик)', role: 'WORKER', departmentId: 'd1' },
];

export const mockEquipment: Equipment[] = [
  { id: 'e1', name: 'Сварочный аппарат MIG-200', expirationDate: '2026-12-31', status: 'OPERATIONAL', departmentId: 'd2' },
  { id: 'e2', name: 'Конвейерная лента A-1', expirationDate: '2023-05-10', status: 'EXPIRED', departmentId: 'd1' },
  { id: 'e3', name: 'Пресс гидравлический', expirationDate: '2028-01-01', status: 'BROKEN', departmentId: 'd1' },
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Собрать 100 деталей типа А',
    description: 'Использовать новый чертеж. Сдать до конца смены.',
    assigneeId: 'u2',
    creatorId: 'u1',
    dueDate: '2026-05-11',
    status: 'PENDING',
    comments: [
      { id: 'c1', authorId: 'u1', text: 'Обратите внимание на допуски.', timestamp: '2026-05-10T08:00:00Z' }
    ],
  },
  {
    id: 't2',
    title: 'Замена фильтров в вытяжке',
    description: 'Регулярное ТО',
    assigneeId: 'u3',
    creatorId: 'u1',
    dueDate: '2026-05-09',
    status: 'COMPLETED',
    comments: [],
  },
  {
    id: 't3',
    title: 'Упаковать партию 45B',
    description: 'Готовим к отправке',
    assigneeId: 'u2',
    creatorId: 'u1',
    dueDate: '2026-05-12',
    status: 'COMPLETED',
    comments: [],
  }
];

export const mockIncidents: Incident[] = [
  {
    id: 'i1',
    type: 'BROKEN_EQUIPMENT',
    description: 'Заедает подачу материала',
    reporterId: 'u2',
    timestamp: '2026-05-10T09:15:00Z',
    status: 'OPEN',
    equipmentId: 'e3',
    urgency: 'HIGH',
  },
  {
    id: 'i2',
    type: 'ACCIDENT',
    description: 'Разлив масла в проходе 3, есть риск падения!',
    reporterId: 'u3',
    timestamp: '2026-05-10T10:05:00Z',
    status: 'OPEN',
    urgency: 'CRITICAL',
  }
];

export const mockMessages: Message[] = [
  { id: 'm1', senderId: 'u1', receiverId: 'u2', text: 'Зайди ко мне в кабинет после смены.', timestamp: '2026-05-10T09:00:00Z' },
  { id: 'm2', senderId: 'u2', receiverId: 'u1', text: 'Понял, буду.', timestamp: '2026-05-10T09:05:00Z' },
];
