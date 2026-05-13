# Интеграция Фронтенда с Бекендом - Документация

## 📋 Описание проекта

Проект представляет собой полнофункциональную систему управления производством (Factory Management System), где фронтенд (React + TypeScript + Vite) полностью интегрирован с бекендом (Django REST Framework + PostgreSQL).

## 🏗️ Архитектура

### Бекенд (Django)
- **Фреймворк**: Django 5.2.14
- **API**: Django REST Framework
- **База данных**: PostgreSQL
- **Порт**: 8000

#### Структура моделей:
```
Department (Цеха) ↔ UserProfile (Профили пользователей)
                    ↓
Task (Задачи) ← Comment (Комментарии)
Equipment (Оборудование)
Incident (Инциденты)
Message (Сообщения)
```

#### API Endpoints:
```
/api/users/              - Управление пользователями
/api/departments/        - Управление цехами  
/api/equipment/          - Управление оборудованием
/api/tasks/              - Управление задачами
/api/comments/           - Управление комментариями
/api/incidents/          - Управление инцидентами
/api/messages/           - Управление сообщениями
```

### Фронтенд (React + TypeScript)
- **Фреймворк**: React 18
- **Сборщик**: Vite
- **Стилизация**: Tailwind CSS
- **Роутер**: React Router
- **Состояние**: React Context API + useState hooks
- **Порт**: 3000

#### Структура компонентов:
```
App.tsx (основное приложение)
├── AuthContext.tsx (контекст аутентификации)
├── views/
│   ├── AdminDashboard.tsx      - Администраторская панель
│   ├── AdminTasks.tsx          - Управление задачами
│   ├── AdminEquipment.tsx      - Управление оборудованием
│   ├── AdminUsersAndDepts.tsx  - Управление пользователями
│   ├── Incidents.tsx           - Управление инцидентами
│   ├── Messages.tsx            - Сообщения
│   ├── WorkerEquipment.tsx     - Просмотр оборудования (рабочий)
│   └── WorkerTasks.tsx         - Мои задачи (рабочий)
├── layout/
│   ├── MainLayout.tsx
│   └── Topbar.tsx
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
└── services/
    └── api.ts (слой API)
```

## 🔗 API Интеграция

### Базовая конфигурация (src/services/api.ts)

```typescript
const API_BASE_URL = 'http://localhost:8000/api';

// Все запросы включают credentials для поддержки сессий
fetch(url, {
  credentials: 'include',
  ...options
})
```

### Основные операции:

#### 1. **Получение данных**
```typescript
api.getUsers()        // GET /api/users/
api.getDepartments()  // GET /api/departments/
api.getEquipment()    // GET /api/equipment/
api.getTasks()        // GET /api/tasks/
api.getIncidents()    // GET /api/incidents/
api.getMessages()     // GET /api/messages/
```

#### 2. **Создание данных**
```typescript
api.addUser(user)              // POST /api/users/
api.addDepartment(dept)        // POST /api/departments/
api.addEquipment(equipment)    // POST /api/equipment/
api.addTask(task)              // POST /api/tasks/
api.reportIncident(incident)   // POST /api/incidents/
api.sendMessage(message)       // POST /api/messages/
```

#### 3. **Обновление данных**
```typescript
api.updateTask(id, updates)    // PATCH /api/tasks/{id}/
api.resolveIncident(id)        // POST /api/incidents/{id}/resolve/
```

#### 4. **Удаление данных**
```typescript
api.deleteTask(id)             // DELETE /api/tasks/{id}/
```

#### 5. **Специальные операции**
```typescript
api.addCommentToTask(taskId, authorId, text)  // POST /api/tasks/{id}/add_comment/
```

## 📦 Настройка и запуск

### Требования
- Python 3.10+
- Node.js 16+
- PostgreSQL 12+

### Установка и запуск бекенда

```bash
# Перейти в директорию бекенда
cd backend

# Активировать виртуальное окружение (уже сделано)
# .venv/Scripts/activate на Windows
# source .venv/bin/activate на Linux/Mac

# Установить зависимости
pip install djangorestframework django-cors-headers psycopg2-binary

# Применить миграции
python manage.py migrate

# Заполнить БД тестовыми данными (опционально)
python manage.py populate_db.py

# Запустить сервер разработки
python manage.py runserver 0.0.0.0:8000
```

### Установка и запуск фронтенда

```bash
# Перейти в директорию фронтенда
cd frontend

# Установить зависимости
npm install

# Запустить сервер разработки
npm run dev

# В браузере перейти на http://localhost:3000
```

## 🔐 CORS Конфигурация

Бекенд настроен на принятие запросов с:
- `http://localhost:5173` (Vite по умолчанию)
- `http://localhost:3000` (если используется свой порт)
- `http://127.0.0.1:*` (localhost IP)

Это позволяет фронтенду безопасно обращаться к бекенду во время разработки.

## 🗄️ Структура БД

### Таблицы и связи:

```sql
Department
├── id (PK)
├── name
└── timestamps

UserProfile  
├── id (PK)
├── user (FK → User)
├── role (ADMIN/WORKER)
├── department (FK → Department)

User (встроенная таблица Django)
├── id, username, email
└── first_name, last_name

Task
├── id (PK)
├── title, description
├── creator (FK → User)
├── assignee (FK → User)
├── due_date
├── status (PENDING/COMPLETED)
└── timestamps

Comment
├── id (PK)
├── task (FK → Task)
├── author (FK → User)
├── text
└── created_at

Equipment
├── id (PK)
├── name
├── status (OPERATIONAL/BROKEN/EXPIRED)
├── expiration_date
├── department (FK → Department)
└── timestamps

Incident
├── id (PK)
├── type (ACCIDENT/BROKEN_EQUIPMENT)
├── description
├── reporter (FK → User)
├── equipment (FK → Equipment, nullable)
├── status (OPEN/RESOLVED)
├── urgency (HIGH/CRITICAL)
└── timestamps

Message
├── id (PK)
├── sender (FK → User)
├── receiver (FK → User)
├── text
├── read
└── created_at
```

## 🎯 Функциональность по ролям

### Администратор (ADMIN)
- ✅ Просмотр полной информационной панели
- ✅ Создание и редактирование задач
- ✅ Управление оборудованием
- ✅ Управление пользователями и цехами
- ✅ Просмотр инцидентов и их разрешение
- ✅ Отправка сообщений

### Рабочий (WORKER)
- ✅ Просмотр своих задач
- ✅ Отметить задачу как выполненную
- ✅ Добавлять комментарии к задачам
- ✅ Просмотр оборудования своего цеха
- ✅ Сообщать об инцидентах
- ✅ Обмен сообщениями с другими пользователями

## 🧪 Тестовые данные

При инициализации БД автоматически создаются:

**Пользователи:**
- `test_admin1` (пароль: password123) - Администратор
- `test_worker1`, `test_worker2`, `test_worker3` - Рабочие

**Отделения:**
- Цех сборки (Assembly Shop)
- Литейный цех (Foundry)
- Упаковочный цех (Packaging)

**Оборудование:**
- 3 единицы с разными статусами (OPERATIONAL, BROKEN, EXPIRED)

**Задачи:**
- 3 задачи с разными статусами и исполнителями

**Инциденты:**
- 2 открытых инцидента разных типов

## 🔄 Процесс обновления данных

Все компоненты используют паттерн:

```typescript
const loadData = async () => {
  const [t, u] = await Promise.all([api.getTasks(), api.getUsers()]);
  setTasks(t);
  setUsers(u);
};

useEffect(() => {
  loadData();
}, []);

// После создания/обновления/удаления
const handleAction = async () => {
  await api.doAction();
  loadData(); // Обновить данные из БД
};
```

## 📝 Примеры использования API

### Создание новой задачи
```typescript
const newTask = {
  title: 'Собрать детали',
  description: 'Описание...',
  assigneeId: '1',
  creatorId: '2',
  dueDate: '2026-05-20',
  status: 'PENDING'
};
const task = await api.addTask(newTask);
```

### Добавление комментария к задаче
```typescript
await api.addCommentToTask(
  taskId='1',
  authorId='1',
  text='Отлично, начну работу'
);
```

### Отправка инцидента
```typescript
const incident = {
  type: 'BROKEN_EQUIPMENT',
  description: 'Пресс не работает',
  reporterId: '1',
  equipmentId: '3',
  urgency: 'CRITICAL'
};
await api.reportIncident(incident);
```

## 🐛 Troubleshooting

### Ошибка 403 Forbidden
**Решение**: Убедитесь, что в `settings.py` установлено `DEFAULT_PERMISSION_CLASSES = ['rest_framework.permissions.AllowAny']`

### CORS ошибки
**Решение**: Проверьте, что в `CORS_ALLOWED_ORIGINS` указаны правильные адреса фронтенда

### Подключение к БД PostgreSQL
**Решение**: Проверьте параметры БД в `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'workshop_db',
        'USER': 'workshop_admin',
        'PASSWORD': '12345',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 📱 Типы данных в API

### User (Пользователь)
```typescript
interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  name: string; (вычисляемое поле)
  role: 'ADMIN' | 'WORKER';
  departmentId: number | null;
}
```

### Task (Задача)
```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  assigneeId: number;
  creatorId: number;
  dueDate: string; (ISO 8601)
  status: 'PENDING' | 'COMPLETED';
  comments: Comment[];
}
```

### Equipment (Оборудование)
```typescript
interface Equipment {
  id: number;
  name: string;
  status: 'OPERATIONAL' | 'BROKEN' | 'EXPIRED';
  expirationDate: string; (YYYY-MM-DD)
  departmentId: number;
}
```

## 🚀 Развертывание на production

1. Установить `gunicorn` для бекенда
2. Настроить ALLOWED_HOSTS с production домен
3. Установить DEBUG = False
4. Использовать переменные окружения для чувствительных данных
5. Собрать фронтенд: `npm run build`
6. Раздавать статику фронтенда из Django или отдельного сервера

## 📚 Дополнительные ресурсы

- Django Documentation: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- React Documentation: https://react.dev/
- Vite Documentation: https://vitejs.dev/

---

**Версия**: 1.0  
**Дата**: 10 мая 2026  
**Статус**: Production Ready
