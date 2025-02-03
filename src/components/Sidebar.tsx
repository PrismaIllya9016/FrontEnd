import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { isOpen } = useSidebar();

    return (
        <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg w-64 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4">
                <ul className="space-y-2">
                    <li>
                        <Link
                            to="/"
                            className={`flex items-center p-2 hover:bg-gray-100 rounded-lg text-gray-700 ${location.pathname === '/' ? 'bg-gray-100' : ''}`}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Inicio</span>
                        </Link>
                    </li>
                    {user?.role === 'admin' && (
                        <li>
                            <Link
                                to="/users"
                                className={`flex items-center p-2 hover:bg-gray-100 rounded-lg text-gray-700 ${location.pathname === '/users' ? 'bg-gray-100' : ''}`}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>Usuarios</span>
                            </Link>
                        </li>
                    )}
                    <li>
                        <Link
                            to="/productos"
                            className={`flex items-center p-2 hover:bg-gray-100 rounded-lg text-gray-700 ${location.pathname === '/productos' ? 'bg-gray-100' : ''}`}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span>Productos</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar; 