# Generated by Django 5.2.4 on 2025-07-13 08:45

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0004_spots_spotimages'),
    ]

    operations = [
        migrations.AlterField(
            model_name='spotimages',
            name='spot',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='spot_images', to='adminpanel.spots'),
        ),
    ]
