# Generated by Django 3.1.4 on 2020-12-27 21:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0008_auto_20201227_2111'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='weight',
            field=models.DecimalField(decimal_places=0, max_digits=3),
        ),
    ]