
factoryProject/
├── README.md                         # запуск, стек, API, тестовые логины
├── docker-compose.yml                # Postgres + Django backend + React frontend
├── backend/                          # Django REST API и работа с PostgreSQL
│   ├── manage.py                     # Django management entrypoint
│   ├── requirements.txt              # Python-зависимости
│   ├── Dockerfile                    # контейнер backend
│   ├── populate_db.py                # заполнение тестовыми данными
│   ├── generate_data_dictionary_excel.py # генерация Excel-словаря БД
│   ├── config/                       # settings, urls, asgi/wsgi
│   ├── api/                          # модели, serializers, views, маршруты API
│   └── media/                        # загруженные фото оборудования
└── frontend/                         # React + TypeScript + Vite UI
    ├── package.json                  # npm scripts и зависимости
    ├── package-lock.json             # фиксированные версии npm-пакетов
    ├── Dockerfile                    # сборка frontend и nginx
    ├── nginx.conf                    # proxy /api и /media к backend
    ├── vite.config.ts                # Vite и dev proxy
    ├── index.html                    # HTML entrypoint
    ├── src/App.tsx                   # корневой компонент и навигация
    ├── src/main.tsx                  # React entrypoint
    ├── src/index.css                 # глобальные стили
    ├── src/context/                  # AuthContext и текущий пользователь
    ├── src/services/                 # API-клиент backend
    ├── src/lib/                      # типы, утилиты, работа с датами
    └── src/components/               # layout, UI-компоненты и экраны приложения

