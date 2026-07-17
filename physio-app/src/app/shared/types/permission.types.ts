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
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateRoleRequest {
  id: string;
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

export interface AssignPermissionRequest {
  roleId: string;
  permissionId: string;
}
