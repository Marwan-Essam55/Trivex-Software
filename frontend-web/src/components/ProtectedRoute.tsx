import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

interface ProtectedRouteProps {
  allowedRole?: string;
}

export function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    // Check expiration
    if (decoded.exp < currentTime) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }

    // Role check
    if (allowedRole && decoded.role !== allowedRole) {
      // Redirect to appropriate dashboard
      if (decoded.role === 'admin') {
        return <Navigate to="/dashboard/admin" replace />;
      } else {
        return <Navigate to="/dashboard/user" replace />;
      }
    }

    return <Outlet />;
  } catch (err) {
    // Invalid token
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
}
