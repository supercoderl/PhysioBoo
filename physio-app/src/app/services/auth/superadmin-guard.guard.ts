import { isSuperAdmin } from '../../shared/utils/role.utils';
import { createRoleGuard } from './role-guard';

/** Platform console (`/superadmin`): SUPER_ADMIN only. */
export const superadminGuardFn = createRoleGuard(isSuperAdmin);
