import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from accounts.models import Account
from .models import (
    JoinRequest,
    TrainerAssignment,
    DailyRecord
)

# ==============================
# USER → JOIN GYM
# ==============================
@csrf_exempt
def join_gym(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    data = json.loads(request.body)
    username = data.get("username")

    try:
        user = Account.objects.get(username=username, role="user")
    except Account.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    if JoinRequest.objects.filter(user=user).exists():
        return JsonResponse({"error": "Already applied"})

    JoinRequest.objects.create(
        user=user,
        age=data.get("age"),
        height=data.get("height"),
        weight=data.get("weight"),
        gym_type=data.get("gym_type")
    )

    return JsonResponse({"message": "Join request sent"})


# ==============================
# ADMIN → VIEW PENDING REQUESTS
# ==============================
def admin_join_requests(request):
    requests = JoinRequest.objects.filter(approved=False).select_related("user")

    data = [
        {
            "username": r.user.username,
            "age": r.age,
            "height": r.height,
            "weight": r.weight,
            "gym_type": r.gym_type
        }
        for r in requests
    ]

    return JsonResponse(data, safe=False)


# ==============================
# ADMIN → APPROVE USER + ASSIGN TRAINER
# ==============================
@csrf_exempt
def approve_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    data = json.loads(request.body)

    try:
        user = Account.objects.get(username=data["user"], role="user")
        trainer = Account.objects.get(username=data["trainer"], role="trainer")
    except Account.DoesNotExist:
        return JsonResponse({"error": "User or trainer not found"}, status=404)

    join = JoinRequest.objects.get(user=user)
    join.approved = True
    join.save()

    TrainerAssignment.objects.update_or_create(
        user=user,
        defaults={"trainer": trainer}
    )

    return JsonResponse({"message": "User approved & trainer assigned"})


# ==============================
# USER → CHECK STATUS + TRAINER
# ==============================
def user_status(request, username):
    try:
        user = Account.objects.get(username=username, role="user")
    except Account.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    try:
        join = JoinRequest.objects.get(user=user)
    except JoinRequest.DoesNotExist:
        return JsonResponse({"approved": False, "trainer": None})

    if not join.approved:
        return JsonResponse({"approved": False, "trainer": None})

    try:
        assign = TrainerAssignment.objects.get(user=user)
        trainer_name = assign.trainer.username
    except TrainerAssignment.DoesNotExist:
        trainer_name = None

    return JsonResponse({
        "approved": True,
        "trainer": trainer_name
    })


# ==============================
# TRAINER → VIEW ASSIGNED USERS
# ==============================
def trainer_users(request, username):
    try:
        trainer = Account.objects.get(username=username, role="trainer")
    except Account.DoesNotExist:
        return JsonResponse({"error": "Trainer not found"}, status=404)

    assignments = TrainerAssignment.objects.filter(
        trainer=trainer
    ).select_related("user")

    data = [{"username": a.user.username} for a in assignments]
    return JsonResponse(data, safe=False)


# ==============================
# TRAINER → DAILY UPDATE
# Workout + Diet + Attendance
# ==============================
@csrf_exempt
def trainer_daily_update(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    data = json.loads(request.body)

    try:
        trainer = Account.objects.get(username=data["trainer"], role="trainer")
        user = Account.objects.get(username=data["user"], role="user")
    except Account.DoesNotExist:
        return JsonResponse({"error": "User or trainer not found"}, status=404)

    if not TrainerAssignment.objects.filter(user=user, trainer=trainer).exists():
        return JsonResponse({"error": "Trainer not assigned to this user"}, status=403)

    DailyRecord.objects.update_or_create(
        user=user,
        date=timezone.now().date(),
        defaults={
            "trainer": trainer,
            "workout": data.get("workout", ""),
            "diet": data.get("diet", ""),
            "present": data.get("present", True)
        }
    )

    return JsonResponse({"message": "Daily update saved"})


# ==============================
# USER → DAILY / MONTHLY PROGRESS
# ==============================
def user_progress(request, username):
    try:
        user = Account.objects.get(username=username, role="user")
    except Account.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    records = DailyRecord.objects.filter(user=user).order_by("-date")

    data = [
        {
            "date": r.date,
            "workout": r.workout,
            "diet": r.diet,
            "present": r.present,
            "trainer": r.trainer.username
        }
        for r in records
    ]

    return JsonResponse(data, safe=False)
