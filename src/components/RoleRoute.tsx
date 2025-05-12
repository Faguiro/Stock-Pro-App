import type { JSX } from 'react';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../pages/AccessDenied';
import { Navigate } from 'react-router-dom';

type RoleRouteProps = {
  roles: string[];
  children: JSX.Element;
};

export default function RoleRoute({ roles, children }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <AccessDenied />;
  }

  return children;
}
