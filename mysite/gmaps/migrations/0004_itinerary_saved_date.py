# Generated by Django 4.2.3 on 2023-07-16 18:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gmaps', '0003_remove_itinerary_selected_attractions_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='itinerary',
            name='saved_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
