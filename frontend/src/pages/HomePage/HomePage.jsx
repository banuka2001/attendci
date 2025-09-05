import React, { useState } from 'react';
import { 
    MdDashboard, MdSchool, MdLogout, MdMenu 
} from 'react-icons/md';
import { 
    FaUserCircle, FaUserGraduate, FaChalkboardTeacher, FaUserCheck, FaUserEdit
} from 'react-icons/fa';
import { useAuth } from '../../components/context/AuthContext';

// Import page components
import StudentRegisterPage from './StudentRegisterPage';
import StudentAttendPage from './StudentAttendPage';
import AddNewTeacherPage from './AddNewTeacherPage';
import AddClassesPage from './AddClassesPage';
import StudentEnrollPage from './StudentEnrollPage';
import Dashboard from './Dashboard';

const HomePage = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('Dashboard'); // State for active item

    // Define navigation items for different roles
    const allNavItems = [
        { icon: <MdDashboard />, label: 'Dashboard', roles: ['Admin', 'Student'] },
        { icon: <FaUserGraduate />, label: 'Student Register', roles: ['Admin', 'Student'] },
        { icon: <FaUserCheck />, label: 'Student Attend', roles: ['Admin', 'Student'] },
        { icon: <FaChalkboardTeacher />, label: 'Add New Teacher', roles: ['Admin', 'Student'] },
        { icon: <MdSchool />, label: 'Add Classes', roles: ['Admin', 'Student'] },
        { icon: <FaUserEdit />, label: 'Student Enroll', roles: ['Admin', 'Student'] },
    ];

    // Filter navigation items based on user role
    const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

    // Function to render the current page based on activeItem
    const renderContent = () => {
        switch (activeItem) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Student Register':
                return <StudentRegisterPage />;
            case 'Student Attend':
                return <StudentAttendPage />;
            case 'Add New Teacher':
                return <AddNewTeacherPage />;
            case 'Add Classes':
                return <AddClassesPage />;
            case 'Student Enroll':
                return <StudentEnrollPage />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white text-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col shadow-lg`}
            >
                {/* Sidebar Header */}
                <div className="flex flex-col items-center p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4 w-full">
                        <FaUserCircle size={50} className="text-blue-500" />
                        <div className="text-left">
                            <h4 className="font-bold text-lg">Hello There</h4>
                            <p className="text-sm text-gray-500">Welcome to attendci</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-grow px-4 py-6">
                    <ul className="space-y-2">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <a 
                                    href="#" 
                                    onClick={() => setActiveItem(item.label)}
                                    className={`flex items-center space-x-4 px-4 py-3 rounded-lg text-md font-medium transition-colors ${
                                        activeItem === item.label
                                        ? 'bg-blue-500 text-white shadow-md' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200">
                    <button 
                        className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors shadow-md"
                        onClick={logout}
                    >
                        <MdLogout size={20} />
                        <span className="font-semibold">Logout</span>
                    </button>
                    <div className="text-center mt-4 text-xs text-gray-400">
                        <p>Attendci Cloud V.2</p>
                        <p>Powered by AKAICODEX</p>
                    </div>
                </div>
            </aside>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Main Header */}
                <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800 uppercase">{activeItem}</h1>
                    <button className="lg:hidden text-gray-600 hover:text-gray-800" onClick={() => setSidebarOpen(true)}>
                        <MdMenu size={28} />
                    </button>
                </header>
                
                {/* Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
             {/* Overlay for mobile sidebar */}
             {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-20 lg:hidden" 
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default HomePage;