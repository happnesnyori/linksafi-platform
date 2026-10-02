from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import TestCase
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

User = get_user_model()


class PasswordResetTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="jane",
            email="jane@example.com",
            password="OldPass1!",
            role=User.ROLE_ORGANIZATION,
        )
        self.client = APIClient()

    def test_request_reset_for_known_email_sends_link(self):
        response = self.client.post(
            "/api/auth/password-reset/", {"email": "jane@example.com"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("jane@example.com", mail.outbox[0].to)
        self.assertIn("/reset-password/", mail.outbox[0].body)

    def test_request_reset_for_unknown_email_gives_same_response_without_sending(self):
        response = self.client.post(
            "/api/auth/password-reset/", {"email": "nobody@example.com"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_confirm_with_valid_token_changes_password(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {"uid": uid, "token": token, "new_password": "NewPass1!"},
        )

        self.assertEqual(response.status_code, 200)
        login_response = self.client.post(
            "/api/auth/login/", {"email": "jane@example.com", "password": "NewPass1!"}
        )
        self.assertEqual(login_response.status_code, 200)

    def test_confirm_with_invalid_token_is_rejected(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {"uid": uid, "token": "not-a-real-token", "new_password": "NewPass1!"},
        )

        self.assertEqual(response.status_code, 400)

    def test_confirm_with_weak_password_is_rejected(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {"uid": uid, "token": token, "new_password": "weak"},
        )

        self.assertEqual(response.status_code, 400)
