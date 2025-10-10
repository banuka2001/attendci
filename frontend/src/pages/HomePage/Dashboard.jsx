import React, { useState, useEffect } from 'react';
import { MdSchool } from 'react-icons/md';
import { FaUserGraduate, FaChalkboardTeacher, FaRegChartBar } from 'react-icons/fa';
import { useAuth } from '../../components/context/AuthContext';
import axios from 'axios';

// This line elegantly handles both development and production
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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
                const response = await axios.get(`${API_BASE}/admin_only.php`);
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


// Dashboard-specific content component
const DashboardHomePage = () => {
    const { user } = useAuth();
    return (
        <>
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
        </>
    );
};

export default DashboardHomePage;
