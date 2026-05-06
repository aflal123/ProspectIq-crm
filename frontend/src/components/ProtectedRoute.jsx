import { Navigate } from 'react-router-dom';

// This wraps any page that requires login.
// If there's no token in localStorage → redirect to /login
// If there IS a token → show the actual page
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
