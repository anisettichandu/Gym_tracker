from django.urls import path
from . import views

urlpatterns = [

    # ===================== USER =====================
    # User sends join request
    path(
        "join/",
        views.join_gym,
        name="join_gym"
    ),

    # User checks approval + trainer
    path(
        "user/status/<str:username>/",
        views.user_status,
        name="user_status"
    ),

    # User sees daily & monthly progress
    path(
        "user/progress/<str:username>/",
        views.user_progress,
        name="user_progress"
    ),


    # ===================== ADMIN =====================
    # Admin sees pending join requests
    path(
        "admin/join-requests/",
        views.admin_join_requests,
        name="admin_join_requests"
    ),

    # Admin approves user + assigns trainer
    path(
        "admin/approve/",
        views.approve_user,
        name="approve_user"
    ),


    # ===================== TRAINER =====================
    # Trainer sees assigned users
    path(
        "trainer/users/<str:username>/",
        views.trainer_users,
        name="trainer_users"
    ),

    # Trainer adds DAILY update
    # (workout + diet + attendance in one API)
    path(
        "trainer/daily-update/",
        views.trainer_daily_update,
        name="trainer_daily_update"
    ),
]
