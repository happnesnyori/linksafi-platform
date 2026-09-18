from django.conf import settings
from django.db import models


class AdminAuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="admin_audit_logs",
    )
    action = models.CharField(max_length=60)
    target_type = models.CharField(max_length=40)
    target_id = models.PositiveIntegerField(null=True, blank=True)
    target_repr = models.CharField(max_length=200, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        actor_label = self.actor.email if self.actor else "system"
        return f"{actor_label} {self.action} {self.target_type}#{self.target_id}"


def log_admin_action(actor, action, target, metadata=None):
    AdminAuditLog.objects.create(
        actor=actor if getattr(actor, "is_authenticated", False) else None,
        action=action,
        target_type=target.__class__.__name__.lower(),
        target_id=getattr(target, "id", None),
        target_repr=str(target)[:200],
        metadata=metadata or {},
    )
