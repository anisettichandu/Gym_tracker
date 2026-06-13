from django.db import models
from django.utils import timezone
from accounts.models import Account


# ==============================
# JOIN REQUEST (USER → ADMIN)
# ==============================
class JoinRequest(models.Model):
    user = models.OneToOneField(Account, on_delete=models.CASCADE)
    age = models.IntegerField()
    height = models.FloatField()
    weight = models.FloatField()
    gym_type = models.CharField(max_length=100)
    approved = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username


# ==============================
# TRAINER ASSIGNMENT (ADMIN)
# ==============================
class TrainerAssignment(models.Model):
    user = models.OneToOneField(
        Account,
        on_delete=models.CASCADE,
        related_name="assigned_trainer"
    )
    trainer = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="assigned_users"
    )

    def __str__(self):
        return f"{self.user.username} → {self.trainer.username}"


# ==============================
# DAILY RECORD (MAIN MODEL)
# Trainer updates → User views
# ==============================
class DailyRecord(models.Model):
    user = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="daily_records"
    )
    trainer = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="trainer_records"
    )

    date = models.DateField(default=timezone.now)

    workout = models.TextField(blank=True)
    diet = models.TextField(blank=True)
    present = models.BooleanField(default=True)

    class Meta:
        unique_together = ("user", "date")   # ONE record per user per day
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.username} | {self.date}"
