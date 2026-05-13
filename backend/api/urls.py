from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, UserViewSet, EquipmentViewSet,
    TaskViewSet, CommentViewSet, IncidentViewSet, MessageViewSet,
    login_view, logout_view_raw, current_user_view, csrf_token_view
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'users', UserViewSet)
router.register(r'equipment', EquipmentViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('auth/csrf/', csrf_token_view, name='csrf_token'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view_raw, name='logout'),
    path('auth/me/', current_user_view, name='current_user'),
    path('', include(router.urls)),
]
