import os
import django
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Department, UserProfile, Equipment, Task, Comment, Incident, Message


def create_initial_data():
    # Clear existing data
    print("Clearing existing data...")
    Message.objects.all().delete()
    Incident.objects.all().delete()
    Comment.objects.all().delete()
    Task.objects.all().delete()
    Equipment.objects.all().delete()
    UserProfile.objects.all().delete()
    User.objects.filter(username__startswith='test_').delete()
    Department.objects.all().delete()

    # Create departments
    print("Creating departments...")
    dept1 = Department.objects.create(name='Цех сборки')
    dept2 = Department.objects.create(name='Литейный цех')
    dept3 = Department.objects.create(name='Упаковочный цех')

    # Create users
    print("Creating users...")
    user1 = User.objects.create_user(
        username='test_admin1',
        first_name='Иванов',
        last_name='Иван',
        email='admin1@factory.com',
        password='password123'
    )
    UserProfile.objects.create(user=user1, role='ADMIN', department=dept1)

    user2 = User.objects.create_user(
        username='test_worker1',
        first_name='Петров',
        last_name='Петр',
        email='worker1@factory.com',
        password='password123'
    )
    UserProfile.objects.create(user=user2, role='WORKER', department=dept1)

    user3 = User.objects.create_user(
        username='test_worker2',
        first_name='Сидоров',
        last_name='Сидор',
        email='worker2@factory.com',
        password='password123'
    )
    UserProfile.objects.create(user=user3, role='WORKER', department=dept2)

    user4 = User.objects.create_user(
        username='test_worker3',
        first_name='Алексеев',
        last_name='Алексей',
        email='worker3@factory.com',
        password='password123'
    )
    UserProfile.objects.create(user=user4, role='WORKER', department=dept1)

    # Create equipment
    print("Creating equipment...")
    eq1 = Equipment.objects.create(
        name='Сварочный аппарат MIG-200',
        status='OPERATIONAL',
        expiration_date=timezone.now().date() + timedelta(days=600),
        department=dept2
    )
    eq2 = Equipment.objects.create(
        name='Конвейерная лента A-1',
        status='EXPIRED',
        expiration_date=timezone.now().date() - timedelta(days=100),
        department=dept1
    )
    eq3 = Equipment.objects.create(
        name='Пресс гидравлический',
        status='BROKEN',
        expiration_date=timezone.now().date() + timedelta(days=800),
        department=dept1
    )

    # Create tasks
    print("Creating tasks...")
    task1 = Task.objects.create(
        title='Собрать 100 деталей типа А',
        description='Использовать новый чертеж. Сдать до конца смены.',
        assignee=user2,
        creator=user1,
        due_date=timezone.now() + timedelta(days=1),
        status='PENDING'
    )
    Comment.objects.create(
        task=task1,
        author=user1,
        text='Обратите внимание на допуски.'
    )

    task2 = Task.objects.create(
        title='Замена фильтров в вытяжке',
        description='Регулярное ТО',
        assignee=user3,
        creator=user1,
        due_date=timezone.now() - timedelta(days=1),
        status='COMPLETED'
    )

    task3 = Task.objects.create(
        title='Упаковать партию 45B',
        description='Готовим к отправке',
        assignee=user2,
        creator=user1,
        due_date=timezone.now() + timedelta(days=2),
        status='COMPLETED'
    )

    # Create incidents
    print("Creating incidents...")
    Incident.objects.create(
        type='BROKEN_EQUIPMENT',
        description='Заедает подачу материала',
        reporter=user2,
        equipment=eq3,
        status='OPEN',
        urgency='HIGH'
    )

    Incident.objects.create(
        type='ACCIDENT',
        description='Разлив масла в проходе 3, есть риск падения!',
        reporter=user3,
        status='OPEN',
        urgency='CRITICAL'
    )

    # Create messages
    print("Creating messages...")
    Message.objects.create(
        sender=user1,
        receiver=user2,
        text='Зайди ко мне в кабинет после смены.'
    )

    Message.objects.create(
        sender=user2,
        receiver=user1,
        text='Понял, буду.'
    )

    print("Initial data created successfully!")


if __name__ == '__main__':
    create_initial_data()
