import React, { useState, useEffect } from 'react';
import { 
    MdDashboard, MdSchool, MdLogout, MdMenu 
} from 'react-icons/md';
import { 
    FaUserCircle, FaUserGraduate, FaChalkboardTeacher, FaUserCheck, FaUserEdit, FaRegChartBar
} from 'react-icons/fa';
import { useAuth } from '../../components/context/AuthContext';
import axios from 'axios';

// Chart placeholder component with Tailwind classes
const ChartPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <FaRegChartBar size={50} className="text-gray-300" />
        <p className="mt-4 text-sm text-gray-500">Monthly Income Analysis Chart</p>
    </div>
);

// New component to fetch and display admin-only data
const AdminData = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/admin_only.php');
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (err) {
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('An error occurred while fetching admin data.');
                }
            }
        };

        fetchData();
    }, []);

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Access Denied: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    if (!data) {
        return <p>Loading admin data...</p>;
    }

    return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Admin Secret Data</h3>
            <p><span className="font-semibold">Total Users:</span> {data.total_users}</p>
            <p><span className="font-semibold">Monthly Revenue:</span> {data.monthly_revenue}</p>
        </div>
    );
};


const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Define navigation items for different roles
    const allNavItems = [
        { icon: <MdDashboard />, label: 'Dashboard', roles: ['Admin', 'Employee', 'Student'] },
        { icon: <FaUserGraduate />, label: 'Student Register', roles: ['Admin'] },
        { icon: <FaUserCheck />, label: 'Student Attend', roles: ['Admin', 'Employee'] },
        { icon: <FaChalkboardTeacher />, label: 'Add New Teacher', roles: ['Admin'] },
        { icon: <MdSchool />, label: 'Add Classes', roles: ['Admin'] },
        { icon: <FaUserEdit />, label: 'Student Enroll', roles: ['Admin', 'Employee'] },
    ];

    // Filter navigation items based on user role
    const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col`}
            >
                {/* Sidebar Header */}
                <div className="flex flex-col items-center p-4 border-b border-gray-700">
                    <div className="text-2xl font-bold tracking-wider mb-4">ATTENDCI</div>
                    <div className="flex items-center space-x-3 w-full">
                        <FaUserCircle size={40} className="text-gray-400" />
                        <div className="text-left">
                            <h4 className="font-semibold text-sm">Hello, {user ? user.username : 'Guest'}</h4>
                            <p className="text-xs text-gray-400">Role: {user ? user.role : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-grow px-2 py-4">
                    <ul className="space-y-1">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <a 
                                    href="#" 
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                        item.active 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-700">
                    <button 
                        className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition-colors"
                        onClick={logout}
                    >
                        <MdLogout />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Main Header */}
                <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">DASHBOARD</h1>
                    <button className="lg:hidden text-gray-600 hover:text-gray-800" onClick={() => setSidebarOpen(true)}>
                        <MdMenu size={28} />
                    </button>
                </header>
                
                {/* Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {/* Summary Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {/* Card 1: Total Student */}
                        <div className="bg-white p-5 rounded-lg shadow-md flex items-center">
                            <div className="p-3 rounded-full bg-blue-500 text-white">
                                <FaUserGraduate size={24} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-800">4</h2>
                                <p className="text-sm text-gray-500">Total Student</p>
                            </div>
                        </div>
                        {/* Card 2: Total Classes */}
                        <div className="bg-white p-5 rounded-lg shadow-md flex items-center">
                            <div className="p-3 rounded-full bg-green-500 text-white">
                                <MdSchool size={24} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-800">4</h2>
                                <p className="text-sm text-gray-500">Total Classes</p>
                            </div>
                        </div>
                        {/* Card 3: Total Teachers */}
                        <div className="bg-white p-5 rounded-lg shadow-md flex items-center">
                            <div className="p-3 rounded-full bg-purple-500 text-white">
                                <FaChalkboardTeacher size={24} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-800">3</h2>
                                <p className="text-sm text-gray-500">Total Teachers</p>
                            </div>
                        </div>
                    </section>

                    {/* Bottom Section: Chart and Data Export */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chart Card */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Monthly Income Analysis</h3>
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="class-id-filter" className="text-sm text-gray-600">Class ID</label>
                                    <select id="class-id-filter" className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="overall">Overall</option>
                                        <option value="class1">Class 1</option>
                                    </select>
                                </div>
                            </div>
                            <ChartPlaceholder />
                        </div>

                        {/* Data Export Cards */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                                <h4 className="font-semibold text-gray-700">Get all students data by Class ID</h4>
                                <select className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Class ID</option>
                                </select>
                                <button className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-semibold">Export Students Data</button>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                                <h4 className="font-semibold text-gray-700">Get all teachers data</h4>
                                <button className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-semibold">Export Teachers Data</button>
                            </div>
                        </div>
                    </section>
                    
                    {/* Admin-only data section */}
                    {user && user.role === 'Admin' && (
                        <section className="mt-6">
                            <AdminData />
                        </section>
                    )}
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

export default DashboardPage;