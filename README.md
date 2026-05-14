- ✅ **Управление задачами**: создание, редактирование, отслеживание статуса
- ✅ **Учет оборудования**: регистрация, отслеживание сроков эксплуатации, статуса
- ✅ **Управление персоналом**: создание профилей, распределение по цехам, назначение ролей
- ✅ **Система инцидентов**: сообщение об авариях, отслеживание статуса
- ✅ **Внутренняя переписка**: обмен сообщениями между сотрудниками
- ✅ **Аналитика**: информационная панель с ключевыми метриками
- ✅ **Роль-базированный доступ**: разные возможности для администраторов и рабочих

## Стек

### Бекенд
- **Django 5.2** - веб-фреймворк
- **Django REST Framework** - API
- **PostgreSQL** - база данных
- **django-cors-headers** - CORS поддержка

### Фронтенд
- **React 18** - UI библиотека
- **TypeScript** - типизированный JavaScript
- **Vite** - сборщик модулей
- **Tailwind CSS** - CSS фреймворк
- **date-fns** - работа с датами

## 📋 Требования

- Python 3.10+
- Node.js 16+
- PostgreSQL 12+
- npm 8+

## Запуск

### 1. Подготовка БД PostgreSQL

```bash
# Создать БД и пользователя
psql -U postgres -c "CREATE DATABASE workshop_db;"
psql -U postgres -c "CREATE USER workshop_admin WITH PASSWORD '12345';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE workshop_db TO workshop_admin;"
```

### 2. Запуск бекенда

```bash
cd backend

# Windows
python manage.py migrate
python populate_db.py
python manage.py runserver 0.0.0.0:8000
```

**Бекенд будет доступен по адресу**: `http://localhost:8000`

### 3. Запуск фронтенда

```bash
cd frontend

# Установить зависимости
npm install

# Запустить сервер
npm run dev
```

**Фронтенд будет доступен по адресу**: `http://localhost:3000`

## Учетные данные для входа

### Администратор
- **Имя пользователя**: test_admin1
- **Пароль**: password123

### Рабочие
- **test_worker1** / password123
- **test_worker2** / password123
- **test_worker3** / password123

## 📁 Структура проекта

```
factory-project/
├── backend/                    # Django приложение
│   ├── config/                 # Настройки Django
│   │   ├── settings.py        # Основные настройки
│   │   ├── urls.py            # Маршруты
│   │   └── wsgi.py
│   ├── api/                    # REST API приложение
│   │   ├── models.py          # Модели БД
│   │   ├── serializers.py     # Сериализаторы API
│   │   ├── views.py           # Представления API
│   │   ├── urls.py            # API маршруты
│   │   ├── admin.py           # Django админ панель
│   │   └── migrations/        # Миграции БД
│   ├── manage.py              # Инструмент управления Django
│   ├── populate_db.py         # Скрипт заполнения БД
│   └── requirements.txt        # Зависимости Python
│
├── frontend/                   # React приложение
│   ├── src/
│   │   ├── components/
│   │   │   ├── views/         # Страницы приложения
│   │   │   ├── layout/        # Компоненты макета
│   │   │   └── ui/            # UI компоненты
│   │   ├── services/
│   │   │   └── api.ts         # Клиент API
│   │   ├── context/           # React Context
│   │   ├── lib/               # Утилиты и типы
│   │   ├── App.tsx            # Главный компонент
│   │   ├── main.tsx           # Точка входа
│   │   └── index.css          # Глобальные стили
│   ├── package.json           # Зависимости npm
│   ├── vite.config.ts         # Конфигурация Vite
│   └── tsconfig.json          # Конфигурация TypeScript
```

## 🔌 API Endpoints

Все endpoints доступны по адресу `http://localhost:8000/api/`

### Users (Пользователи)
- `GET /api/users/` - получить всех пользователей
- `POST /api/users/` - создать пользователя
- `GET /api/users/{id}/` - получить пользователя
- `PATCH /api/users/{id}/` - обновить пользователя

### Departments (Цеха)
- `GET /api/departments/` - все цеха
- `POST /api/departments/` - создать цех
- `PATCH /api/departments/{id}/` - обновить цех

### Equipment (Оборудование)
- `GET /api/equipment/` - все оборудование
- `POST /api/equipment/` - добавить оборудование
- `PATCH /api/equipment/{id}/` - обновить оборудование

### Tasks (Задачи)
- `GET /api/tasks/` - все задачи
- `POST /api/tasks/` - создать задачу
- `PATCH /api/tasks/{id}/` - обновить задачу
- `DELETE /api/tasks/{id}/` - удалить задачу
- `POST /api/tasks/{id}/add_comment/` - добавить комментарий

### Comments (Комментарии)
- `GET /api/comments/` - все комментарии
- `POST /api/comments/` - создать комментарий

### Incidents (Инциденты)
- `GET /api/incidents/` - все инциденты
- `POST /api/incidents/` - сообщить об инциденте
- `POST /api/incidents/{id}/resolve/` - разрешить инцидент

### Messages (Сообщения)
- `GET /api/messages/` - все сообщения
- `POST /api/messages/` - отправить сообщение
- `GET /api/messages/received/` - полученные сообщения
- `GET /api/messages/sent/` - отправленные сообщения

## 🎯 Функционал по ролям

### Администратор (ADMIN)
Полный доступ ко всем функциям:
- 📊 Просмотр информационной панели и аналитики
- ✏️ Создание и редактирование задач
- 🔧 Управление оборудованием
- 👥 Управление пользователями и цехами
- ⚠️ Просмотр и разрешение инцидентов
- 💬 Обмен сообщениями

### Рабочий (WORKER)
Ограниченный доступ:
- 📋 Просмотр назначенных задач
- ✅ Отметить задачу как выполненную
- 💬 Добавлять комментарии к задачам
- 🔍 Просмотр оборудования своего цеха
- ⚠️ Сообщать об инцидентах
- 📧 Обмен сообщениями с другими сотрудниками

### Django
```bash
# Создать новую миграцию
python manage.py makemigrations

# Применить миграции
python manage.py migrate

# Запустить Django shell
python manage.py shell

# Создать суперпользователя для админ панели
python manage.py createsuperuser

# Очистить кэш миграций
python manage.py migrate api zero
```

### npm
```bash
# Собрать проект для production
npm run build

# Запустить unit тесты
npm run test

# Lint код
npm run lint
```
