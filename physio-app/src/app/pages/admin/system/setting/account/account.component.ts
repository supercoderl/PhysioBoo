import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminBreadcrumbComponent } from '../../../../../components/breadcrumb/admin-breadcrumb.component';
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { AdminAccountContactComponent } from "../../../../../components/layout/admin/setting/account/account-contact.componen";
import { AdminAccountDoctorComponent } from "../../../../../components/layout/admin/setting/account/account-doctor.component";
import { AdminAccountEmergencyComponent } from "../../../../../components/layout/admin/setting/account/account-emergency.component";
import { AdminAccountPatientComponent } from '../../../../../components/layout/admin/setting/account/account-patient.component';
import { AdminAccountProfileComponent } from "../../../../../components/layout/admin/setting/account/account-profile.component";
import { UserService } from '../../../../../services/admin/user.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';
import { MyAccount, UpdateMyAccountRequest } from '../../../../../shared/types/account.types';

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
export class SettingAccountComponent implements OnInit {
  private authSrv = inject(AuthService);
  private userSrv = inject(UserService);
  private toastSrv = inject(ToastService);
  private fb = inject(FormBuilder);

  userInfo$ = this.authSrv.userInfo$;
  saving = signal(false);
  loading = signal(false);
  private loaded: MyAccount | null = null;

  // One form for all sections; each section component binds to it via [form].
  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    middleName: ['', Validators.maxLength(100)],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    dateOfBirth: [null as string | null],
    gender: [null as string | null],
    maritalStatus: [null as string | null],
    nationality: ['', Validators.maxLength(100)],
    bloodGroup: [null as string | null],
    email: [{ value: '', disabled: true }],
    phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
    alternatePhone: ['', Validators.maxLength(20)],
    preferredCommunication: [null as string | null],
    identificationType: ['', Validators.maxLength(50)],
    identificationNumber: ['', Validators.maxLength(50)],
    identificationExpiry: [null as string | null],
    emergencyContactName: ['', Validators.maxLength(150)],
    emergencyContactPhone: ['', Validators.maxLength(20)],
    emergencyContactRelationship: ['', Validators.maxLength(50)],
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.userSrv.getMyAccount()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => { if (res.success && res.data) this.fill(res.data); },
        error: () => this.toastSrv.error('Failed to load your account')
      });
  }

  private fill(a: MyAccount): void {
    this.loaded = a;
    this.form.reset({
      firstName: a.firstName,
      middleName: a.middleName ?? '',
      lastName: a.lastName,
      dateOfBirth: a.dateOfBirth,
      gender: a.gender,
      maritalStatus: a.maritalStatus,
      nationality: a.nationality ?? '',
      bloodGroup: a.bloodGroup,
      email: a.email,
      phoneNumber: a.phone,
      alternatePhone: a.alternatePhone ?? '',
      preferredCommunication: a.preferredCommunication,
      identificationType: a.identificationType ?? '',
      identificationNumber: a.identificationNumber ?? '',
      identificationExpiry: a.identificationExpiry ? a.identificationExpiry.slice(0, 10) : null,
      emergencyContactName: a.emergencyContactName ?? '',
      emergencyContactPhone: a.emergencyContactPhone ?? '',
      emergencyContactRelationship: a.emergencyContactRelationship ?? '',
    });
  }

  onSave(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastSrv.error('Please check the highlighted fields');
      return;
    }

    const v = this.form.getRawValue();
    const request: UpdateMyAccountRequest = {
      firstName: v.firstName,
      middleName: v.middleName,
      lastName: v.lastName,
      dateOfBirth: v.dateOfBirth,
      gender: v.gender,
      maritalStatus: v.maritalStatus,
      nationality: v.nationality,
      bloodGroup: v.bloodGroup,
      phone: v.phoneNumber,
      alternatePhone: v.alternatePhone,
      preferredCommunication: v.preferredCommunication,
      identificationType: v.identificationType,
      identificationNumber: v.identificationNumber,
      identificationExpiry: v.identificationExpiry,
      emergencyContactName: v.emergencyContactName,
      emergencyContactPhone: v.emergencyContactPhone,
      emergencyContactRelationship: v.emergencyContactRelationship,
    };

    this.saving.set(true);
    this.userSrv.updateMyAccount(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: res => {
          if (!res.success) { this.toastSrv.error('Unable to update your account'); return; }
          if (res.data) this.fill(res.data);
          this.toastSrv.success('Account updated');
        },
        error: err => this.toastSrv.error(err?.error?.errors?.[0] ?? 'Unable to update your account')
      });
  }

  onCancel(): void {
    if (this.loaded) this.fill(this.loaded);
    this.toastSrv.success('Changes discarded');
  }
}
