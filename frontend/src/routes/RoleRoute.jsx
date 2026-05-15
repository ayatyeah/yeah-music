import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function RoleRoute({ children, role, redirectTo = '/' }) {
  const { user } = useAuthStore();

  if (role && user?.role !== role) return <Navigate to={redirectTo} replace />;

  return children;
}
