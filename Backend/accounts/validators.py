import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class StrongPasswordValidator:
    message = _(
        "Use at least 8 characters, including uppercase and lowercase letters, a number, and a special character."
    )

    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError(self.message, code="password_too_weak")
        if not re.search(r"[A-Z]", password):
            raise ValidationError(self.message, code="password_too_weak")
        if not re.search(r"[a-z]", password):
            raise ValidationError(self.message, code="password_too_weak")
        if not re.search(r"\d", password):
            raise ValidationError(self.message, code="password_too_weak")
        if not re.search(r"[^A-Za-z0-9]", password):
            raise ValidationError(self.message, code="password_too_weak")

    def get_help_text(self):
        return self.message
