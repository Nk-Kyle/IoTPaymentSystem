from django.http import JsonResponse
from django.views import View

from api.models import User
from api.applications.user import get_user_info
from api.applications.transaction import Transaction
from django.contrib.auth.hashers import check_password
from django.views.decorators.csrf import csrf_exempt

from django.utils.decorators import method_decorator

import json

# class based view


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):
    def post(self, request):
        # Get JSON data from request
        data = request.body
        data = json.loads(data)
        uid = data.get("uid")
        password = data.get("password")

        # password was hashed with make_password
        user = User.objects.filter(uid=uid).first()
        if not user:
            return JsonResponse(
                {"status": "failed", "message": "Invalid account"}, status=401
            )

        if user and check_password(password, user.password):
            return JsonResponse({"status": "success", "balance": user.balance})
        return JsonResponse(
            {"status": "failed", "message": "Invalid credentials"}, status=401
        )


@method_decorator(csrf_exempt, name="dispatch")
class InfoView(View):
    def get(self, request):
        uid = request.GET.get("uid")
        user_info = get_user_info(uid)
        return JsonResponse(user_info)


@method_decorator(csrf_exempt, name="dispatch")
class TopUpView(View):
    def post(self, request):
        data = request.body
        data = json.loads(data)
        uid = data.get("uid")
        amount = data.get("amount")

        user = User.objects.filter(uid=uid).first()
        if not user:
            return JsonResponse({"status": "failed", "message": "Invalid account"})

        transaction = Transaction(uid)
        transaction.topup(amount)

        user = User.objects.get(uid=uid)
        return JsonResponse({"status": "success", "balance": user.balance})
