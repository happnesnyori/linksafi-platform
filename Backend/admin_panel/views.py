import json

from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.views import LogoutView
from django.db.models import Count
from django.urls import reverse_lazy
from django.views.generic import (
    CreateView,
    DeleteView,
    DetailView,
    ListView,
    TemplateView,
    UpdateView,
)

from companies.models import Company
from service_requests.models import ServiceRequest

from .forms import CompanyForm, ServiceRequestForm, UserCreateForm, UserUpdateForm

User = get_user_model()


class AdminRequiredMixin(UserPassesTestMixin):
    login_url = "admin_panel:login"
    raise_exception = False

    def test_func(self):
        user = self.request.user
        return bool(user.is_authenticated and (user.is_staff or user.is_superuser))


class StaffRequiredMixin(LoginRequiredMixin, AdminRequiredMixin):
    pass


class DashboardView(StaffRequiredMixin, TemplateView):
    template_name = "admin_panel/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        users = User.objects.all()
        companies = Company.objects.all()
        requests = ServiceRequest.objects.all()

        role_counts = users.values("role").annotate(count=Count("id"))
        role_map = {item["role"]: item["count"] for item in role_counts}

        status_counts = requests.values("status").annotate(count=Count("id"))
        status_map = {item["status"]: item["count"] for item in status_counts}

        service_counts = requests.values("service").annotate(count=Count("id"))
        service_map = {item["service"]: item["count"] for item in service_counts}

        pending = status_map.get(ServiceRequest.STATUS_PENDING, 0)
        accepted = status_map.get(ServiceRequest.STATUS_ACCEPTED, 0)
        rejected = status_map.get(ServiceRequest.STATUS_REJECTED, 0)
        completed = status_map.get(ServiceRequest.STATUS_COMPLETED, 0)

        recent_requests = requests.select_related(
            "organization", "company"
        ).order_by("-created_at")[:5]

        recent_companies = companies.select_related("owner").order_by("-created_at")[:5]
        recent_users = users.order_by("-date_joined")[:5]

        context.update(
            {
                "total_users": users.count(),
                "total_organizations": role_map.get(User.ROLE_ORGANIZATION, 0),
                "total_companies": role_map.get(User.ROLE_COMPANY, 0),
                "staff_users": users.filter(is_staff=True).count(),
                "superusers": users.filter(is_superuser=True).count(),
                "inactive_users": users.filter(is_active=False).count(),
                "total_companies_model": companies.count(),
                "total_requests": requests.count(),
                "pending_requests": pending,
                "accepted_requests": accepted,
                "rejected_requests": rejected,
                "completed_requests": completed,
                "status_chart_labels": json.dumps(
                    ["Pending", "Accepted", "Rejected", "Completed"]
                ),
                "status_chart_data": json.dumps(
                    [pending, accepted, rejected, completed]
                ),
                "status_chart_colors": json.dumps(
                    ["#f59e0b", "#2563eb", "#ef4444", "#22c55e"]
                ),
                "role_chart_labels": json.dumps(["Organization", "Company"]),
                "role_chart_data": json.dumps(
                    [
                        role_map.get(User.ROLE_ORGANIZATION, 0),
                        role_map.get(User.ROLE_COMPANY, 0),
                    ]
                ),
                "role_chart_colors": json.dumps(["#2563eb", "#22c55e"]),
                "service_chart_labels": json.dumps(["Cleaning", "Decoration", "Both"]),
                "service_chart_data": json.dumps(
                    [
                        service_map.get("cleaning", 0) + service_map.get("both", 0),
                        service_map.get("decoration", 0) + service_map.get("both", 0),
                        service_map.get("both", 0),
                    ]
                ),
                "service_chart_colors": json.dumps(
                    ["#22c55e", "#f59e0b", "#8b5cf6"]
                ),
                "recent_requests": recent_requests,
                "recent_companies": recent_companies,
                "recent_users": recent_users,
            }
        )
        return context


class UserListView(StaffRequiredMixin, ListView):
    model = User
    template_name = "admin_panel/user_list.html"
    paginate_by = 20
    queryset = User.objects.order_by("-date_joined")

    def get_queryset(self):
        qs = User.objects.order_by("-date_joined")
        role = self.request.GET.get("role")
        is_active = self.request.GET.get("is_active")
        search = self.request.GET.get("search")
        if role:
            qs = qs.filter(role=role)
        if is_active in ("true", "false"):
            qs = qs.filter(is_active=is_active == "true")
        if search:
            qs = qs.filter(email__icontains=search) | qs.filter(name__icontains=search)
        return qs


class UserDetailView(StaffRequiredMixin, DetailView):
    model = User
    template_name = "admin_panel/user_detail.html"
    queryset = User.objects.all()


class UserCreateView(StaffRequiredMixin, CreateView):
    model = User
    form_class = UserCreateForm
    template_name = "admin_panel/user_form.html"
    success_url = reverse_lazy("admin_panel:user_list")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Add New User"
        return context


class UserUpdateView(StaffRequiredMixin, UpdateView):
    model = User
    form_class = UserUpdateForm
    template_name = "admin_panel/user_form.html"
    success_url = reverse_lazy("admin_panel:user_list")
    queryset = User.objects.all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Edit User"
        context["object"] = self.object
        return context


class UserDeleteView(StaffRequiredMixin, DeleteView):
    model = User
    template_name = "admin_panel/user_confirm_delete.html"
    success_url = reverse_lazy("admin_panel:user_list")
    queryset = User.objects.all()


class CompanyListView(StaffRequiredMixin, ListView):
    model = Company
    template_name = "admin_panel/company_list.html"
    paginate_by = 20
    queryset = Company.objects.select_related("owner").order_by("-created_at")

    def get_queryset(self):
        qs = Company.objects.select_related("owner").order_by("-created_at")
        search = self.request.GET.get("search")
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(
                location__icontains=search
            )
        return qs


class CompanyDetailView(StaffRequiredMixin, DetailView):
    model = Company
    template_name = "admin_panel/company_detail.html"
    queryset = Company.objects.select_related("owner").all()


class CompanyCreateView(StaffRequiredMixin, CreateView):
    model = Company
    form_class = CompanyForm
    template_name = "admin_panel/company_form.html"
    success_url = reverse_lazy("admin_panel:company_list")
    queryset = Company.objects.all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Add New Company"
        return context


class CompanyUpdateView(StaffRequiredMixin, UpdateView):
    model = Company
    form_class = CompanyForm
    template_name = "admin_panel/company_form.html"
    success_url = reverse_lazy("admin_panel:company_list")
    queryset = Company.objects.select_related("owner").all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Edit Company"
        context["object"] = self.object
        return context


class CompanyDeleteView(StaffRequiredMixin, DeleteView):
    model = Company
    template_name = "admin_panel/company_confirm_delete.html"
    success_url = reverse_lazy("admin_panel:company_list")
    queryset = Company.objects.all()


class ServiceRequestListView(StaffRequiredMixin, ListView):
    model = ServiceRequest
    template_name = "admin_panel/request_list.html"
    paginate_by = 20
    queryset = ServiceRequest.objects.select_related(
        "organization", "company__owner"
    ).order_by("-created_at")

    def get_queryset(self):
        qs = ServiceRequest.objects.select_related(
            "organization", "company__owner"
        ).order_by("-created_at")
        status = self.request.GET.get("status")
        service = self.request.GET.get("service")
        search = self.request.GET.get("search")
        if status:
            qs = qs.filter(status=status)
        if service:
            qs = qs.filter(service=service)
        if search:
            qs = qs.filter(
                organization__email__icontains=search
            ) | qs.filter(company__name__icontains=search)
        return qs


class ServiceRequestDetailView(StaffRequiredMixin, DetailView):
    model = ServiceRequest
    template_name = "admin_panel/request_detail.html"
    queryset = ServiceRequest.objects.select_related(
        "organization", "company__owner"
    ).all()


class ServiceRequestCreateView(StaffRequiredMixin, CreateView):
    model = ServiceRequest
    form_class = ServiceRequestForm
    template_name = "admin_panel/request_form.html"
    success_url = reverse_lazy("admin_panel:request_list")
    queryset = ServiceRequest.objects.all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Add New Service Request"
        return context


class ServiceRequestUpdateView(StaffRequiredMixin, UpdateView):
    model = ServiceRequest
    form_class = ServiceRequestForm
    template_name = "admin_panel/request_form.html"
    success_url = reverse_lazy("admin_panel:request_list")
    queryset = ServiceRequest.objects.select_related(
        "organization", "company__owner"
    ).all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Edit Service Request"
        context["object"] = self.object
        return context


class ServiceRequestDeleteView(StaffRequiredMixin, DeleteView):
    model = ServiceRequest
    template_name = "admin_panel/request_confirm_delete.html"
    success_url = reverse_lazy("admin_panel:request_list")
    queryset = ServiceRequest.objects.all()


class AdminLogoutView(LogoutView):
    next_page = "admin_panel:login"
