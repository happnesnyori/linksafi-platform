from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()

MOCK_COMPANIES = [
    {
        "name": "CampusShine Commercial Hygiene",
        "description": "CampusShine is the trusted facility partner for higher education institutions in Tanzania. We provide industrial-grade turnover sanitization, lecture theatre hygiene, high-traffic floor buffing, and laboratory cleaning adhering to strict health & safety standards.",
        "location": "Dar es Salaam (UDSM, Ardhi, IFM zones)",
        "services": ["cleaning"],
        "verification_status": "verified",
        "status": "approved",
        "is_active": True,
        "email": "dispatch@campusshine.co.tz",
        "phone": "+255 712 345 678",
        "specialties": [
            "Student Hall & Dorm Turnover Cleaning",
            "Lecture Theatre & Laboratory Sanitization",
            "Commercial Floor Buffing & Tile Scrubbing",
            "High-Reach Window & Facade Washing"
        ],
        "owner_email": "campusshine@admin.local",
        "owner_password": "CampusShine2024!",
    },
    {
        "name": "Majestic Grand Decor & Staging",
        "description": "Transforming empty halls into unforgettable spaces. Majestic Grand handles graduation ceremony stages, academic symposiums, university gala dinners, corporate receptions, as well as residential lobby makeovers and festive tenant events.",
        "location": "Dar es Salaam & Dodoma",
        "services": ["decoration"],
        "verification_status": "verified",
        "status": "approved",
        "is_active": True,
        "email": "events@majesticgrand.co.tz",
        "phone": "+255 754 987 654",
        "specialties": [
            "Graduation Ceremony & Stage Rigging",
            "Symposium & Conference Ambience",
            "Apartment Lobby & Entrance Styling",
            "Floral Installations & Fabric Drapery"
        ],
        "owner_email": "majesticgrand@admin.local",
        "owner_password": "MajesticGrand2024!",
    },
    {
        "name": "SafiHostel & Apartment Care",
        "description": "Dedicated to private student apartments, hostels, and residential apartment blocks. We make tenancy changes effortless for property managers with rapid turnover sanitation, deep carpet extraction, kitchen degreasing, and balcony pressure washing.",
        "location": "Dar es Salaam (Kinondoni, Sinza, Mwenge, Masaki)",
        "services": ["cleaning"],
        "verification_status": "verified",
        "status": "approved",
        "is_active": True,
        "email": "support@safihostel.com",
        "phone": "+255 789 112 233",
        "specialties": [
            "Apartment Move-In / Move-Out Deep Cleans",
            "Staircase, Corridor & Common Area Care",
            "Deep Mattress & Upholstery Steam Extraction",
            "Trash Chute & Waste Compound Sanitization"
        ],
        "owner_email": "safihostel@admin.local",
        "owner_password": "SafiHostel2024!",
    },
    {
        "name": "OmniCare Facilities & Decor Solutions",
        "description": "Why hire two vendors when OmniCare delivers both? We provide daily or contractual maintenance cleaning alongside dynamic event and seasonal decor for university colleges, student centers, executive apartments, and gated estates.",
        "location": "Arusha, Dodoma & Dar es Salaam",
        "services": ["both", "cleaning", "decoration"],
        "verification_status": "verified",
        "status": "approved",
        "is_active": True,
        "email": "info@omnicaretz.com",
        "phone": "+255 767 445 566",
        "specialties": [
            "End-to-End Facility Management",
            "Semester-Start Deep Clean + Orientation Decor",
            "Annual Complex Maintenance & Aesthetic Care",
            "Post-Event Cleanup & Eco Waste Disposal"
        ],
        "owner_email": "omnicare@admin.local",
        "owner_password": "OmniCare2024!",
    },
    {
        "name": "EcoPure Green Cleaners",
        "description": "Zero toxic fumes, zero harsh chemical residues. EcoPure delivers safe, gentle, yet powerful antimicrobial cleaning ideal for high-density student dormitories, student health centers, and family apartment residences.",
        "location": "Dar es Salaam & Bagamoyo",
        "services": ["cleaning"],
        "verification_status": "verified",
        "status": "approved",
        "is_active": True,
        "email": "hello@ecopureclean.tz",
        "phone": "+255 713 889 900",
        "specialties": [
            "Allergen-Safe Student Dorm Cleaning",
            "Green Steam Floor & Tile Scrubbing",
            "Biodegradable Kitchen & Canteen Sanitizing",
            "Greywater & Eco-Waste Management"
        ],
        "owner_email": "ecopure@admin.local",
        "owner_password": "EcoPure2024!",
    },
    {
        "name": "Ambiance Interior Staging & Styling",
        "description": "Elevating the aesthetic appeal of institutional and residential living spaces. Ambiance specializes in contemporary furniture arrangement, lighting accents, decorative wall treatments, and welcoming reception styling.",
        "location": "Arusha & Moshi",
        "services": ["decoration"],
        "verification_status": "verified",
        "status": "approved",
        "is_active": True,
        "email": "design@ambiancestudio.co.tz",
        "phone": "+255 745 223 344",
        "specialties": [
            "Student Lounge & Study Common Area Styling",
            "Apartment Show-Unit & Lobby Staging",
            "Custom Lighting, Drapes & Acoustic Panels",
            "Indoor Greenery & Biophilic Styling"
        ],
        "owner_email": "ambiance@admin.local",
        "owner_password": "Ambiance2024!",
    },
]


class Command(BaseCommand):
    help = "Seed mock companies into the database as admin-created companies"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing seeded companies before creating new ones",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write("Clearing existing seeded companies...")
            # Delete companies owned by seeded users
            seeded_emails = [c["owner_email"] for c in MOCK_COMPANIES]
            Company.objects.filter(owner__email__in=seeded_emails).delete()
            User.objects.filter(email__in=seeded_emails).delete()
            self.stdout.write(self.style.SUCCESS("Cleared existing seeded companies"))

        created_count = 0
        for company_data in MOCK_COMPANIES:
            owner_email = company_data.pop("owner_email")
            owner_password = company_data.pop("owner_password")

            # Create or get owner user
            user, user_created = User.objects.get_or_create(
                email=owner_email,
                defaults={
                    "username": owner_email.split("@")[0],
                    "name": company_data["name"],
                    "role": User.ROLE_COMPANY,
                    "is_active": True,
                },
            )
            if user_created:
                user.set_password(owner_password)
                user.save()
                self.stdout.write(f"Created owner user: {owner_email}")
            else:
                self.stdout.write(f"Owner user exists: {owner_email}")

            # Check if company already exists for this owner
            company, company_created = Company.objects.get_or_create(
                owner=user,
                defaults=company_data,
            )
            if company_created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created company: {company.name}"))
            else:
                # Update existing company
                for key, value in company_data.items():
                    setattr(company, key, value)
                company.save()
                self.stdout.write(f"Updated company: {company.name}")

        self.stdout.write(self.style.SUCCESS(f"Done! Created {created_count} new companies."))