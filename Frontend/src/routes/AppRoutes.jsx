import { Navigate, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import PublicLayout from '../layouts/PublicLayout';
import OrganizationLayout from '../layouts/OrganizationLayout';
import CompanyLayout from '../layouts/CompanyLayout';
import AdminLayout from '../layouts/AdminLayout';

import Home from '../pages/public/Home';
import Companies from '../pages/public/Companies';
import CompanyDetails from '../pages/public/CompanyDetails';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import PublicRequestService from '../pages/public/PublicRequestService';

import OrganizationDashboard from '../pages/organization/Dashboard';
import FindCompanies from '../pages/organization/FindCompanies';
import MyRequests from '../pages/organization/MyRequests';
import OrganizationRequestDetails from '../pages/organization/RequestDetails';
import OrganizationProfile from '../pages/organization/Profile';

import CompanyDashboard from '../pages/company/Dashboard';
import CompanyRequests from '../pages/company/Requests';
import CompanyRequestDetails from '../pages/company/RequestDetails';
import CompanyServices from '../pages/company/Services';
import CompanyProfile from '../pages/company/Profile';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminCompanies from '../pages/admin/Companies';
import AdminCustomers from '../pages/admin/Customers';
import AdminRequests from '../pages/admin/Requests';
import AdminReviews from '../pages/admin/Reviews';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/companies/:id" element={<CompanyDetails />} />
                <Route path="/request-service/:companyId" element={<PublicRequestService />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleRoute allowedRoles={['organization']}>
                            <OrganizationLayout />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            >
                <Route index element={<OrganizationDashboard />} />
                <Route path="find-companies" element={<FindCompanies />} />
                <Route path="requests" element={<MyRequests />} />
                <Route path="profile" element={<OrganizationProfile />} />
            </Route>

            <Route
                path="/requests"
                element={
                    <ProtectedRoute>
                        <RoleRoute allowedRoles={['organization']}>
                            <OrganizationLayout />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            >
                <Route path=":id" element={<OrganizationRequestDetails />} />
            </Route>

            <Route
                path="/company"
                element={
                    <ProtectedRoute>
                        <RoleRoute allowedRoles={['company']}>
                            <CompanyLayout />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="requests" element={<CompanyRequests />} />
                <Route path="services" element={<CompanyServices />} />
                <Route path="profile" element={<CompanyProfile />} />
            </Route>

            <Route
                path="/company/requests"
                element={
                    <ProtectedRoute>
                        <RoleRoute allowedRoles={['company']}>
                            <CompanyLayout />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            >
                <Route path=":id" element={<CompanyRequestDetails />} />
            </Route>

            {/* Admin routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <RoleRoute allowedRoles={['admin']}>
                            <AdminLayout />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="companies" element={<AdminCompanies />} />
                <Route path="companies/pending" element={<Navigate to="/admin/companies?status=pending" replace />} />
                <Route path="companies/approved" element={<Navigate to="/admin/companies?status=approved" replace />} />
                <Route path="companies/add" element={<Navigate to="/admin/companies?create=true" replace />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="reviews" element={<AdminReviews />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;