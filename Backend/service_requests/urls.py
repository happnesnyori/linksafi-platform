from django.urls import path, re_path

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
    re_path(r"^requests/?$", RequestListCreateView.as_view()),
    re_path(r"^requests/(?P<pk>\d+)/?$", RequestDetailView.as_view()),
    re_path(r"^requests/(?P<pk>\d+)/accept/?$", AcceptRequestView.as_view()),
    re_path(r"^requests/(?P<pk>\d+)/reject/?$", RejectRequestView.as_view()),
    re_path(r"^requests/(?P<pk>\d+)/respond/?$", RespondToRequestView.as_view()),
    re_path(r"^public/requests/?$", PublicServiceRequestView.as_view()),
    re_path(r"^company/requests/?$", CompanyRequestListView.as_view()),
    re_path(r"^stats/?$", StatsView.as_view()),
]
