#!/usr/bin/env python
"""
Скрипт для полной настройки и запуска проекта Factory Management System
Использование: python setup_project.py
"""

import os
import sys
import subprocess
import platform

def run_command(cmd, cwd=None, shell=True):
    """Выполнить команду в терминале"""
    print(f"▶ Выполнение: {cmd}")
    try:
        result = subprocess.run(cmd, cwd=cwd, shell=shell, capture_output=False)
        return result.returncode == 0
    except Exception as e:
        print(f"✗ Ошибка: {e}")
        return False

def setup_backend():
    """Настройка бекенда"""
    print("\n" + "="*60)
    print("🔧 НАСТРОЙКА БЕКЕНДА (Django + PostgreSQL)")
    print("="*60)
    
    backend_path = os.path.join(os.path.dirname(__file__), 'backend')
    
    # Проверить PostgreSQL
    print("\n✓ Убедитесь, что PostgreSQL запущен и БД 'workshop_db' создана")
    print("  Подключение: postgres://workshop_admin:12345@localhost:5432/workshop_db")
    
    # Установить зависимости Python
    print("\n📦 Установка зависимостей Python...")
    if not run_command(f"{sys.executable} -m pip install -r requirements.txt", cwd=backend_path):
        print("✗ Ошибка установки зависимостей")
        return False
    
    # Применить миграции
    print("\n🗄️  Применение миграций...")
    if platform.system() == "Windows":
        if not run_command(".venv\\Scripts\\python manage.py migrate", cwd=backend_path):
            return False
    else:
        if not run_command(".venv/bin/python manage.py migrate", cwd=backend_path):
            return False
    
    # Заполнить БД тестовыми данными
    print("\n📝 Заполнение БД тестовыми данными...")
    if platform.system() == "Windows":
        if not run_command(".venv\\Scripts\\python populate_db.py", cwd=backend_path):
            print("⚠ Ошибка при заполнении БД (может быть уже заполнена)")
    else:
        if not run_command(".venv/bin/python populate_db.py", cwd=backend_path):
            print("⚠ Ошибка при заполнении БД (может быть уже заполнена)")
    
    print("\n✅ Бекенд настроен успешно!")
    print("Запуск: python manage.py runserver 0.0.0.0:8000")
    return True

def setup_frontend():
    """Настройка фронтенда"""
    print("\n" + "="*60)
    print("⚛️  НАСТРОЙКА ФРОНТЕНДА (React + Vite)")
    print("="*60)
    
    frontend_path = os.path.join(os.path.dirname(__file__), 'frontend')
    
    # Установить зависимости npm
    print("\n📦 Установка зависимостей npm...")
    if not run_command("npm install", cwd=frontend_path):
        print("✗ Ошибка установки зависимостей npm")
        return False
    
    print("\n✅ Фронтенд настроен успешно!")
    print("Запуск: npm run dev")
    return True

def create_requirements():
    """Создать requirements.txt для бекенда"""
    requirements = """Django==5.2.14
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
python-dateutil==2.8.2
"""
    
    backend_path = os.path.join(os.path.dirname(__file__), 'backend')
    req_file = os.path.join(backend_path, 'requirements.txt')
    
    if not os.path.exists(req_file):
        with open(req_file, 'w') as f:
            f.write(requirements)
        print("✓ Создан файл requirements.txt")
    
def main():
    print("""
╔════════════════════════════════════════════════════════════╗
║   Factory Management System - Setup Script                ║
║   Система управления производством                         ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    # Создать requirements.txt
    create_requirements()
    
    # Предварительные проверки
    print("\n📋 Предварительные проверки...")
    
    if not os.path.exists('backend'):
        print("✗ Папка backend не найдена")
        return False
    
    if not os.path.exists('frontend'):
        print("✗ Папка frontend не найдена")
        return False
    
    print("✓ Структура проекта правильная")
    
    # Запросить, что настраивать
    print("\n" + "="*60)
    print("Что вы хотите настроить?")
    print("1. Только бекенд")
    print("2. Только фронтенд")
    print("3. Оба (бекенд + фронтенд)")
    print("="*60)
    
    choice = input("\nВыберите опцию (1/2/3): ").strip()
    
    success = True
    
    if choice in ['1', '3']:
        success = success and setup_backend()
    
    if choice in ['2', '3']:
        success = success and setup_frontend()
    
    if success:
        print("\n" + "="*60)
        print("✅ ПОЛНАЯ НАСТРОЙКА ЗАВЕРШЕНА!")
        print("="*60)
        print("\n🚀 Для запуска приложения:")
        print("\n1️⃣  Бекенд (в отдельном терминале):")
        print("   cd backend")
        if platform.system() == "Windows":
            print("   .venv\\Scripts\\python manage.py runserver 0.0.0.0:8000")
        else:
            print("   .venv/bin/python manage.py runserver 0.0.0.0:8000")
        
        print("\n2️⃣  Фронтенд (в отдельном терминале):")
        print("   cd frontend")
        print("   npm run dev")
        
        print("\n3️⃣  Откройте браузер:")
        print("   http://localhost:3000")
        
        print("\n📚 Для дополнительной информации смотрите INTEGRATION_GUIDE.md")
    else:
        print("\n" + "="*60)
        print("✗ Ошибки при настройке. Смотрите выше для деталей.")
        print("="*60)
        return False
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
