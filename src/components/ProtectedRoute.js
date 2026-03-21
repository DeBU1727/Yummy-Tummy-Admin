import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // Helper to decode roles from JWT
  const isAdmin = (token) => {
    if (!token) return false;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const roles = JSON.parse(jsonPayload).roles || [];
        return roles.includes('ROLE_ADMIN');
    } catch (e) {
        return false;
    }
  };

  return token && isAdmin(token) ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
