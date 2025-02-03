import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';

const Dashboard = () => {
    const { isOpen } = useSidebar();

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Sidebar />
            <main className={`pt-16 transition-all duration-300 ${isOpen ? 'md:pl-64' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Dashboard; 