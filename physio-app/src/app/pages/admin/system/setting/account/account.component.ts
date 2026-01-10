import { Component } from '@angular/core';
import { AdminBreadcrumbComponent } from '../../../../../components/breadcrumb/admin-breadcrumb.component';
import { BooButtonAdminComponent } from '../../../../../components/button/boo-button-admin/boo-button-admin.component';
import { SharedModule } from '../../../../../shared/shared-imports';
import { AuthService } from '../../../../../services/auth/auth.service';
import { AdminAccountProfileComponent } from "../../../../../components/layout/admin/setting/account/account-profile.component";
import { AdminAccountContactComponent } from "../../../../../components/layout/admin/setting/account/account-contact.componen";
import { AdminAccountEmergencyComponent } from "../../../../../components/layout/admin/setting/account/account-emergency.component";
import { AdminAccountDoctorComponent } from "../../../../../components/layout/admin/setting/account/account-doctor.component";
import { AdminAccountPatientComponent } from '../../../../../components/layout/admin/setting/account/account-patient.component';

@Component({
  selector: 'setting-account',
  standalone: true,
  imports: [
    AdminBreadcrumbComponent,
    BooButtonAdminComponent,
    SharedModule,
    AdminAccountProfileComponent,
    AdminAccountContactComponent,
    AdminAccountEmergencyComponent,
    AdminAccountDoctorComponent,
    AdminAccountPatientComponent
],
  templateUrl: './account.component.html'
})
export class SettingAccountComponent {
  // #region Inputs, Outputs, Properties
  userInfo$ = this.authSrv.userInfo$;
  userType: 'EMPLOYEE' | 'PATIENT' = 'PATIENT';
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    private authSrv: AuthService
  ) {

  }
  // #endregion
}
