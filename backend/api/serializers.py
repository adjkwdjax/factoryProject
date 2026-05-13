from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Department, UserProfile, Equipment, Task, Comment,
    Incident, Message
)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False
    )

    class Meta:
        model = UserProfile
        fields = ['id', 'role', 'department', 'department_id']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    departmentId = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_role(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.role
        return 'WORKER'

    def get_departmentId(self, obj):
        if hasattr(obj, 'profile') and obj.profile.department:
            return obj.profile.department.id
        return None

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'name', 'role', 'departmentId', 'profile']
        read_only_fields = ['id']


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='author',
        write_only=True
    )
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'author_id', 'text', 'created_at', 'timestamp']
        read_only_fields = ['id', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    creator = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assignee',
        write_only=True,
        required=False,
        allow_null=True
    )
    creator_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='creator',
        write_only=True
    )
    comments = CommentSerializer(many=True, read_only=True)
    assigneeId = serializers.SerializerMethodField()
    creatorId = serializers.SerializerMethodField()
    dueDate = serializers.DateTimeField(source='due_date')

    def get_assigneeId(self, obj):
        return obj.assignee.id if obj.assignee else None

    def get_creatorId(self, obj):
        return obj.creator.id

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assignee', 'creator',
            'assignee_id', 'creator_id', 'assigneeId', 'creatorId',
            'due_date', 'dueDate', 'status', 'comments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EquipmentSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False
    )
    expirationDate = serializers.DateField(source='expiration_date')
    departmentId = serializers.SerializerMethodField()

    def get_departmentId(self, obj):
        return obj.department.id if obj.department else None

    class Meta:
        model = Equipment
        fields = [
            'id', 'name', 'expirationDate', 'status',
            'department', 'department_id', 'departmentId', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IncidentSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    equipment = EquipmentSerializer(read_only=True)
    reporter_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='reporter',
        write_only=True
    )
    equipment_id = serializers.PrimaryKeyRelatedField(
        queryset=Equipment.objects.all(),
        source='equipment',
        write_only=True,
        required=False,
        allow_null=True
    )
    reporterId = serializers.SerializerMethodField()
    equipmentId = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    def get_reporterId(self, obj):
        return obj.reporter.id

    def get_equipmentId(self, obj):
        return obj.equipment.id if obj.equipment else None

    class Meta:
        model = Incident
        fields = [
            'id', 'type', 'description', 'reporter', 'reporter_id', 'reporterId',
            'equipment', 'equipment_id', 'equipmentId', 'status', 'urgency',
            'timestamp', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    sender_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='sender',
        write_only=True
    )
    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='receiver',
        write_only=True
    )
    senderId = serializers.SerializerMethodField()
    receiverId = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    def get_senderId(self, obj):
        return obj.sender.id

    def get_receiverId(self, obj):
        return obj.receiver.id

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'receiver', 'sender_id', 'receiver_id',
            'senderId', 'receiverId', 'text', 'timestamp', 'read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
