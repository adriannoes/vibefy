import React from 'react';
import { AppRole } from '@/types/user';
import { useUserRole } from '@/hooks/useUserRole';
import { hasPermission } from '@/lib/permissions';

interface RoleGateProps {
  children: React.ReactNode;
  permission: keyof typeof import('@/lib/permissions').PERMISSIONS;
  projectId?: string;
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  children,
  permission,
  projectId,
  fallback = null,
}) => {
  const { userRole, loading } = useUserRole(projectId);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!userRole || !hasPermission(userRole, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
