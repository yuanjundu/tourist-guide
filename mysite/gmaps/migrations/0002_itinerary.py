# Generated by Django 4.2.3 on 2023-07-16 16:08

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('gmaps', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Itinerary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('selected_attractions', models.ManyToManyField(to='gmaps.attractions')),
                ('selected_restaurant', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='gmaps.restaurant')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'itinerary',
            },
        ),
    ]