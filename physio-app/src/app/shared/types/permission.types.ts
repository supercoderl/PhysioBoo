export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string | null;
  category: string;
  isActive: boolean;
  createdAt?: Date | string | null;
}

export interface CreatePermissionRequest {
  name: string;
  code: string;
  description?: string | null;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  isSystemRole?: boolean;
}

export interface AssignRoleRequest {
  userId: string;
  roleId: string;
}

/** Grants permissions to a role. `permissions` maps a permission code to whether it is granted. */
export interface AssignPermissionsRequest {
  roleId: string;
  permissions: Record<string, boolean>;
}

export interface RevokePermissionRequest {
  roleId: string;
  permissionId: string;
}
