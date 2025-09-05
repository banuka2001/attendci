import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage'; // Import the new page
import HomePage from './pages/HomePage/HomePage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './components/context/AuthContext';


import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;