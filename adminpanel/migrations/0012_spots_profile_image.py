# Generated by Django 5.2.4 on 2025-07-14 14:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0011_spots_is_approved'),
    ]

    operations = [
        migrations.AddField(
            model_name='spots',
            name='profile_image',
            field=models.ImageField(blank=True, null=True, upload_to='profile_image/'),
        ),
    ]
