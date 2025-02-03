import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { toggleSidebar } = useSidebar();

    return (
        <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
            <div className="px-4 h-16 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <span className="ml-4 text-xl font-semibold">MAJA Dashboard</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-gray-700">{user?.name}</span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                    </button>

                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar 