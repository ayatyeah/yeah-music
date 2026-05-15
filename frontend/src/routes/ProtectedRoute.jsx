import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  return children;
}
