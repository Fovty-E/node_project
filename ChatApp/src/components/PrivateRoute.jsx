import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../utils/contexts/AuthProvider';
import io from 'socket.io-client'

export const PrivateRoute = ({ children }) => {
  const { auth, refreshAccessToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null)
  const SOCKET_SERVER_URL = 'http://localhost:8000';

  useEffect(() => {
    // Check if the user is authenticated or refresh the token
    const checkAuth = async () => {
      if (!auth.isAuthenticated) {
        try {
          await refreshAccessToken(); // Try to refresh the access token if not authenticated
        } catch (error) {
          console.log('User is not authenticated', error);
        }
      }
 
      setLoading(false); // Mark loading as complete
    };

    checkAuth();
  }, [auth.isAuthenticated, refreshAccessToken]);

  // If loading, display a loading indicator (or return null to prevent render)
  if (loading) return <div>Loading...</div>;

  // Once loading is done, check authentication status
  return auth.isAuthenticated ? children : <Navigate to="/login" />;
};
