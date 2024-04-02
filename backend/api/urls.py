# Define urls

from django.urls import path
from .views import LoginView, InfoView, TopUpView

urlpatterns = [
    path("auth/login/", LoginView.as_view()),
    path("info/", InfoView.as_view()),
    path("topup/", TopUpView.as_view()),
]
