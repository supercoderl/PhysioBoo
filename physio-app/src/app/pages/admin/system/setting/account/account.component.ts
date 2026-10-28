import { Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BooInputComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { finalize } from 'rxjs';
import { BooDatepickerComponent } from '../../../../../components/date-picker/boo-date-picker.component';
import { SettingPageComponent } from '../../../../../components/layout/admin/setting/shared/setting-page.component';
import { SettingSectionComponent } from '../../../../../components/layout/admin/setting/shared/setting-section.component';
import { BooSelectComponent } from '../../../../../components/select/boo-select/boo-select.component';
import { UserService } from '../../../../../services/admin/user.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { BloodGroup } from '../../../../../shared/enums/blood-group';
import { Gender } from '../../../../../shared/enums/gender';
import { MaritalStatus } from '../../../../../shared/enums/marital-status';
import { PreferredCommunication } from '../../../../../shared/enums/preferred-communication';
import { SharedModule } from '../../../../../shared/shared-imports';
import { MyAccount, UpdateMyAccountRequest } from '../../../../../shared/types/account.types';

/** "PreferNotToSay" → "Prefer not to say", "O_Positive" → "O+". The value stays the enum name the API expects. */
function enumOptions(enumObj: object, label: (name: string) => string = humanize): { label: string; value: string }[] {
  return Object.keys(enumObj).filter(key => isNaN(Number(key))).map(key => ({ label: label(key), value: key }));
}

function humanize(name: string): string {
  const words = name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function bloodGroupLabel(name: string): string {
  return name.replace('_Positive', '+').replace('_Negative', '−');
}

/** The API sends dates as ISO date-times; the date pickers work with `yyyy-MM-dd`. */
function dateOnly(value: string | null | undefined): string | null {
  return value ? value.slice(0, 10) : null;
}

/**
 * Settings > Account: the signed-in user's own personal, contact, identification and emergency-contact details
 * (GET/PUT /api/users/me/account). Email is the sign-in identity and is shown read-only.
 * `/admin/profile/general` is the read-only overview that links here for edits.
 */
@Component({
  selector: 'setting-account',
  standalone: true,
  imports: [
    SharedModule,
    SettingPageComponent,
    SettingSectionComponent,
    BooInputComponent,
    BooSelectComponent,
    BooDatepickerComponent,
    BooStatusBadgeComponent
  ],
  templateUrl: './account.component.html'
})
export class SettingAccountComponent implements OnInit {
  private authSrv = inject(AuthService);
  private userSrv = inject(UserService);
  private toastSrv = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly userInfo = toSignal(this.authSrv.userInfo$, { initialValue: null });
  readonly loading = signal(true);
  readonly loadFailed = signal(false);
  readonly saving = signal(false);
  readonly account = signal<MyAccount | null>(null);

  readonly genderOptions = enumOptions(Gender);
  readonly maritalStatusOptions = enumOptions(MaritalStatus);
  readonly bloodGroupOptions = enumOptions(BloodGroup, bloodGroupLabel);
  readonly communicationOptions = enumOptions(PreferredCommunication, name => name === 'SMS' ? 'SMS' : humanize(name));

  // Limits mirror UpdateMyAccountCommandValidation on the server.
  readonly form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    middleName: ['', Validators.maxLength(100)],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    dateOfBirth: [null as string | null],
    gender: [null as string | null],
    maritalStatus: [null as string | null],
    nationality: ['', Validators.maxLength(100)],
    bloodGroup: [null as string | null],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
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
    this.load();
  }

  get initials(): string {
    const a = this.account();
    const name = a ? `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim() : '';
    const parts = name.split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '')).toUpperCase();
  }

  load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.userSrv.getMyAccount()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          if (res.success && res.data) this.fill(res.data);
          else this.loadFailed.set(true);
        },
        error: () => this.loadFailed.set(true)
      });
  }

  private fill(a: MyAccount): void {
    this.account.set(a);
    this.form.reset({
      firstName: a.firstName ?? '',
      middleName: a.middleName ?? '',
      lastName: a.lastName ?? '',
      dateOfBirth: dateOnly(a.dateOfBirth),
      gender: a.gender,
      maritalStatus: a.maritalStatus,
      nationality: a.nationality ?? '',
      bloodGroup: a.bloodGroup,
      phone: a.phone ?? '',
      alternatePhone: a.alternatePhone ?? '',
      preferredCommunication: a.preferredCommunication,
      identificationType: a.identificationType ?? '',
      identificationNumber: a.identificationNumber ?? '',
      identificationExpiry: dateOnly(a.identificationExpiry),
      emergencyContactName: a.emergencyContactName ?? '',
      emergencyContactPhone: a.emergencyContactPhone ?? '',
      emergencyContactRelationship: a.emergencyContactRelationship ?? '',
    });
  }

  onSave(): void {
    if (this.saving() || !this.form.dirty) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastSrv.error('Please check the highlighted fields');
      return;
    }

    const v = this.form.getRawValue();
    const text = (value: string | null) => (value ?? '').trim();
    const request: UpdateMyAccountRequest = {
      firstName: text(v.firstName),
      middleName: text(v.middleName) || null,
      lastName: text(v.lastName),
      dateOfBirth: v.dateOfBirth || null,
      gender: v.gender,
      maritalStatus: v.maritalStatus,
      nationality: text(v.nationality) || null,
      bloodGroup: v.bloodGroup,
      phone: text(v.phone),
      alternatePhone: text(v.alternatePhone) || null,
      preferredCommunication: v.preferredCommunication,
      identificationType: text(v.identificationType) || null,
      identificationNumber: text(v.identificationNumber) || null,
      identificationExpiry: v.identificationExpiry || null,
      emergencyContactName: text(v.emergencyContactName) || null,
      emergencyContactPhone: text(v.emergencyContactPhone) || null,
      emergencyContactRelationship: text(v.emergencyContactRelationship) || null,
    };

    this.saving.set(true);
    this.userSrv.updateMyAccount(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: res => {
          // On failure the form keeps what was typed, so nothing is lost.
          if (!res.success) { this.toastSrv.error('Unable to update your account'); return; }
          const saved = res.data ?? { ...this.account()!, ...request };
          this.fill(saved);
          this.authSrv.patchUserInfo({
            firstName: saved.firstName,
            lastName: saved.lastName,
            phone: saved.phone,
            fullName: [saved.firstName, saved.middleName, saved.lastName].filter(Boolean).join(' '),
          });
          this.toastSrv.success('Account updated');
        },
        // The HTTP interceptor toasts the server's reason; the form keeps what was typed.
        error: () => undefined
      });
  }

  onDiscard(): void {
    const a = this.account();
    if (a) this.fill(a);
  }
}
