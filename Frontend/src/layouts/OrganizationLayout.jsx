import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrganizationLayout({ children }) {
    return (
        <>
            <Navbar />
            <main className="dashboard">{children}</main>
            <Footer />
        </>
    );
}
