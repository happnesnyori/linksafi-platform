from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('service_requests', '0004_servicerequest_guest_email_servicerequest_guest_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='servicerequest',
            name='preferred_contact',
            field=models.CharField(
                choices=[('email', 'Email'), ('phone', 'Phone')],
                default='email',
                max_length=10,
            ),
        ),
    ]
