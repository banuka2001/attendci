import React, { useState, useEffect } from 'react';
import { FaUser, FaQrcode, FaGraduationCap, FaCreditCard } from 'react-icons/fa';
import axios from 'axios';

const StudentDashboard = () => {
    const [studentData, setStudentData] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudentData();
        fetchPaymentHistory();
    }, []);

    const fetchStudentData = async () => {
        try {
            const response = await axios.get('/api/get_student_profile.php', {
                withCredentials: true
            });
            
            if (response.data.success) {
                setStudentData(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Error fetching student data:', err);
        }
    };

    const fetchPaymentHistory = async () => {
        try {
            const response = await axios.get('/api/get_payment_history.php', {
                withCredentials: true
            });
            
            if (response.data.success) {
                setPaymentHistory(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching payment history:', err);
        } finally {
            setLoading(false);
        }
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-600">No student data found</p>
            </div>
        );
    }

    const { profile, enrolled_classes_count } = studentData;

    return (
        <div className="min-h-screen flex pt-5 justify-center">
            <div className="w-full max-w-7xl px-6">

                {/* Dashboard Cards Grid - Mobile Layout */}
                <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-5">
                    
                    {/* Student Details Card - Full width on mobile, spans 2 columns on desktop */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <FaUser className="mr-2 text-blue-500" />
                            Student Details
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-10">
                            {/* Profile Picture - Larger size */}
                            <div className="flex items-center justify-center">
                                <img 
                                    src={`/api/${profile.PhotoPath}`} 
                                    alt="Student Photo" 
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-2 border-gray-200"
                                />
                            </div>
                            
                            {/* Student Information */}
                            <div className="flex items-center justify-center">
                                <div className="space-y-3 text-base text-start sm:text-left">
                                    <div>
                                        <span className="font-medium text-gray-600">Name :</span>
                                        <span className="ml-2 text-gray-800">{profile.FirstName} {profile.LastName}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Student ID :</span>
                                        <span className="ml-2 text-gray-800">{profile.studentID}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Email :</span>
                                        <span className="ml-2 text-gray-800">{profile.Email}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Contact Num :</span>
                                        <span className="ml-2 text-gray-800">{profile.ContactNum}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Row - QR Code and Enrolled Classes */}
                    <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-5 lg:contents">
                        {/* QR Code Card */}
                        <div className="bg-white rounded-2xl shadow-md p-3 sm:p-5 flex flex-col h-48 sm:h-65">
                            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4 flex items-center">
                                <FaQrcode className="mr-2 text-blue-500 text-sm sm:text-lg" />
                                QR Code
                            </h3>
                            <div className="flex justify-center items-center flex-1">
                                {profile.QRPath ? (
                                    <img 
                                        src={`/api/${profile.QRPath}`} 
                                        alt="Student QR Code" 
                                        className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain"
                                    />
                                ) : (
                                    <div className="text-gray-400 text-center">
                                        <FaQrcode className="text-2xl sm:text-3xl lg:text-4xl mx-auto mb-1 sm:mb-2" />
                                        <p className="text-xs sm:text-sm">QR Code not available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enrolled Classes Card */}
                        <div className="bg-white rounded-2xl shadow-md p-3 sm:p-5 flex items-center justify-center h-48 sm:h-65">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">
                                    {enrolled_classes_count}
                                </div>
                                <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Enrolled Classes</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment History Card - Full width on mobile, spans 2 columns on desktop */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <FaCreditCard className="mr-2 text-blue-500" />
                            Payment History
                        </h3>
                        <div className="space-y-3">
                            {paymentHistory.length > 0 ? (
                                paymentHistory.map((payment, index) => (
                                    <div key={payment.PaymentID} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg gap-x-2">
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {payment.ClassName || 'Class Payment'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {payment.Month} {payment.Year}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                                Rs.{payment.Amount}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(payment.PaymentDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <FaCreditCard className="text-3xl mx-auto mb-3" />
                                    <p className="text-base">No payment history available</p>
                                </div>
                            )}
                        </div>
                    </div>
            </div>
        </div>
        </div>
    );
};

export default StudentDashboard;
