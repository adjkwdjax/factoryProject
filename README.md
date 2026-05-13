# 🏭 Factory Management System

Полнофункциональная система управления производством с веб-интерфейсом. Приложение позволяет управлять задачами, оборудованием, сотрудниками, инцидентами и сообщениями на производстве.

## 🌟 Особенности

- ✅ **Управление задачами**: создание, редактирование, отслеживание статуса
- ✅ **Учет оборудования**: регистрация, отслеживание сроков эксплуатации, статуса
- ✅ **Управление персоналом**: создание профилей, распределение по цехам, назначение ролей
- ✅ **Система инцидентов**: сообщение об авариях, отслеживание статуса
- ✅ **Внутренняя переписка**: обмен сообщениями между сотрудниками
- ✅ **Аналитика**: информационная панель с ключевыми метриками
- ✅ **Роль-базированный доступ**: разные возможности для администраторов и рабочих

## 📊 Демо

Приложение включает предзаполненные данные для быстрого старта:
- 4 пользователя (1 администратор, 3 рабочих)
- 3 цеха
- 3 единицы оборудования
- 3 задачи
- 2 инцидента
- 2 сообщения

## 🛠️ Технический стек

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

## 🚀 Быстрый старт

### 1. Подготовка БД PostgreSQL

```bash
# Создать БД и пользователя (от администратора PostgreSQL)
psql -U postgres -c "CREATE DATABASE workshop_db;"
psql -U postgres -c "CREATE USER workshop_admin WITH PASSWORD '12345';"
psql -U postgres -c "ALTER ROLE workshop_admin SET client_encoding TO 'utf8';"
psql -U postgres -c "ALTER ROLE workshop_admin SET default_transaction_isolation TO 'read committed';"
psql -U postgres -c "ALTER ROLE workshop_admin SET default_transaction_deferrable TO on;"
psql -U postgres -c "ALTER ROLE workshop_admin SET timezone TO 'UTC';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE workshop_db TO workshop_admin;"
```

### 2. Запуск бекенда

```bash
cd backend

# Windows
.venv\Scripts\python manage.py migrate
.venv\Scripts\python populate_db.py
.venv\Scripts\python manage.py runserver 0.0.0.0:8000

# Linux/Mac
source .venv/bin/activate
python manage.py migrate
python populate_db.py
python manage.py runserver 0.0.0.0:8000
```

**Бекенд будет доступен по адресу**: `http://localhost:8000`

### 3. Запуск фронтенда

```bash
cd frontend

# Установить зависимости (если еще не установлены)
npm install

# Запустить development сервер
npm run dev
```

**Фронтенд будет доступен по адресу**: `http://localhost:3000`

### 4. Открыть приложение

Откройте браузер и перейдите на `http://localhost:3000`

## 🔐 Учетные данные для входа

### Администратор
- **Имя пользователя**: test_admin1
- **Пароль**: password123
- **Роль**: ADMIN

### Рабочие
- **test_worker1** / password123
- **test_worker2** / password123
- **test_worker3** / password123

Или просто выберите пользователя из выпадающего списка в приложении (для demo режима).

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
│
├── INTEGRATION_GUIDE.md        # Подробное руководство интеграции
├── setup_project.py           # Скрипт автоматизированной установки
└── README.md                  # Этот файл
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

## 🐛 Решение проблем

### Ошибка подключения к БД
```
django.core.exceptions.ImproperlyConfigured: Error loading psycopg2 or psycopg module
```
**Решение**: Убедитесь, что установлен psycopg2-binary
```bash
pip install psycopg2-binary
```

### CORS ошибка
```
Access to XMLHttpRequest blocked by CORS policy
```
**Решение**: Проверьте, что в `settings.py` правильно установлены CORS параметры и фронтенд запущен на правильном порту.

### 403 Forbidden при API запросах
**Решение**: Убедитесь, что в `settings.py` установлено:
```python
'DEFAULT_PERMISSION_CLASSES': [
    'rest_framework.permissions.AllowAny',
]
```

### PostgreSQL не запустится
**Решение**: 
- Убедитесь, что PostgreSQL установлен и запущен
- Проверьте параметры подключения в `settings.py`
- Попробуйте подключиться вручную: `psql -U workshop_admin -d workshop_db`

## 📚 Дополнительные команды

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

## 🚀 Production развертывание

### Бекенд
1. Установить gunicorn: `pip install gunicorn`
2. Собрать статические файлы: `python manage.py collectstatic`
3. Запустить: `gunicorn config.wsgi:application --bind 0.0.0.0:8000`
4. Настроить nginx как reverse proxy
5. Установить SSL сертификат (Let's Encrypt)

### Фронтенд
1. Собрать проект: `npm run build`
2. Загрузить содержимое `dist/` на хостинг
3. Настроить перенаправления на `index.html` для SPA

## 📖 Документация

Для подробной информации о разработке и интеграции смотрите:
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Полное руководство интеграции
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)

## 🤝 Вклад

Для добавления новых функций:
1. Создайте ветку: `git checkout -b feature/name`
2. Создайте модель в `backend/api/models.py`
3. Создайте сериализатор в `backend/api/serializers.py`
4. Создайте viewset в `backend/api/views.py`
5. Зарегистрируйте в `backend/api/urls.py`
6. Обновите `frontend/src/services/api.ts`
7. Создайте компонент в `frontend/src/components/views/`

## 📄 Лицензия

MIT License - смотрите LICENSE файл

## 👥 Автор

Factory Management System - система управления производством (2026)

---

**Версия**: 1.0  
**Дата**: 10 мая 2026  
**Статус**: Production Ready ✅

## ❓ Часто задаваемые вопросы

**Q: Как добавить нового пользователя?**
A: Используйте раздел "Сотрудники и Цехи" в админ панели или создайте через Django shell:
```python
from django.contrib.auth.models import User
from api.models import UserProfile, Department
dept = Department.objects.first()
user = User.objects.create_user('username', 'email@example.com', 'password')
UserProfile.objects.create(user=user, role='WORKER', department=dept)
```

**Q: Как восстановить demo данные?**
A: Запустите скрипт заполнения:
```bash
python populate_db.py
```

**Q: Могу ли я использовать SQLite вместо PostgreSQL?**
A: Да, но это не рекомендуется для production. Измените в `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'db.sqlite3',
    }
}
```

**Q: Как увеличить производительность?**
A: 
- Используйте кэширование (Redis)
- Добавьте индексы в БД
- Оптимизируйте запросы SELECT_RELATED и PREFETCH_RELATED
- Использовать асинхронные задачи (Celery)

---

Спасибо за использование Factory Management System! 🎉
