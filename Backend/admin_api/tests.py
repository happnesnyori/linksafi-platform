import base64

from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from companies.models import Company
from reviews.models import Review
from service_requests.models import ServiceRequest

User = get_user_model()


class AdminApiTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="AdminPass1!",
            role=User.ROLE_ORGANIZATION,
            is_staff=True,
        )
        self.organization = User.objects.create_user(
            username="organization",
            email="organization@example.com",
            password="OrganizationPass1!",
            role=User.ROLE_ORGANIZATION,
        )
        self.company_owner = User.objects.create_user(
            username="company",
            email="company@example.com",
            password="CompanyPass1!",
            role=User.ROLE_COMPANY,
        )
        self.registration_owner = User.objects.create_user(
            username="registration-company",
            email="registration-company@example.com",
            password="CompanyPass1!",
            role=User.ROLE_COMPANY,
        )
        self.pending_company = Company.objects.create(
            owner=self.company_owner,
            name="Pending Cleaning",
            email="pending@example.com",
            location="Dar es Salaam",
            services=[Company.SERVICE_CLEANING],
            status=Company.STATUS_PENDING,
            is_active=False,
        )
        self.public_company = Company.objects.create(
            owner=User.objects.create_user(
                username="public-company",
                email="public-company@example.com",
                password="CompanyPass1!",
                role=User.ROLE_COMPANY,
            ),
            name="Public Decoration",
            email="public@example.com",
            location="Dar es Salaam",
            services=[Company.SERVICE_DECORATION],
            status=Company.STATUS_APPROVED,
            is_active=True,
        )
        self.request = ServiceRequest.objects.create(
            organization=self.organization,
            company=self.pending_company,
            service=Company.SERVICE_CLEANING,
            property_type=ServiceRequest.PROPERTY_UNIVERSITY,
            location="Dar es Salaam",
            description="Clean the lecture halls",
            status=ServiceRequest.STATUS_PENDING,
        )
        self.review = Review.objects.create(
            company=self.public_company,
            customer=self.organization,
            rating=5,
            comment="Excellent service",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_dashboard_stats_count_platform_records(self):
        response = self.client.get("/api/admin/dashboard")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_companies"], 2)
        self.assertEqual(response.data["pending_companies"], 1)
        self.assertEqual(response.data["total_service_requests"], 1)
        self.assertEqual(response.data["pending_requests"], 1)

    def test_admin_company_creation_is_approved_and_active(self):
        response = self.client.post(
            "/api/admin/companies",
            {
                "name": "Admin Created",
                "email": "created@example.com",
                "location": "Dar es Salaam",
                "services": [Company.SERVICE_BOTH],
                "owner_email": "new-owner@example.com",
                "password": "NewOwnerPass1!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        company = Company.objects.get(name="Admin Created")
        self.assertEqual(company.status, Company.STATUS_APPROVED)
        self.assertTrue(company.is_active)
        self.assertEqual(company.owner.role, User.ROLE_COMPANY)

    def test_company_approval_makes_it_public(self):
        response = self.client.post(
            f"/api/admin/companies/{self.pending_company.id}/approve"
        )

        self.assertEqual(response.status_code, 200)
        public_response = self.client.get("/api/companies")
        self.assertEqual(public_response.status_code, 200)
        self.assertEqual(public_response.json()["count"], 2)
        self.assertTrue(
            any(item["name"] == self.pending_company.name for item in public_response.json()["results"])
        )

    def test_public_listing_excludes_pending_and_inactive_companies(self):
        response = self.client.get("/api/companies")

        self.assertEqual(response.status_code, 200)
        names = {item["name"] for item in response.json()["results"]}
        self.assertIn(self.public_company.name, names)
        self.assertNotIn(self.pending_company.name, names)

    def test_admin_can_view_customer_requests(self):
        response = self.client.get(f"/api/admin/users/{self.organization.id}/requests")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["service_requests"]), 1)
        self.assertEqual(response.data["service_requests"][0]["id"], self.request.id)

    def test_admin_can_hide_and_restore_review(self):
        hide_response = self.client.post(f"/api/admin/reviews/{self.review.id}/hide")
        restore_response = self.client.post(f"/api/admin/reviews/{self.review.id}/restore")

        self.assertEqual(hide_response.status_code, 200)
        self.assertEqual(hide_response.data["status"], Review.STATUS_HIDDEN)
        self.assertEqual(restore_response.status_code, 200)
        self.assertEqual(restore_response.data["status"], Review.STATUS_VISIBLE)

    def test_admin_company_creation_accepts_multipart_company_fields(self):
        response = self.client.post(
            "/api/admin/companies",
            {
                "name": "Multipart Company",
                "email": "multipart@example.com",
                "location": "Dar es Salaam",
                "services": '["cleaning", "decoration"]',
                "specialties": '["deep cleaning"]',
                "verification_status": "verified",
                "owner_email": "multipart-owner@example.com",
                "password": "NewOwnerPass1!",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 201)
        company = Company.objects.get(name="Multipart Company")
        self.assertEqual(company.services, ["both", "cleaning", "decoration"])
        self.assertEqual(company.specialties, ["deep cleaning"])

    def test_admin_company_creation_accepts_logo_upload(self):
        logo = SimpleUploadedFile(
            "logo.png",
            b"not-a-real-png",
            content_type="image/png",
        )
        response = self.client.post(
            "/api/admin/companies",
            {
                "name": "Logo Company",
                "email": "logo@example.com",
                "location": "Dar es Salaam",
                "services": '["cleaning"]',
                "owner_email": "logo-owner@example.com",
                "password": "NewOwnerPass1!",
                "logo": logo,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 201, response.data)
        self.assertTrue(Company.objects.get(name="Logo Company").logo)

    def test_self_registered_company_starts_pending_and_inactive(self):
        client = APIClient()
        client.force_authenticate(user=self.registration_owner)

        response = client.post(
            "/api/companies",
            {
                "name": "Self Registered",
                "email": "self@example.com",
                "location": "Dar es Salaam",
                "services": [Company.SERVICE_CLEANING],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        company = Company.objects.get(name="Self Registered")
        self.assertEqual(company.status, Company.STATUS_PENDING)
        self.assertFalse(company.is_active)

    def test_suspended_company_is_removed_and_reactivated(self):
        suspend_response = self.client.post(
            f"/api/admin/companies/{self.public_company.id}/suspend"
        )
        suspended_public = self.client.get("/api/companies")
        reactivate_response = self.client.post(
            f"/api/admin/companies/{self.public_company.id}/reactivate"
        )
        reactivated_public = self.client.get("/api/companies")

        self.assertEqual(suspend_response.status_code, 200)
        self.assertNotIn(
            self.public_company.name,
            {item["name"] for item in suspended_public.json()["results"]},
        )
        self.assertEqual(reactivate_response.status_code, 200)
        self.assertIn(
            self.public_company.name,
            {item["name"] for item in reactivated_public.json()["results"]},
        )

    def test_non_admin_cannot_access_admin_api(self):
        client = APIClient()
        client.force_authenticate(user=self.organization)

        response = client.get("/api/admin/dashboard")

        self.assertEqual(response.status_code, 403)

    def test_superuser_can_remove_invited_staff_admin(self):
        superuser = User.objects.create_user(
            username="superadmin",
            email="superadmin@example.com",
            password="SuperPass1!",
            role=User.ROLE_ORGANIZATION,
            is_staff=True,
            is_superuser=True,
        )
        client = APIClient()
        client.force_authenticate(user=superuser)

        response = client.delete(f"/api/admin/admins/{self.admin.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(User.objects.filter(id=self.admin.id).exists())

    def test_staff_admin_cannot_remove_another_admin(self):
        other_staff = User.objects.create_user(
            username="other-staff",
            email="other-staff@example.com",
            password="OtherPass1!",
            role=User.ROLE_ORGANIZATION,
            is_staff=True,
        )

        response = self.client.delete(f"/api/admin/admins/{other_staff.id}/")

        self.assertEqual(response.status_code, 403)
        self.assertTrue(User.objects.filter(id=other_staff.id).exists())

    def test_superuser_cannot_remove_another_superuser(self):
        superuser = User.objects.create_user(
            username="superadmin",
            email="superadmin@example.com",
            password="SuperPass1!",
            role=User.ROLE_ORGANIZATION,
            is_staff=True,
            is_superuser=True,
        )
        other_superuser = User.objects.create_user(
            username="other-superadmin",
            email="other-superadmin@example.com",
            password="OtherSuperPass1!",
            role=User.ROLE_ORGANIZATION,
            is_staff=True,
            is_superuser=True,
        )
        client = APIClient()
        client.force_authenticate(user=superuser)

        response = client.delete(f"/api/admin/admins/{other_superuser.id}/")

        self.assertEqual(response.status_code, 404)
        self.assertTrue(User.objects.filter(id=other_superuser.id).exists())

    def test_superuser_cannot_remove_own_account(self):
        superuser = User.objects.create_user(
            username="superadmin",
            email="superadmin@example.com",
            password="SuperPass1!",
            role=User.ROLE_ORGANIZATION,
            is_staff=True,
            is_superuser=True,
        )
        client = APIClient()
        client.force_authenticate(user=superuser)

        response = client.delete(f"/api/admin/admins/{superuser.id}/")

        # Superusers are excluded from this endpoint's queryset entirely, so a
        # superuser can never remove themselves (or any other superuser) here.
        self.assertEqual(response.status_code, 404)
        self.assertTrue(User.objects.filter(id=superuser.id).exists())
