from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdmin, IsOrganization
from companies.models import Company

from .models import Review
from .serializers import ReviewPublicSerializer, ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        qs = Review.objects.select_related("company", "customer").filter(
            status__in=[Review.STATUS_PUBLISHED, "visible"],
            company__status=Company.STATUS_APPROVED,
            company__is_active=True,
        )
        company_id = self.request.query_params.get("company_id")
        if company_id:
            qs = qs.filter(company_id=company_id)
        return qs.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        if request.user.role != User.ROLE_ORGANIZATION:
            return Response(
                {"detail": "Only organization accounts can leave reviews."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(
            customer=request.user,
            status=Review.STATUS_PENDING,
            is_featured=False,
        )
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


class CompanyReviewsView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, company_id):
        qs = Review.objects.select_related("customer", "company").filter(
            company_id=company_id,
            status__in=[Review.STATUS_PUBLISHED, "visible"],
            company__status=Company.STATUS_APPROVED,
            company__is_active=True,
        ).order_by("-created_at")
        serializer = ReviewPublicSerializer(qs, many=True)
        return Response(serializer.data)


class CompanyRatingView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, company_id):
        agg = Review.objects.filter(
            company_id=company_id,
            status__in=[Review.STATUS_PUBLISHED, "visible"],
            company__status=Company.STATUS_APPROVED,
            company__is_active=True,
        ).aggregate(avg=Avg("rating"), count=Count("id"))
        count = agg["count"] or 0
        avg = round(float(agg["avg"]), 1) if count > 0 and agg["avg"] is not None else None
        return Response({
            "average": avg,
            "count": count,
        })


class FeaturedReviewsView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        qs = Review.objects.select_related("customer", "company").filter(
            status__in=[Review.STATUS_PUBLISHED, "visible"],
            is_featured=True,
            company__status=Company.STATUS_APPROVED,
            company__is_active=True,
        ).order_by("-created_at")[:6]
        serializer = ReviewPublicSerializer(qs, many=True)
        return Response(serializer.data)


class AdminReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (IsAdmin,)

    def get_queryset(self):
        qs = Review.objects.select_related("company", "customer").all()
        company_id = self.request.query_params.get("company_id")
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")
        if company_id:
            qs = qs.filter(company_id=company_id)
        if status_filter:
            if status_filter == "published":
                qs = qs.filter(status__in=[Review.STATUS_PUBLISHED, "visible"])
            elif status_filter == "pending":
                qs = qs.filter(status__in=[Review.STATUS_PENDING, "hidden"])
            elif status_filter == "rejected":
                qs = qs.filter(status__in=[Review.STATUS_REJECTED, "removed"])
            else:
                qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(
                Q(comment__icontains=search)
                | Q(customer__name__icontains=search)
                | Q(company__name__icontains=search)
            )
        return qs.order_by("-created_at")


class AdminReviewActionView(APIView):
    permission_classes = (IsAdmin,)

    def post(self, request, pk, action):
        review = get_object_or_404(Review, pk=pk)
        if action in ("approve", "publish", "restore"):
            review.status = Review.STATUS_PUBLISHED
        elif action == "reject":
            review.status = Review.STATUS_REJECTED
        elif action in ("unpublish", "hide"):
            review.status = Review.STATUS_PENDING
        elif action == "remove":
            review.status = Review.STATUS_REMOVED
        elif action in ("feature", "unfeature", "toggle_feature"):
            if review.status != Review.STATUS_PUBLISHED:
                return Response(
                    {"detail": "Only published reviews can be featured."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if action == "feature":
                review.is_featured = True
            elif action == "unfeature":
                review.is_featured = False
            else:
                review.is_featured = not review.is_featured
        else:
            return Response(
                {"detail": f"Unknown action: {action}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        review.save()
        return Response(ReviewSerializer(review).data)
