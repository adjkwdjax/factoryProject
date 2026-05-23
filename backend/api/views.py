from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import (
    Department, UserProfile, Equipment, Task, Comment,
    Incident, Message
)
from .serializers import (
    DepartmentSerializer, UserSerializer, UserProfileSerializer,
    EquipmentSerializer, TaskSerializer, CommentSerializer,
    IncidentSerializer, MessageSerializer
)


@api_view(['GET'])
def csrf_token_view(request):
    """Получить CSRF токен"""
    token = get_token(request)
    return Response({'csrf_token': token})


@csrf_exempt
@api_view(['POST'])
def login_view(request):
    """API endpoint для входа пользователя"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Требуется username и password'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)
    if user is not None:
        # Создать сессию пользователя
        login(request, user)
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'token': None
        })
    else:
        return Response(
            {'error': 'Неверный username или password'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
def current_user_view(request):
    """API endpoint для получения текущего пользователя"""
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    else:
        return Response(
            {'error': 'Не аутентифицирован'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@csrf_exempt
@api_view(['POST'])
def logout_view(request):
    """API endpoint для выхода пользователя"""
    logout(request)
    return Response({'message': 'Успешный выход'})


@csrf_exempt
def logout_view_raw(request):
    """API endpoint для выхода пользователя (сырая функция)"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Метод должен быть POST'}, status=405)
    
    logout(request)
    return JsonResponse({'message': 'Успешный выход'})


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    pagination_class = None


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = None

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def _extract_profile_data(self, request):
        profile_data = request.data.get('profile', {}) or {}
        role = profile_data.get('role') or request.data.get('role') or 'WORKER'
        department_id = profile_data.get('department_id') or request.data.get('department_id') or request.data.get('departmentId')
        return role, department_id

    def _sync_profile(self, user, request):
        role, department_id = self._extract_profile_data(request)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.department_id = department_id or None
        profile.save()

    def create(self, request, *args, **kwargs):
        """Override create to handle nested profile creation"""
        user_data = {
            'username': request.data.get('username'),
            'first_name': request.data.get('first_name', ''),
            'last_name': request.data.get('last_name', ''),
            'email': request.data.get('email', ''),
        }

        user = User.objects.create_user(**user_data)
        self._sync_profile(user, request)

        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        instance.username = request.data.get('username', instance.username)
        instance.first_name = request.data.get('first_name', instance.first_name)
        instance.last_name = request.data.get('last_name', instance.last_name)
        instance.email = request.data.get('email', instance.email)
        instance.save()

        self._sync_profile(instance, request)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    parser_classes = [JSONParser, FormParser, MultiPartParser]


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        task = self.get_object()
        comments = task.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_queryset(self):
        queryset = Comment.objects.all()
        task_id = self.request.query_params.get('task_id', None)
        if task_id is not None:
            queryset = queryset.filter(task_id=task_id)
        return queryset


class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        incident.status = 'RESOLVED'
        incident.save()
        # If this incident references equipment, and there are no other open incidents for it,
        # mark equipment operational again.
        if incident.equipment:
            open_count = Incident.objects.filter(equipment=incident.equipment, status='OPEN').exclude(id=incident.id).count()
            if open_count == 0:
                incident.equipment.status = 'OPERATIONAL'
                incident.equipment.save()
        serializer = self.get_serializer(incident)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # When creating an incident attached to equipment, set that equipment status to BROKEN
        incident = serializer.save()
        if incident.equipment and incident.status != 'RESOLVED':
            incident.equipment.status = 'BROKEN'
            incident.equipment.save()


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    @action(detail=False, methods=['get'])
    def received(self, request):
        """Get messages received by the current user"""
        messages = Message.objects.filter(receiver=request.user).order_by('-created_at')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def sent(self, request):
        """Get messages sent by the current user"""
        messages = Message.objects.filter(sender=request.user).order_by('-created_at')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        """Mark messages as read"""
        message_ids = request.data.get('message_ids', [])
        Message.objects.filter(id__in=message_ids).update(read=True)
        return Response({'status': 'messages marked as read'})

