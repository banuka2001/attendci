import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCalendar, FaHashtag, FaCreditCard } from 'react-icons/fa';
import axios from 'axios';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            const response = await axios.get('/api/get_payment_history.php?all=true', {
                withCredentials: true
            });
            
            if (response.data.success) {
                setPayments(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Error fetching payment history:', err);
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
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `Rs. ${amount ? amount.toLocaleString() : '0'}`;
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

                {/* Payment Content */}
                {payments.length > 0 ? (
                    <>
                        {/* Desktop/Tablet Table View */}
                        <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Payment ID
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Class ID
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Year
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Month
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Class Fees
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Payment Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payments.map((payment) => (
                                            <tr 
                                                key={payment.PaymentID}
                                                className="hover:bg-gray-50 transition-colors duration-200"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {payment.PaymentID}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{payment.ClassID != null && payment.ClassID !== '' ? payment.ClassID : 'N/A'}</div>
                                                    {payment.ClassName && (
                                                        <div className="text-xs text-gray-500">{payment.ClassName}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{payment.Year != null && payment.Year !== '' ? payment.Year : 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{payment.Month != null && payment.Month !== '' ? payment.Month : 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-green-600">
                                                        {formatCurrency(payment.Amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(payment.PaymentDate)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden space-y-4">
                            {payments.map((payment) => (
                                <div 
                                    key={payment.PaymentID}
                                    className="bg-white rounded-xl shadow-md p-6"
                                >
                                    {/* Payment ID Header */}
                                    <div className="mb-4 pb-3 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-gray-800">
                                                Payment #{payment.PaymentID}
                                            </h3>
                                            <span className="text-lg font-semibold text-green-600">
                                                {formatCurrency(payment.Amount)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="space-y-3">
                                        {/* Class ID */}
                                        <div className="flex items-start">
                                            <FaHashtag className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Class ID</p>
                                                <p className="text-base font-medium text-gray-800">
                                                    {payment.ClassID != null && payment.ClassID !== '' ? payment.ClassID : 'N/A'}
                                                </p>
                                                {payment.ClassName && (
                                                    <p className="text-sm text-gray-600 mt-1">{payment.ClassName}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Year and Month */}
                                        <div className="flex items-start">
                                            <FaCalendar className="text-purple-500 mt-1 mr-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Period</p>
                                                <p className="text-base font-medium text-gray-800">
                                                    {payment.Month != null && payment.Month !== '' ? payment.Month : 'N/A'} {payment.Year != null && payment.Year !== '' ? payment.Year : ''}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment Date */}
                                        <div className="flex items-start">
                                            <FaCreditCard className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Date</p>
                                                <p className="text-base font-medium text-gray-800">
                                                    {formatDate(payment.PaymentDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Payment History</h3>
                        <p className="text-gray-500">You don't have any payment records yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payments;

