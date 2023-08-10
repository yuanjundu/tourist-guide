# Generated by Django 4.2.3 on 2023-07-17 14:00

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('gmaps', '0004_itinerary_saved_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='CommunityItinerary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shared_on', models.DateTimeField(auto_now_add=True)),
                ('itinerary', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='gmaps.itinerary')),
            ],
        ),
        migrations.CreateModel(
            name='UserItinerary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('joined_on', models.DateTimeField(auto_now_add=True)),
                ('community_itinerary', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gmaps.communityitinerary')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
