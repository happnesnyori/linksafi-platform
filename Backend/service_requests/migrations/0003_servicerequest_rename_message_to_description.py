from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        (
            "service_requests",
            "0002_servicerequest_location_servicerequest_property_type_and_more",
        ),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                'ALTER TABLE "service_requests_servicerequest" '
                'RENAME COLUMN "message" TO "description";',
            ],
            reverse_sql=[
                'ALTER TABLE "service_requests_servicerequest" '
                'RENAME COLUMN "description" TO "message";',
            ],
        ),
    ]