import React from 'react';
import { FaUserGraduate, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

const StudentDashboard = () => {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4">
                    <FaUserGraduate className="text-blue-500 text-4xl" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Student Dashboard</h2>
                        <p className="text-gray-600">Welcome to your attendance management portal</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Classes</p>
                            <p className="text-2xl font-bold text-gray-900">12</p>
                        </div>
                        <FaCalendarAlt className="text-blue-500 text-2xl" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                            <p className="text-2xl font-bold text-green-600">85%</p>
                        </div>
                        <FaChartLine className="text-green-500 text-2xl" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">This Month</p>
                            <p className="text-2xl font-bold text-purple-600">18/20</p>
                        </div>
                        <FaUserGraduate className="text-purple-500 text-2xl" />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Attended Mathematics class - Today</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Attended Physics class - Yesterday</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Late arrival - Chemistry class</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
