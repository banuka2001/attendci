import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Check both localStorage (remember me) and sessionStorage (session only)
                const localStorageUser = localStorage.getItem('user');
                const sessionStorageUser = sessionStorage.getItem('user');
                const storedUser = localStorageUser || sessionStorageUser;
                
                if (storedUser) {
                    // Parse the stored user data
                    const userData = JSON.parse(storedUser);
                    
                    // If data is from localStorage (Remember Me), validate with backend
                    if (localStorageUser) {
                        
                        const response = await fetch('/api/validate-session.php', {
                            method: 'GET',
                            credentials: 'include'
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            if (data.authenticated) {
                                // Session is valid, use fresh user data from server
                                setUser(data.user);
                                navigate('/dashboard'); // Navigate to dashboard after auto-login
                            } else {
                                // Session invalid, clear localStorage
                                localStorage.removeItem('user');
                            }
                        } else {
                            // Server error or session expired, clear localStorage
                            localStorage.removeItem('user');
                        }
                    } else {
                        // If data is from sessionStorage, validate with backend
                        const response = await fetch('/api/validate-session.php', {
                            method: 'GET',
                            credentials: 'include'
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            if (data.authenticated) {
                                // Session is valid, use fresh user data from server
                                setUser(data.user);
                            } else {
                                // Session invalid, clear session storage
                                sessionStorage.removeItem('user');
                            }
                        } else {
                            // Server error or session expired, clear session storage
                            sessionStorage.removeItem('user');
                        }
                    }
                }
            } catch (error) {
                console.error('Session validation failed:', error);
                // Network error, clear both storages to be safe
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
            } finally {
                setIsInitializing(false);
            }
        };
        
        initializeAuth();
    }, []);

    const login = (userData, rememberMe = false) => {
        setUser(userData);
        setIsInitializing(false); // Ensure initialization is complete
        
        // Store user data based on remember me preference
        if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(userData)); // Persistent storage      
        } else {
            sessionStorage.setItem('user', JSON.stringify(userData)); // Session storage
        }
        
        navigate('/dashboard');
    };

    const logout = async () => {
        try {
            // Call backend logout endpoint to invalidate the session
            await fetch('/api/logout', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Include cookies for session management
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with logout even if backend call fails
        } finally {
            setUser(null);
            localStorage.removeItem('user'); // Clear persistent storage
            sessionStorage.removeItem('user'); // Clear session storage
            navigate('/');
        }
    };


    const isAuthenticated = !!user;
    
    console.log('AuthContext - user:', user);
    console.log('AuthContext - isAuthenticated:', isAuthenticated);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isInitializing, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
