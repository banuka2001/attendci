import axios from 'axios';
import React, { useState } from 'react';

// This line elegantly handles both development and production
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/attt-whitelogo-02.png'; 
import backgroundImage from '../../assets/background.PNG';
import userIcon from '../../assets/user-icon.PNG';
import passwordIcon from '../../assets/pw-icon.PNG';
// You might need an email icon, let's reuse the user icon for now or create a new one.
// import emailIcon from '../../assets/email-icon.PNG'; 

const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }
    try {
      const { data } = await axios.post(`${API_BASE}/set_registration.php`, {
        username,
        email,
        password,
      });
      setMessage(data.message);
      if (data.success) {
        setMessageType('success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessageType('error');
      }
    } catch (error) {
      setMessageType('error');
      console.error('Registration error:', error);
      if (error.response) {
        setMessage(error.response.data.message || 'Server error occurred');
      } else {
        setMessage('An error occurred during registration');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <div
        className="w-full md:w-1/2 text-white flex flex-col items-center justify-center p-12 text-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), url(${backgroundImage})`,
        }}
      >
        <div className="max-w-md">
          <div className="flex flex-col items-center justify-center mb-6">
            <img className="h-80 w-80" src={logo} alt="ATTENDCI Logo" />
            <h2 className="text-3xl font-semibold font-sans -mt-25">Streamline Your Student Attendance</h2>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gray-100">
        <div className="w-full max-w-md">
          <div className="p-8 space-y-6">
            {message && (
              <div
                className={`p-4 mb-4 text-sm rounded-lg ${
                  messageType === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                }`}
                role="alert"
              >
                {message}
              </div>
            )}

            <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Username Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <img src={userIcon} alt="User Icon" className="w-5 h-5" />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[#2285cc] rounded-full bg-[#f4f9ff] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  {/* Using user icon for email, replace if you have an email icon */}
                  <img src={userIcon} alt="Email Icon" className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[#2285cc] rounded-full bg-[#f4f9ff] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <img src={passwordIcon} alt="Password Icon" className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[#2285cc] rounded-full bg-[#f4f9ff] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                />
              </div>
              
              {/* Confirm Password input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <img src={passwordIcon} alt="Password Icon" className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[#2285cc] rounded-full bg-[#f4f9ff] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                />
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#2285cc] to-[#004aad] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out font-sans"
                >
                  Register
                </button>
              </div>
            </form>

            {/* Login link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Login
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

export default RegistrationPage;
