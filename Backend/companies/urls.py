from django.urls import path

from .views import (
    CompanyDetailView,
    CompanyListCreateView,
    CompanyServicesView,
    MyCompanyView,
)

urlpatterns = [
    path("companies/", CompanyListCreateView.as_view()),
    path("companies/me/", MyCompanyView.as_view()),
    path("companies/<int:pk>/", CompanyDetailView.as_view()),
    path("companies/<int:pk>/services/", CompanyServicesView.as_view()),
]