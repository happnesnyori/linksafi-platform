import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import '../styles/admin.css';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const handler = () => setSidebarOpen(true);
        window.addEventListener('toggle-sidebar', handler);
        return () => window.removeEventListener('toggle-sidebar', handler);
    }, []);

    const handleMobileClose = () => setSidebarOpen(false);

    return (
        <div className="admin-layout">
            <AdminSidebar mobileOpen={sidebarOpen} onMobileClose={handleMobileClose} />
            <div className="admin-layout-main">
                <AdminNavbar onSearch={() => { }} />
                <main className="admin-layout-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
