# Generated by Django 3.1.4 on 2020-12-26 14:57

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0002_log_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='log',
            name='wod_date',
            field=models.DateField(default=datetime.date.today),
        ),
    ]