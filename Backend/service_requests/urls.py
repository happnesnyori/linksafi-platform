from django.urls import path

from .views import (
    AcceptRequestView,
    CompanyRequestListView,
    PublicServiceRequestView,
    RejectRequestView,
    RequestDetailView,
    RequestListCreateView,
    RespondToRequestView,
    StatsView,
)

urlpatterns = [
    path("requests/", RequestListCreateView.as_view()),
    path("requests/<int:pk>/", RequestDetailView.as_view()),
    path("requests/<int:pk>/accept/", AcceptRequestView.as_view()),
    path("requests/<int:pk>/reject/", RejectRequestView.as_view()),
    path("requests/<int:pk>/respond/", RespondToRequestView.as_view()),
    path("public/requests/", PublicServiceRequestView.as_view()),
    path("company/requests/", CompanyRequestListView.as_view()),
    path("stats/", StatsView.as_view()),
]