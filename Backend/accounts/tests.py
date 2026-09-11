from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.test import SimpleTestCase


class PasswordValidationTests(SimpleTestCase):
    def test_password_requires_uppercase_lowercase_number_and_special_character(self):
        with self.assertRaises(ValidationError):
            validate_password('weakpass1!')

    def test_strong_password_is_accepted(self):
        validate_password('StrongPass1!')
