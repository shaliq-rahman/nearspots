# Generated by Django 5.2.4 on 2025-07-16 10:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0016_alter_spots_rating'),
    ]

    operations = [
        migrations.AlterField(
            model_name='spots',
            name='rating',
            field=models.DecimalField(decimal_places=1, default=0, max_digits=3),
        ),
    ]
