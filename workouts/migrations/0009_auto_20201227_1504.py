# Generated by Django 3.1.4 on 2020-12-27 15:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0008_auto_20201227_1502'),
    ]

    operations = [
        migrations.AlterField(
            model_name='log',
            name='ft_result',
            field=models.DurationField(null=True),
        ),
    ]