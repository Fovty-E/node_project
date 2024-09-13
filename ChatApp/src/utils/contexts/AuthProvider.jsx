import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client'

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    userID: null,
    accessToken: null,
    isAuthenticated: false,
  });
  const [socket, setSocket] = useState(null)
  const SOCKET_SERVER_URL = 'http://localhost:8000';
  // Function to refresh access token
  const refreshAccessToken = async () => {
    try {
      const response = await axios.get('/api/refresh-token', { 
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
        },
        withCredentials: true
       });
       if(response.data?.accessToken){
          setAuth({
            userID: response.data.userID,
            accessToken: response.data.accessToken,
            isAuthenticated: true,
          });
          
          console.log(auth)
       }
      
    } catch {
      setAuth({
        userID: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
    return auth.accessToken;
  };

  // On component mount, refresh access token
  useEffect(() => {
    if(auth.isAuthenticated){
      const socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket','polling'], 
        auth: {
        token: auth.accessToken,
        }
      });
      // Save the socket to state
      setSocket(socket);
      socket.on('connect', () => {
        socket.emit('userOnline', auth.userID);
      })
      // socket.on('connect', () => {
      //   console.log('connected')
      // })
    } 

 
  }, [auth]);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth', credentials, { withCredentials: true });
      setAuth({
        userID: response.data.UserDetails.id,
        accessToken: response.data.accessToken,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Login failed' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setAuth({
        accessToken: null,
        isAuthenticated: false,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, socket, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
