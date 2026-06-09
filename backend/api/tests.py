from datetime import timezone as datetime_timezone

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Department, Equipment, Incident, Task, UserProfile


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


class TaskEndpointsTest(APITestCase):
    def setUp(self):
        self.department = Department.objects.create(name='Assembly')
        self.creator = User.objects.create_user(username='creator', password='password123')
        self.assignee = User.objects.create_user(username='worker', password='password123')
        UserProfile.objects.create(user=self.creator, role='ADMIN', department=self.department)
        UserProfile.objects.create(user=self.assignee, role='WORKER', department=self.department)

    def test_create_task_accepts_due_date_aliases_and_keeps_duration_empty(self):
        due_date = '2030-01-01T12:00:00Z'

        response = self.client.post(
            reverse('task-list'),
            {
                'title': 'Report task',
                'description': 'Created by API test',
                'creator_id': self.creator.id,
                'assignee_id': self.assignee.id,
                'dueDate': due_date,
                'due_date': due_date,
                'status': 'PENDING',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task = Task.objects.get(id=response.data['id'])
        self.assertEqual(task.title, 'Report task')
        self.assertEqual(task.assignee, self.assignee)
        self.assertIsNone(task.duration_hours)
        self.assertEqual(task.due_date, timezone.datetime(2030, 1, 1, 12, tzinfo=datetime_timezone.utc))

    def test_update_task_changes_assignee_deadline_and_marks_completed_at(self):
        task = Task.objects.create(
            title='Old title',
            description='Old description',
            creator=self.creator,
            assignee=self.creator,
            due_date=timezone.now() + timezone.timedelta(days=1),
            status='PENDING',
        )
        new_due_date = '2030-02-02T08:30:00Z'

        response = self.client.patch(
            reverse('task-detail', args=[task.id]),
            {
                'title': 'Updated title',
                'description': 'Updated description',
                'assignee_id': self.assignee.id,
                'dueDate': new_due_date,
                'due_date': new_due_date,
                'status': 'COMPLETED',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.title, 'Updated title')
        self.assertEqual(task.description, 'Updated description')
        self.assertEqual(task.assignee, self.assignee)
        self.assertEqual(task.status, 'COMPLETED')
        self.assertIsNotNone(task.completed_at)
        self.assertEqual(task.due_date, timezone.datetime(2030, 2, 2, 8, 30, tzinfo=datetime_timezone.utc))


class SecurityEndpointsTest(APITestCase):
    def test_authenticated_mutating_request_without_csrf_token_is_rejected(self):
        user = User.objects.create_user(username='csrf_user', password='password123')
        csrf_client = APIClient(enforce_csrf_checks=True)
        self.assertTrue(csrf_client.login(username='csrf_user', password='password123'))

        response = csrf_client.post(
            reverse('task-list'),
            {
                'title': 'Should be rejected',
                'description': 'No CSRF token',
                'creator_id': user.id,
                'assignee_id': user.id,
                'dueDate': '2030-01-01T12:00:00Z',
                'due_date': '2030-01-01T12:00:00Z',
                'status': 'PENDING',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Task.objects.filter(title='Should be rejected').exists())


class IncidentEndpointsTest(APITestCase):
    def setUp(self):
        self.department = Department.objects.create(name='Maintenance')
        self.reporter = User.objects.create_user(username='reporter', password='password123')
        UserProfile.objects.create(user=self.reporter, role='WORKER', department=self.department)
        self.equipment = Equipment.objects.create(
            name='Press',
            status='OPERATIONAL',
            expiration_date='2030-01-01',
            department=self.department,
        )

    def test_incident_marks_equipment_broken_and_resolve_restores_status(self):
        create_response = self.client.post(
            reverse('incident-list'),
            {
                'type': 'BROKEN_EQUIPMENT',
                'description': 'Press stopped',
                'reporter_id': self.reporter.id,
                'equipment_id': self.equipment.id,
                'urgency': 'HIGH',
                'status': 'OPEN',
            },
            format='json',
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.equipment.refresh_from_db()
        self.assertEqual(self.equipment.status, 'BROKEN')

        incident = Incident.objects.get(id=create_response.data['id'])
        resolve_response = self.client.post(reverse('incident-resolve', args=[incident.id]))

        self.assertEqual(resolve_response.status_code, status.HTTP_200_OK)
        incident.refresh_from_db()
        self.equipment.refresh_from_db()
        self.assertEqual(incident.status, 'RESOLVED')
        self.assertEqual(self.equipment.status, 'OPERATIONAL')
