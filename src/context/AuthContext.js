import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_URL}/me`, {
        credentials: 'include' // CRITICAL: Include cookies for authentication
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.loggedIn) {
          // Backend returns email and user_id directly in response
          setUser({
            email: data.email,
            user_id: data.user_id
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${config.API_URL}/logout`, {
        method: 'POST',
        credentials: 'include' // CRITICAL: Include cookies for logout
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

