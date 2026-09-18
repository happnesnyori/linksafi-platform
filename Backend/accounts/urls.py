from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CurrentUserView,
    LoginView,
    LogoutView,
    RefreshView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("refresh/", RefreshView.as_view()),
    path("me/", CurrentUserView.as_view()),
    re_path(r"^register/?$", RegisterView.as_view()),
    re_path(r"^login/?$", LoginView.as_view()),
    re_path(r"^logout/?$", LogoutView.as_view()),
    re_path(r"^refresh/?$", RefreshView.as_view()),
    re_path(r"^me/?$", CurrentUserView.as_view()),
]
