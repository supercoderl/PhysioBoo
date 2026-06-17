import { Component, inject, signal } from '@angular/core';
import { AdminBreadcrumbComponent } from '../../../../../components/breadcrumb/admin-breadcrumb.component';
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { AdminAccountContactComponent } from "../../../../../components/layout/admin/setting/account/account-contact.componen";
import { AdminAccountDoctorComponent } from "../../../../../components/layout/admin/setting/account/account-doctor.component";
import { AdminAccountEmergencyComponent } from "../../../../../components/layout/admin/setting/account/account-emergency.component";
import { AdminAccountPatientComponent } from '../../../../../components/layout/admin/setting/account/account-patient.component';
import { AdminAccountProfileComponent } from "../../../../../components/layout/admin/setting/account/account-profile.component";
import { AuthService } from '../../../../../services/auth/auth.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';

@Component({
  selector: 'setting-account',
  standalone: true,
  imports: [
    SharedModule,
    AdminBreadcrumbComponent,
    BooIconComponent,
    AdminAccountProfileComponent,
    AdminAccountContactComponent,
    AdminAccountEmergencyComponent,
    AdminAccountDoctorComponent,
    AdminAccountPatientComponent
  ],
  templateUrl: './account.component.html'
})
export class SettingAccountComponent {
  private authSrv = inject(AuthService);
  private toastSrv = inject(ToastService);

  userInfo$ = this.authSrv.userInfo$;
  saving = signal(false);

  onSave(): void {
    if (this.saving()) return;
    this.saving.set(true);
    // TODO: PUT /api/users/me with the assembled profile/contact/emergency/role-specific payloads
    setTimeout(() => {
      this.saving.set(false);
      this.toastSrv.success('Account updated');
    }, 500);
  }

  onCancel(): void {
    // TODO: reset child forms via a shared form group, or re-fetch profile to refresh fields
    this.toastSrv.success('Changes discarded');
  }
}
