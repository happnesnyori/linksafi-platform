from django.urls import path

from accounts.permissions import IsAdmin
from companies.views import AdminCompanyActionView
from reviews.views import AdminReviewActionView

from .views import (
    AdminCompanyListView,
    AdminCompanyCustomersView,
    AdminCompanyDetailView,
    AdminDashboardStatsView,
    AdminReviewDetailView,
    AdminReviewListView,
    AdminServiceRequestDetailView,
    AdminServiceRequestListView,
    AdminUserDetailView,
    AdminUserListView,
    AdminUserRequestsView,
)

urlpatterns = [
    path("admin/dashboard/", AdminDashboardStatsView.as_view()),
    path("admin/users/", AdminUserListView.as_view()),
    path("admin/users/<int:pk>/", AdminUserDetailView.as_view()),
    path("admin/users/<int:pk>/requests/", AdminUserRequestsView.as_view()),
    path("admin/companies/", AdminCompanyListView.as_view()),
    path("admin/companies/<int:pk>/", AdminCompanyDetailView.as_view()),
    path("admin/companies/<int:pk>/<action>/", AdminCompanyActionView.as_view()),
    path("admin/requests/", AdminServiceRequestListView.as_view()),
    path("admin/requests/<int:pk>/", AdminServiceRequestDetailView.as_view()),
    path("admin/reviews/", AdminReviewListView.as_view()),
    path("admin/reviews/<int:pk>/", AdminReviewDetailView.as_view()),
    path("admin/reviews/<int:pk>/<action>/", AdminReviewActionView.as_view()),
    path("admin/companies/<int:company_id>/customers/", AdminCompanyCustomersView.as_view()),
]