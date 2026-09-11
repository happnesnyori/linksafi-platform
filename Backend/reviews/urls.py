from django.urls import path

from .views import (
    CompanyRatingView,
    CompanyReviewsView,
    ReviewListCreateView,
)

urlpatterns = [
    path("reviews/", ReviewListCreateView.as_view()),
    path("reviews/company/<int:company_id>/", CompanyReviewsView.as_view()),
    path("reviews/rating/<int:company_id>/", CompanyRatingView.as_view()),
]