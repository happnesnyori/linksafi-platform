import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0007_galleryimage_service'),
    ]

    operations = [
        migrations.AddField(
            model_name='galleryimage',
            name='parent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sub_images', to='companies.galleryimage'),
        ),
    ]
