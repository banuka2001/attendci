import axios from 'axios';

import React, { useState } from 'react';
// router dom for navigation
import { Link, useNavigate } from 'react-router-dom';  
import logo from '../../assets/attt-whitelogo-02.png'; 
import backgroundImage from '../../assets/background.PNG';
import userIcon from '../../assets/user-icon.PNG';
import passwordIcon from '../../assets/pw-icon.PNG';
import { useAuth } from '../../components/context/AuthContext';


const LoginPage = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // State to hold the message
  const [messageType, setMessageType] = useState(''); // 'success' or 'error' for the message display area color
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");


  const handleLogin = async (event) => {
    event.preventDefault();

    try {
 
      const {data} = await axios.post('/api/get_login.php' , {
        username,
        password
      });

      setMessage(data.message); // Set the message from the API response

      if (data.success) {
        setMessageType('success');
        // On successful login, call the login function after a 1 second of delay
        setTimeout(() => {
          login({ username: data.username, role: data.role }); 
        }, 1000); // 1-second delay to show the success message
      } else {
        setMessageType('error');
      }
    } catch (error) {

      console.error('Login error:', error);
      setMessageType('error');

      if(error.response) {
        // catch Server error
       setMessage(error.response.data.message || 'Server error occured');
      } else {
        // catch a network error
        setMessage('An error occured during login');
      }

      
  }

}

const handleForgotSubmit = async (e) => {
  e.preventDefault();
  setForgotMsg("");
  
  // Frontend validation
  const trimmedEmail = forgotEmail.trim();
  
  if (!trimmedEmail) {
    setForgotMsg("Email is required.");
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    setForgotMsg("Please enter a valid email address.");
    return;
  }
  
  try {
    const res = await fetch("/api/forgot_password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: trimmedEmail }),
    });
    const data = await res.json();
    
    if (data.success) {
      setForgotMsg(data.message);
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password');
      }, 2000);
    } else {
      setForgotMsg(data.message || "Failed to send reset code.");
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    setForgotMsg("Network error. Please try again later.");
  }
};

  return (
    // Main container: Stacks vertically by default, becomes a row on medium screens
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      
      {/* Left Panel (Branding): Full width on small screens, half on medium+ */}
      <div 
        className="w-full md:w-1/2 text-white flex flex-col items-center justify-center p-12 text-center bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), url(${backgroundImage})` }}
        // background image is setted 90% opacity with a white overlay and a linear gradient
      >
        <div className="max-w-md">
          <div className="flex flex-col items-center justify-center mb-6">
            {/* logo */}
            <img className="h-80 w-80 " src={logo} alt="ATTENDCI Logo" />
            {/* title */}
          <h2 className="text-3xl font-semibold font-sans -mt-25">Streamline Your Student Attendance</h2>
           
          </div>

          
        </div>
      </div>

      {/* Right Panel (Login Form): Full width on small screens, half on medium+ */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gray-100">
        <div className="w-full max-w-md">
          {/* Login form */}
          <div className="p-8 space-y-6">
            {/* Message display area for the message from the API -> success or error */}
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

            <h2 className="text-2xl font-bold text-center text-gray-800">User Login</h2> 
            {/* login form */}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  {/* user icon */}
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

              {/* Password input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  {/* password icon */}
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

              {/* Remember Me toggle */}
              <div className="flex items-center">
                <label
                  htmlFor="remember-me"
                  className="flex items-center cursor-pointer"
                >
                  <div className="relative">
                    <input id="remember-me" type="checkbox" className="sr-only peer" />
                    <div className="w-14 h-8 bg-[#a6a6a6] rounded-full peer-checked:bg-[#2285cc] transition-colors duration-300 ease-in-out"></div>
                    <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ease-in-out transform peer-checked:translate-x-6"></div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700 font-sans">Remember Me</span>
                </label>
              </div>


              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#2285cc] to-[#004aad] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out font-sans"
                >
                  Login
                </button>
              </div>
            </form>

            {/* Forgot Password section */}
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-blue-600 underline bg-transparent border-none cursor-pointer"
                onClick={() => setShowForgot(!showForgot)}
              >
                Forgot Password?
              </button>
              {showForgot && (
                <form onSubmit={handleForgotSubmit} className="mt-2 flex flex-col items-center">
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="p-2 border border-gray-300 rounded mb-2 w-full"
                  />
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                    Send Reset Link
                  </button>
                  {forgotMsg && (
                    <div className="mt-2 text-sm text-green-700">{forgotMsg}</div>
                  )}
                </form>
              )}
            </div>

            {/* Registration link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Register
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

export default LoginPage;
