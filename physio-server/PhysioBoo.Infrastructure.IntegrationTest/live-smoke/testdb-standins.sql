-- TEST-ONLY stand-ins for database functions whose real definitions are NOT in the repository.
-- Derived solely from the C# callers (names, parameters, columns read). NOT the production definitions.
-- Applied only to the disposable integration database; never to the development database.
CREATE OR REPLACE FUNCTION get_owner_permission_codes(p_user_id uuid)
RETURNS TABLE ("Code" text) LANGUAGE sql STABLE AS $$
  SELECT DISTINCT p."Code"::text
  FROM "UserRoles" ur
  JOIN "RolePermissions" rp ON rp."RoleId" = ur."RoleId" AND rp."DeletedAt" IS NULL
  JOIN "Permissions" p ON p."Id" = rp."PermissionId" AND p."DeletedAt" IS NULL
  WHERE ur."UserId" = p_user_id
$$;
CREATE OR REPLACE FUNCTION get_permissionid_by_roleid(p_role_id uuid)
RETURNS TABLE ("PermissionsId" uuid) LANGUAGE sql STABLE AS $$
  SELECT rp."PermissionId" FROM "RolePermissions" rp WHERE rp."RoleId" = p_role_id AND rp."DeletedAt" IS NULL
$$;
CREATE OR REPLACE FUNCTION get_by_role_and_permission_id(p_role_id uuid, p_permission_id uuid)
RETURNS TABLE ("Id" uuid, "RoleId" uuid, "PermissionId" uuid) LANGUAGE sql STABLE AS $$
  SELECT rp."Id", rp."RoleId", rp."PermissionId" FROM "RolePermissions" rp
  WHERE rp."RoleId" = p_role_id AND rp."PermissionId" = p_permission_id AND rp."DeletedAt" IS NULL
$$;
