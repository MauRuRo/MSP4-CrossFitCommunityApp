# Generated by Django 3.1.4 on 2020-12-26 11:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django_countries.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(default='', max_length=40)),
                ('email', models.EmailField(max_length=254)),
                ('town_or_city', models.CharField(default='', max_length=40)),
                ('country', django_countries.fields.CountryField(max_length=40)),
                ('gender', models.CharField(choices=[('', 'Please select gender... *'), ('M', 'Male'), ('F', 'Female')], default='Please select gender... *', max_length=1)),
                ('weight', models.DecimalField(decimal_places=1, max_digits=4)),
                ('birthdate', models.DateField(default='2000-01-01')),
                ('image', models.ImageField(blank=True, null=True, upload_to='')),
                ('stripe_pid', models.CharField(default='', max_length=254)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
