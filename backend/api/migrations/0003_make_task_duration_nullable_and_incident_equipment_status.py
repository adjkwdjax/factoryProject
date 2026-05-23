from django.db import migrations, models


def set_broken_equipment(apps, schema_editor):
    Incident = apps.get_model('api', 'Incident')
    Equipment = apps.get_model('api', 'Equipment')
    # For any equipment that has at least one OPEN incident, mark as BROKEN
    open_incidents = Incident.objects.filter(status='OPEN').exclude(equipment__isnull=True).values_list('equipment_id', flat=True).distinct()
    Equipment.objects.filter(id__in=list(open_incidents)).update(status='BROKEN')


def noop(apps, schema_editor):
    return


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_equipment_photo_task_duration_hours_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='duration_hours',
            field=models.PositiveIntegerField(null=True, blank=True, default=None),
        ),
        migrations.RunPython(set_broken_equipment, noop),
    ]
