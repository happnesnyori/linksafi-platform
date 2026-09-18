from django.urls import path, re_path

from .views import (
    CompanyRatingView,
    CompanyReviewsView,
    FeaturedReviewsView,
    ReviewListCreateView,
)

urlpatterns = [
    path("reviews/", ReviewListCreateView.as_view()),
    path("reviews/featured/", FeaturedReviewsView.as_view()),
    path("reviews/company/<int:company_id>/", CompanyReviewsView.as_view()),
    path("reviews/rating/<int:company_id>/", CompanyRatingView.as_view()),
    re_path(r"^reviews/?$", ReviewListCreateView.as_view()),
    re_path(r"^reviews/featured/?$", FeaturedReviewsView.as_view()),
    re_path(r"^reviews/company/(?P<company_id>\d+)/?$", CompanyReviewsView.as_view()),
    re_path(r"^reviews/rating/(?P<company_id>\d+)/?$", CompanyRatingView.as_view()),
]
