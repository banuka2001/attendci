import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaBook, FaUser, FaMoneyBillWave, FaCalendar } from 'react-icons/fa';
import axios from 'axios';

const MyClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudentClasses();
    }, []);

    const fetchStudentClasses = async () => {
        try {
            const response = await axios.get('/api/get_student_classes.php', {
                withCredentials: true
            });
            
            if (response.data.success) {
                setClasses(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Error fetching student classes:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
            

                {/* Classes List */}
                {classes.length > 0 ? (
                    <div className="space-y-4">
                        {classes.map((classItem) => (
                            <div 
                                key={`${classItem.ClassID}-${classItem.RegisterDate}`}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                            >
                                {/* Mobile/Small Screen Layout - Vertical Card */}
                                <div className="block md:hidden p-6">
                                    {/* Class Name Header */}
                                    <div className="mb-4 pb-3 border-b border-gray-200">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                                            {classItem.ClassName || 'Class Name'}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Class ID: {classItem.ClassID}
                                        </p>
                                    </div>

                                    {/* Class Details */}
                                    <div className="space-y-3">
                                        {/* Subject */}
                                        <div className="flex items-start">
                                            <FaBook className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Subject</p>
                                                <p className="text-base font-medium text-gray-800">
                                                    {classItem.ClassSubject || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Teacher */}
                                        <div className="flex items-start">
                                            <FaUser className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Teacher</p>
                                                <p className="text-base font-medium text-gray-800">
                                                    {classItem.FirstName || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-start">
                                            <FaMoneyBillWave className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                                                <p className="text-base font-semibold text-gray-800">
                                                    Rs. {classItem.ClassPrice || '0'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Register Date */}
                                        <div className="flex items-start">
                                            <FaCalendar className="text-purple-500 mt-1 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Register Date</p>
                                                <p className="text-base font-medium text-gray-800">
                                                    {formatDate(classItem.RegisterDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tablet/Desktop Layout - Horizontal */}
                                <div className="hidden md:block p-6">
                                    {/* Class Name Header */}
                                    <div className="mb-4 pb-3 border-b border-gray-200">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                                            {classItem.ClassName || 'Class Name'}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Class ID: {classItem.ClassID}
                                        </p>
                                    </div>

                                    {/* Class Details - Horizontal Layout */}
                                    <div className="grid grid-cols-4 gap-6">
                                        {/* Subject */}
                                        <div className="flex items-center">
                                            <FaBook className="text-blue-500 mr-3 flex-shrink-0 text-xl" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Subject</p>
                                                <p className="text-base font-medium text-gray-800">
                                                    {classItem.ClassSubject || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Teacher */}
                                        <div className="flex items-center">
                                            <FaUser className="text-green-500 mr-3 flex-shrink-0 text-xl" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Teacher</p>
                                                <p className="text-base font-medium text-gray-800">
                                                    {classItem.FirstName || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center">
                                            <FaMoneyBillWave className="text-yellow-500 mr-3 flex-shrink-0 text-xl" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Price</p>
                                                <p className="text-base font-semibold text-gray-800">
                                                    Rs. {classItem.ClassPrice || '0'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Register Date */}
                                        <div className="flex items-center">
                                            <FaCalendar className="text-purple-500 mr-3 flex-shrink-0 text-xl" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">RegisterDate</p>
                                                <p className="text-base font-medium text-gray-800">
                                                    {formatDate(classItem.RegisterDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Classes Enrolled</h3>
                        <p className="text-gray-500">You haven't enrolled in any classes yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyClasses;

