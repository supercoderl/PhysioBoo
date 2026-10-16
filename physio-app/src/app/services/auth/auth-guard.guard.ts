import { isStaff } from '../../shared/utils/role.utils';
import { createRoleGuard } from './role-guard';

/** Tenant workspace (`/admin`): staff roles only. PATIENT and a SUPER_ADMIN without a staff role get 403. */
export const authGuardFn = createRoleGuard(isStaff);
