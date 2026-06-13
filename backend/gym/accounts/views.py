import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Account
@csrf_exempt
def register(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")
        role = data.get("role")

        if Account.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)

        Account.objects.create(
            username=username,
            password=password,
            role=role
        )

        return JsonResponse({"message": "Registered successfully"})
@csrf_exempt
def login(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")

        try:
            user = Account.objects.get(username=username, password=password)
            return JsonResponse({
                "message": "Login successful",
                "username": user.username,
                "role": user.role
            })
        except Account.DoesNotExist:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
