from django.contrib import admin
from .models import (
    Department, UserProfile, Equipment, Task, Comment,
    Incident, Message
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'department']
    list_filter = ['role', 'department']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'expiration_date', 'department']
    list_filter = ['status', 'department']
    search_fields = ['name']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'assignee', 'due_date']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['text', 'author__username']


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ['type', 'status', 'urgency', 'reporter', 'created_at']
    list_filter = ['type', 'status', 'urgency', 'created_at']
    search_fields = ['description', 'reporter__username']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'read', 'created_at']
    list_filter = ['read', 'created_at']
    search_fields = ['text', 'sender__username', 'receiver__username']
