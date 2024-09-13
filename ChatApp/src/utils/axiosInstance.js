// src/api/axiosInstance.js
import axios from 'axios';
import { AuthContext } from './contexts/AuthProvider';
import { useContext } from 'react';

const useAxios = () => {
  const { auth, setAuth, refreshAccessToken } = useContext(AuthContext);

  const axiosInstance = axios.create({
    baseURL: '/api',
    withCredentials: true,
  });

  // Request interceptor to add access token to headers
  axiosInstance.interceptors.request.use(
    (config) => {
      if (auth.accessToken) {
        config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log('retrying...')
        try {
          const newToken = await refreshAccessToken();
          console.log(newToken)
          // Update the auth context with the new token
          setAuth((prev) => ({
            ...prev,
            accessToken: newToken,
          }));

          // Set new token in original request headers
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          // Retry the original request with the new token
          return axiosInstance(originalRequest);
        } catch (error) {
          return Promise.reject(tokenError);
        }
        
        
        return axiosInstance(originalRequest);
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxios;
