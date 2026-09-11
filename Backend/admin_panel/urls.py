from django.contrib.auth.views import LoginView
from django.urls import path

from .views import (
    AdminLogoutView,
    CompanyCreateView,
    CompanyDeleteView,
    CompanyDetailView,
    CompanyListView,
    CompanyUpdateView,
    DashboardView,
    ServiceRequestCreateView,
    ServiceRequestDeleteView,
    ServiceRequestDetailView,
    ServiceRequestListView,
    ServiceRequestUpdateView,
    UserCreateView,
    UserDeleteView,
    UserDetailView,
    UserListView,
    UserUpdateView,
)

app_name = "admin_panel"

urlpatterns = [
    path("login/", LoginView.as_view(template_name="admin_panel/login.html"), name="login"),
    path("logout/", AdminLogoutView.as_view(), name="logout"),
    path("", DashboardView.as_view(), name="dashboard"),
    path("users/", UserListView.as_view(), name="user_list"),
    path("users/add/", UserCreateView.as_view(), name="user_add"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),
    path("users/<int:pk>/edit/", UserUpdateView.as_view(), name="user_edit"),
    path("users/<int:pk>/delete/", UserDeleteView.as_view(), name="user_delete"),
    path("companies/", CompanyListView.as_view(), name="company_list"),
    path("companies/add/", CompanyCreateView.as_view(), name="company_add"),
    path("companies/<int:pk>/", CompanyDetailView.as_view(), name="company_detail"),
    path("companies/<int:pk>/edit/", CompanyUpdateView.as_view(), name="company_edit"),
    path(
        "companies/<int:pk>/delete/",
        CompanyDeleteView.as_view(),
        name="company_delete",
    ),
    path("requests/", ServiceRequestListView.as_view(), name="request_list"),
    path("requests/add/", ServiceRequestCreateView.as_view(), name="request_add"),
    path(
        "requests/<int:pk>/",
        ServiceRequestDetailView.as_view(),
        name="request_detail",
    ),
    path(
        "requests/<int:pk>/edit/",
        ServiceRequestUpdateView.as_view(),
        name="request_edit",
    ),
    path(
        "requests/<int:pk>/delete/",
        ServiceRequestDeleteView.as_view(),
        name="request_delete",
    ),
]
