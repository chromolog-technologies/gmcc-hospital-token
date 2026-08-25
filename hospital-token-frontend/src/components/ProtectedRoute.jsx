import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute
 * Wraps any route that requires admin authentication.
 * Checks for both a valid token AND a stored hospital session in localStorage.
 * If either is missing, redirects to /login and preserves the intended URL
 * so the user can be sent back after logging in.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  const token = sessionStorage.getItem('token');
  const hospital = sessionStorage.getItem('hospital');

  if (!token || !hospital) {
    // Redirect to login, saving the current path so we can return after auth
    return <Navigate to="/Adminlogin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
