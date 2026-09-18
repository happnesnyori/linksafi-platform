from django.core.management.base import BaseCommand
from django.utils.text import slugify
from companies.models import Service, Company, CompanyService

SERVICES_DATA = [
    # Cleaning
    {
        'name': 'General Cleaning',
        'category': 'cleaning',
        'description': 'Daily and routine cleaning for different commercial, academic, and residential spaces.',
        'ordering': 1,
    },
    {
        'name': 'Deep Cleaning',
        'category': 'cleaning',
        'description': 'Comprehensive intensive sanitization, floor scrubbing, and detailed disinfection.',
        'ordering': 2,
    },
    {
        'name': 'Office Cleaning',
        'category': 'cleaning',
        'description': 'Professional workplace cleaning, desks, conference rooms, and corporate hygiene.',
        'ordering': 3,
    },
    {
        'name': 'University Cleaning',
        'category': 'cleaning',
        'description': 'Cleaning solutions and high-volume sanitation for university lecture halls and campus facilities.',
        'ordering': 4,
    },
    {
        'name': 'Apartment Cleaning',
        'category': 'cleaning',
        'description': 'Cleaning services for residential buildings, turnover cleans, and private hostels.',
        'ordering': 5,
    },
    {
        'name': 'Post-Construction Cleaning',
        'category': 'cleaning',
        'description': 'Debris removal, window scraping, paint residue scrub, and move-in ready handover.',
        'ordering': 6,
    },
    {
        'name': 'Event Cleaning',
        'category': 'cleaning',
        'description': 'Pre-event preparation and post-event turnaround cleaning and waste collection.',
        'ordering': 7,
    },
    # Decoration
    {
        'name': 'Event Decoration',
        'category': 'decoration',
        'description': 'End-to-end venue styling, theme setup, lighting, and visual stage transformation.',
        'ordering': 8,
    },
    {
        'name': 'Wedding Decoration',
        'category': 'decoration',
        'description': 'Elegant bridal staging, floral archways, table settings, and ceremonial decor.',
        'ordering': 9,
    },
    {
        'name': 'Conference Decoration',
        'category': 'decoration',
        'description': 'Corporate branding backdrops, executive podium styling, and convention hall layout.',
        'ordering': 10,
    },
    {
        'name': 'Graduation Decoration',
        'category': 'decoration',
        'description': 'Academic ceremony staging, podium styling, banners, and student celebration setups.',
        'ordering': 11,
    },
    {
        'name': 'Indoor Decoration',
        'category': 'decoration',
        'description': 'Interior living aesthetic styling, accent walls, indoor greenery, and ambient lighting.',
        'ordering': 12,
    },
]

class Command(BaseCommand):
    help = 'Seed standard LinkSafi cleaning and decoration services'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0
        for item in SERVICES_DATA:
            slug = slugify(item['name'])
            svc, created = Service.objects.update_or_create(
                name=item['name'],
                defaults={
                    'slug': slug,
                    'category': item['category'],
                    'description': item['description'],
                    'ordering': item['ordering'],
                    'is_active': True,
                },
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(f'Services seeded: {created_count} created, {updated_count} updated.'))

        # Assign relevant services to existing approved companies if they have none yet
        for company in Company.objects.all():
            if company.service_items.count() == 0:
                services_json = company.services or []
                is_both = 'both' in services_json or ('cleaning' in services_json and 'decoration' in services_json)
                is_clean = 'cleaning' in services_json or is_both
                is_decor = 'decoration' in services_json or is_both

                to_assign = []
                if is_clean:
                    to_assign.extend(Service.objects.filter(category='cleaning')[:3])
                if is_decor:
                    to_assign.extend(Service.objects.filter(category='decoration')[:3])

                for svc in to_assign:
                    CompanyService.objects.get_or_create(company=company, service=svc)
                self.stdout.write(f'Assigned {len(to_assign)} services to company: {company.name}')
