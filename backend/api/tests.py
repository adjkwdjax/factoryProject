from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Department, Equipment, UserProfile


class DepartmentEndpointsTest(APITestCase):
    def test_partial_update_department(self):
        department = Department.objects.create(name='Old name')

        response = self.client.patch(
            reverse('department-detail', args=[department.id]),
            {'name': 'New name'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        department.refresh_from_db()
        self.assertEqual(department.name, 'New name')
        self.assertEqual(response.data['name'], 'New name')

    def test_delete_department_clears_related_links(self):
        department = Department.objects.create(name='Department')
        user = User.objects.create_user(username='worker')
        profile = UserProfile.objects.create(user=user, department=department)
        equipment = Equipment.objects.create(
            name='Machine',
            expiration_date='2030-01-01',
            department=department,
        )

        response = self.client.delete(
            reverse('department-detail', args=[department.id]),
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Department.objects.filter(id=department.id).exists())
        profile.refresh_from_db()
        equipment.refresh_from_db()
        self.assertIsNone(profile.department)
        self.assertIsNone(equipment.department)
