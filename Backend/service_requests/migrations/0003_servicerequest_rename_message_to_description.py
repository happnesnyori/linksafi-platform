from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        (
            "service_requests",
            "0002_servicerequest_location_servicerequest_property_type_and_more",
        ),
    ]

    # The initial migration already creates the field as description.
    operations = []