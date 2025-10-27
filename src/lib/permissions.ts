import { AppRole } from '@/types/user';

export const PERMISSIONS = {
  // Project permissions
  PROJECT_CREATE: ['admin', 'product_manager'] as AppRole[],
  PROJECT_UPDATE: ['admin', 'product_manager'] as AppRole[],
  PROJECT_DELETE: ['admin'] as AppRole[],
  PROJECT_VIEW: ['admin', 'product_manager', 'developer', 'viewer'] as AppRole[],

  // Issue permissions
  ISSUE_CREATE: ['admin', 'product_manager', 'developer'] as AppRole[],
  ISSUE_UPDATE: ['admin', 'product_manager', 'developer'] as AppRole[],
  ISSUE_DELETE: ['admin', 'product_manager'] as AppRole[],
  ISSUE_VIEW: ['admin', 'product_manager', 'developer', 'viewer'] as AppRole[],

  // Sprint permissions
  SPRINT_CREATE: ['admin', 'product_manager'] as AppRole[],
  SPRINT_UPDATE: ['admin', 'product_manager'] as AppRole[],
  SPRINT_DELETE: ['admin'] as AppRole[],
  SPRINT_VIEW: ['admin', 'product_manager', 'developer', 'viewer'] as AppRole[],

  // User management permissions
  USER_MANAGE: ['admin'] as AppRole[],
  ROLE_ASSIGN: ['admin'] as AppRole[],
} as const;

export const hasPermission = (userRole: AppRole, permission: keyof typeof PERMISSIONS): boolean => {
  return PERMISSIONS[permission].includes(userRole);
};

export const canAccessProject = (userRole: AppRole, action: 'view' | 'edit' | 'delete'): boolean => {
  switch (action) {
    case 'view':
      return hasPermission(userRole, 'PROJECT_VIEW');
    case 'edit':
      return hasPermission(userRole, 'PROJECT_UPDATE');
    case 'delete':
      return hasPermission(userRole, 'PROJECT_DELETE');
    default:
      return false;
  }
};

export const canAccessIssue = (userRole: AppRole, action: 'view' | 'edit' | 'delete'): boolean => {
  switch (action) {
    case 'view':
      return hasPermission(userRole, 'ISSUE_VIEW');
    case 'edit':
      return hasPermission(userRole, 'ISSUE_UPDATE');
    case 'delete':
      return hasPermission(userRole, 'ISSUE_DELETE');
    default:
      return false;
  }
};

export const canAccessSprint = (userRole: AppRole, action: 'view' | 'edit' | 'delete'): boolean => {
  switch (action) {
    case 'view':
      return hasPermission(userRole, 'SPRINT_VIEW');
    case 'edit':
      return hasPermission(userRole, 'SPRINT_UPDATE');
    case 'delete':
      return hasPermission(userRole, 'SPRINT_DELETE');
    default:
      return false;
  }
};
