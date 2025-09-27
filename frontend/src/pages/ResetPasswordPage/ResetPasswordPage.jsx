import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/attt-whitelogo-02.png';
import backgroundImage from '../../assets/background.PNG';
import passwordIcon from '../../assets/pw-icon.PNG';

const ResetPasswordPage = () => {
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Frontend validation
    if (!resetCode.trim()) {
      setMessage('Reset code is required.');
      setMessageType('error');
      return;
    }
    
    if (resetCode.length !== 6 || !/^\d{6}$/.test(resetCode)) {
      setMessage('Please enter a valid 6-digit reset code.');
      setMessageType('error');
      return;
    }
    
    if (!newPassword.trim()) {
      setMessage('New password is required.');
      setMessageType('error');
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setMessageType('error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('Attempting to reset password with:', {
        resetCode: resetCode,
        newPassword: '***', // Don't log actual password
        confirmPassword: '***'
      });

      const response = await fetch('/api/reset_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetCode: resetCode,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setMessageType('success');
        setMessage(data.message);
        
        // Redirect to login page after successful password reset
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessageType('error');
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      setMessageType('error');
      if (error.message.includes('HTTP error')) {
        setMessage(`Server error: ${error.message}`);
      } else if (error.message.includes('NetworkError')) {
        setMessage('Network error: Unable to connect to the server. Please check your internet connection.');
      } else {
        setMessage(`Error: ${error.message || 'Network error. Please try again later.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Panel (Branding) */}
      <div 
        className="w-full md:w-1/2 text-white flex flex-col items-center justify-center p-12 text-center bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), url(${backgroundImage})` }}
      >
        <div className="max-w-md">
          <div className="flex flex-col items-center justify-center mb-6">
            <img className="h-80 w-80" src={logo} alt="ATTENDCI Logo" />
            <h2 className="text-3xl font-semibold font-sans -mt-25">Streamline Your Student Attendance</h2>
          </div>
        </div>
      </div>

      {/* Right Panel (Reset Password Form) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gray-100">
        <div className="w-full max-w-md">
          <div className="p-8 space-y-6">
            {/* Message display area */}
            {message && (
              <div
                className={`p-4 mb-4 text-sm rounded-lg ${
                  messageType === 'success'
                    ? 'text-green-700 bg-green-100'
                    : 'text-red-700 bg-red-100'
                }`}
                role="alert"
              >
                {message}
              </div>
            )}

            <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password</h2>
            <p className="text-center text-gray-600">Enter the reset code sent to your email and create a new password.</p>

            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Reset Code Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="text-gray-500">🔢</span>
                </div>
                <input
                  id="resetCode"
                  type="text"
                  placeholder="Enter 6-digit reset code"
                  value={resetCode}
                  onChange={(e) => {
                    // Only allow numbers and limit to 6 digits
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 6) {
                      setResetCode(value);
                    }
                  }}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[#2285cc] rounded-full bg-[#f4f9ff] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                />
              </div>

              {/* New Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <img src={passwordIcon} alt="Password Icon" className="w-5 h-5" />
                </div>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 border border-[#2285cc] rounded-full bg-[#f4f9ff] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                />
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <img src={passwordIcon} alt="Password Icon" className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 border border-[#2285cc] rounded-full bg-[#f4f9ff] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                />
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#2285cc] to-[#004aad] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>

            {/* Back to Login link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-gray-500">
            Powered by AKAI CODEX
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
