# Generated by Django 4.2.2 on 2023-06-30 21:15

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gmaps', '0003_alter_museum_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='Attractions',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('housenumber', models.CharField(max_length=255)),
                ('street', models.CharField(max_length=255)),
                ('postcode', models.CharField(max_length=255)),
                ('name', models.CharField(max_length=255)),
                ('opening_hours', models.CharField(max_length=255)),
                ('phone', models.CharField(blank=True, max_length=255, null=True)),
                ('website', models.CharField(blank=True, max_length=255, null=True)),
                ('geom', django.contrib.gis.db.models.fields.GeometryField(srid=4326)),
                ('image', models.ImageField(blank=True, null=True, upload_to='place_images/')),
            ],
            options={
                'db_table': 'attractions',
            },
        ),
    ]