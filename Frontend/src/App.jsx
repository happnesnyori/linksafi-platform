import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import Home from './pages/public/Home';
import HowItWorks from './pages/public/HowItWorks';
import Companies from './pages/public/Companies';
import CompanyDetails from './pages/public/CompanyDetails';
import Services from './pages/public/Services';
import Contact from './pages/public/Contact';
import FAQ from './pages/public/FAQ';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import PublicRequestService from './pages/public/PublicRequestService';
import OrganizationDashboard from './pages/organization/Dashboard';
import Marketplace from './pages/organization/Marketplace';
import MyRequests from './pages/organization/MyRequests';
import OrganizationRequestDetails from './pages/organization/RequestDetails';
import OrganizationProfile from './pages/organization/Profile';
import CompanyOverview from './pages/company/Overview';
import CompanyReport from './pages/company/Report';
import CompanyCompleteProfile from './pages/company/CompleteProfile';
import CompanyRequests from './pages/company/Requests';
import CompanyRequestDetails from './pages/company/RequestDetails';
import ManageServices from './pages/company/Services';
import CompanyProfile from './pages/company/Profile';
import CompanyGallery from './pages/company/Gallery';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCompanies from './pages/admin/Companies';
import AdminCompaniesPending from './pages/admin/CompaniesPending';
import AdminCompaniesApproved from './pages/admin/CompaniesApproved';
import AdminCompanyAddForm from './pages/admin/CompanyAddForm';
import AdminRequests from './pages/admin/Requests';
import AdminReviews from './pages/admin/Reviews';
import AdminSettings from './pages/admin/Settings';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Loading from './components/Loading';

function App() {
    const { isAuthenticated, user, loading } = useAuth();
    const isAdmin = user?.is_staff || user?.is_superuser || user?.role === 'admin';

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#ffffff' }}>
                <Loading />
            </div>
        );
    }

    return (
        <ToastProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/companies/:id" element={<CompanyDetails />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/request-service/:companyId" element={<PublicRequestService />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? '/admin' : user?.role === 'company' ? '/company/overview' : '/dashboard'} /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to={isAdmin ? '/admin' : user?.role === 'company' ? '/company/overview' : '/dashboard'} /> : <Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
                <Route path="/admin/login" element={isAuthenticated && isAdmin ? <Navigate to="/admin" /> : <AdminLogin />} />

                <Route path="/dashboard" element={<ProtectedRoute><RoleRoute allowedRoles={['organization']}><OrganizationDashboard /></RoleRoute></ProtectedRoute>} />
                <Route path="/organization/browse" element={<ProtectedRoute><RoleRoute allowedRoles={['organization']}><Marketplace /></RoleRoute></ProtectedRoute>} />
                <Route path="/find-companies" element={<Navigate to="/organization/browse" replace />} />
                <Route path="/requests" element={<ProtectedRoute><RoleRoute allowedRoles={['organization']}><MyRequests /></RoleRoute></ProtectedRoute>} />
                <Route path="/requests/:requestId" element={<ProtectedRoute><RoleRoute allowedRoles={['organization']}><OrganizationRequestDetails /></RoleRoute></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><RoleRoute allowedRoles={['organization']}><OrganizationProfile /></RoleRoute></ProtectedRoute>} />

                <Route path="/company/setup" element={<ProtectedRoute><RoleRoute allowedRoles={['company']}><CompanyCompleteProfile /></RoleRoute></ProtectedRoute>} />
                <Route path="/company/dashboard" element={<Navigate to="/company/overview" replace />} />
                <Route path="/company/overview" element={<ProtectedRoute><RoleRoute allowedRoles={['company']}><CompanyOverview /></RoleRoute></ProtectedRoute>} />
                <Route path="/company/report" element={<ProtectedRoute><RoleRoute allowedRoles={['company']}><CompanyReport /></RoleRoute></ProtectedRoute>} />
                <Route path="/company/requests" element={<ProtectedRoute><RoleRoute allowedRoles={['company']}><CompanyRequests /></RoleRoute></ProtectedRoute>} />
                <Route path="/company/requests/:requestId" element={<ProtectedRoute><RoleRoute allowedRoles={['company']}><CompanyRequestDetails /></RoleRoute></ProtectedRoute>} />
                <Route path="/company/services" element={<ProtectedRoute><RoleRoute allowedRoles={['company']}><ManageServices /></RoleRoute></ProtectedRoute>} />
                <Route path="/company/profile" element={<ProtectedRoute><RoleRoute allowedRoles={['company']}><CompanyProfile /></RoleRoute></ProtectedRoute>} />
                <Route path="/company/gallery" element={<ProtectedRoute><RoleRoute allowedRoles={['company']}><CompanyGallery /></RoleRoute></ProtectedRoute>} />

                <Route path="/admin" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><AdminLayout /></RoleRoute></ProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="companies" element={<AdminCompanies />} />
                    <Route path="companies/pending" element={<AdminCompaniesPending />} />
                    <Route path="companies/approved" element={<AdminCompaniesApproved />} />
                    <Route path="companies/new" element={<AdminCompanyAddForm />} />
                    <Route path="companies/add" element={<Navigate to="/admin/companies/new" replace />} />
                    <Route path="requests" element={<AdminRequests />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<PublicLayout><div className="page-container" style={{ textAlign: 'center', padding: '100px 20px' }}><h1 className="page-title">404 - Page Not Found</h1><p className="page-subtitle">The page you're looking for doesn't exist</p><a href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</a></div></PublicLayout>} />
            </Routes>
        </ToastProvider>
    );
}

export default App;
