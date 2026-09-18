from django.urls import path, re_path

from .views import (
    CompanyDetailView,
    CompanyGalleryDetailView,
    CompanyGalleryView,
    CompanyListCreateView,
    CompanyServicesView,
    MyCompanyView,
    ServiceListView,
)

urlpatterns = [
    path("services/", ServiceListView.as_view()),
    path("companies/", CompanyListCreateView.as_view()),
    path("companies/me/", MyCompanyView.as_view()),
    path("companies/me/services/", CompanyServicesView.as_view()),
    path("companies/me/gallery/", CompanyGalleryView.as_view()),
    path("companies/<int:pk>/", CompanyDetailView.as_view()),
    path("companies/<int:pk>/services/", CompanyServicesView.as_view()),
    path("companies/<int:pk>/gallery/", CompanyGalleryView.as_view()),
    path("companies/gallery/<int:pk>/", CompanyGalleryDetailView.as_view()),
    re_path(r"^services/?$", ServiceListView.as_view()),
    re_path(r"^companies/?$", CompanyListCreateView.as_view()),
    re_path(r"^companies/me/?$", MyCompanyView.as_view()),
    re_path(r"^companies/me/services/?$", CompanyServicesView.as_view()),
    re_path(r"^companies/me/gallery/?$", CompanyGalleryView.as_view()),
    re_path(r"^companies/(?P<pk>\d+)/?$", CompanyDetailView.as_view()),
    re_path(r"^companies/(?P<pk>\d+)/services/?$", CompanyServicesView.as_view()),
    re_path(r"^companies/(?P<pk>\d+)/gallery/?$", CompanyGalleryView.as_view()),
    re_path(r"^companies/gallery/(?P<pk>\d+)/?$", CompanyGalleryDetailView.as_view()),
]
