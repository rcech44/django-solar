# Generated by Django 4.1.2 on 2023-09-12 18:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='birth_date_2',
            field=models.DateField(blank=True, null=True),
        ),
    ]