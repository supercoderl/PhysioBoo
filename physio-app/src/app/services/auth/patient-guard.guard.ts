import { isPatient } from '../../shared/utils/role.utils';
import { createRoleGuard } from './role-guard';

/** Patient area (`/patient`): PATIENT only. */
export const patientGuardFn = createRoleGuard(isPatient);
