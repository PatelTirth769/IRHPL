import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};
export default PublicRoute;
