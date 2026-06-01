from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile, Department

class Command(BaseCommand):
    help = 'Create a shop manager (начальник цеха)'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Username for the shop manager')
        parser.add_argument('--password', type=str, required=True, help='Password for the shop manager')
        parser.add_argument('--email', type=str, default='', help='Email address (optional)')
        parser.add_argument('--first_name', type=str, default='Начальник', help='First name (optional)')
        parser.add_argument('--last_name', type=str, default='Цеха', help='Last name (optional)')

    def handle(self, *args, **kwargs):
        username = kwargs['username']
        password = kwargs['password']
        email = kwargs['email']
        first_name = kwargs['first_name']
        last_name = kwargs['last_name']

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'User with username "{username}" already exists.'))
            return

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_superuser=True
        )

        UserProfile.objects.create(
            user=user,
            role='ADMIN'
        )

        self.stdout.write(self.style.SUCCESS(f'Successfully created shop manager "{username}" with role ADMIN'))
