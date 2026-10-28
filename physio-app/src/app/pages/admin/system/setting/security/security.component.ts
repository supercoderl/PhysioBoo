import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInputComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { finalize, map, startWith } from 'rxjs';
import { SettingPageComponent } from '../../../../../components/layout/admin/setting/shared/setting-page.component';
import { SettingSectionComponent } from '../../../../../components/layout/admin/setting/shared/setting-section.component';
import { UserService } from '../../../../../services/admin/user.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';
import { UserSession } from '../../../../../shared/types/session.types';

/** The server's password rule (ValidationExtensions.Password): 8–50 characters with all four character kinds. */
const PASSWORD_RULES: { key: string; label: string; test: (pw: string) => boolean }[] = [
  { key: 'length', label: '8 to 50 characters', test: pw => pw.length >= 8 && pw.length <= 50 },
  { key: 'upper', label: 'An uppercase letter', test: pw => /[A-Z]/.test(pw) },
  { key: 'lower', label: 'A lowercase letter', test: pw => /[a-z]/.test(pw) },
  { key: 'digit', label: 'A number', test: pw => /[0-9]/.test(pw) },
  { key: 'symbol', label: 'A symbol, e.g. ! @ # $', test: pw => /[^a-zA-Z0-9]/.test(pw) },
];

function passwordPolicy(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '');
  if (!value) return null;
  return PASSWORD_RULES.every(r => r.test(value)) ? null : { passwordPolicy: true };
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return confirm && next !== confirm ? { mismatch: true } : null;
}

function differsFromCurrent(group: AbstractControl): ValidationErrors | null {
  const current = group.get('currentPassword')?.value;
  const next = group.get('newPassword')?.value;
  return current && next && current === next ? { sameAsCurrent: true } : null;
}

/**
 * Settings > Security: change the password (PATCH /api/users/change-password) and manage signed-in devices
 * (GET/DELETE /api/users/me/sessions). Changing the password revokes every refresh token on the server, so the
 * page signs out right after a successful change instead of leaving a session that will fail on its next refresh.
 */
@Component({
  selector: 'setting-security',
  standalone: true,
  imports: [
    SharedModule,
    SettingPageComponent,
    SettingSectionComponent,
    BooInputComponent,
    BooButtonComponent,
    BooStatusBadgeComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent
  ],
  templateUrl: './security.component.html'
})
export class SecurityComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authSrv = inject(AuthService);
  private userSrv = inject(UserService);
  private dialogSrv = inject(DialogService);
  private toastSrv = inject(ToastService);

  readonly rules = PASSWORD_RULES;

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, passwordPolicy]],
    confirmPassword: ['', Validators.required],
  }, { validators: [passwordsMatch, differsFromCurrent] });

  readonly savingPassword = signal(false);
  readonly showCurrent = signal(false);
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);

  private readonly newPassword = toSignal(
    this.passwordForm.controls.newPassword.valueChanges.pipe(startWith(''), map(v => v ?? '')),
    { initialValue: '' }
  );
  /** Which of the server's rules the new password meets, for the live checklist. */
  readonly ruleState = computed(() => {
    const pw = this.newPassword();
    return Object.fromEntries(PASSWORD_RULES.map(r => [r.key, r.test(pw)])) as Record<string, boolean>;
  });

  readonly sessions = signal<UserSession[]>([]);
  readonly loadingSessions = signal(true);
  readonly sessionsFailed = signal(false);
  readonly revoking = signal<string | null>(null);
  readonly hasOtherSessions = computed(() => this.sessions().some(s => !s.current));

  ngOnInit(): void {
    this.loadSessions();
  }

  // #region Password
  get confirmError(): string | null {
    const c = this.passwordForm.controls.confirmPassword;
    if (!(c.touched || c.dirty) || !c.value) return null;
    return this.passwordForm.hasError('mismatch') ? 'The passwords don’t match.' : null;
  }

  get sameAsCurrent(): boolean {
    return this.passwordForm.hasError('sameAsCurrent') && this.passwordForm.controls.newPassword.dirty;
  }

  onChangePassword(): void {
    if (this.savingPassword()) return;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.savingPassword.set(true);
    this.userSrv.changePassword(currentPassword, newPassword)
      .pipe(finalize(() => this.savingPassword.set(false)))
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.toastSrv.success('Password changed. Sign in again with your new password.');
          // The server has revoked every session of this account, including this one.
          this.authSrv.signOut();
        },
        // The interceptor shows the server's reason (for example, a wrong current password); the fields stay filled.
        error: () => undefined
      });
  }
  // #endregion

  // #region Sessions
  loadSessions(): void {
    this.loadingSessions.set(true);
    this.sessionsFailed.set(false);
    this.userSrv.getSessions()
      .pipe(finalize(() => this.loadingSessions.set(false)))
      .subscribe({
        next: res => {
          if (!res.success) { this.sessionsFailed.set(true); return; }
          // This device first, then the most recently active.
          this.sessions.set([...(res.data ?? [])].sort((a, b) =>
            Number(b.current) - Number(a.current) || new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()));
        },
        error: () => this.sessionsFailed.set(true)
      });
  }

  deviceIcon(s: UserSession): string {
    const device = (s.device ?? '').toLowerCase();
    return /iphone|android|mobile|ipad|tablet/.test(device) ? 'smartphone' : 'monitor';
  }

  lastActive(s: UserSession): string {
    if (s.current) return 'Active now';
    const time = new Date(s.lastActiveAt).getTime();
    if (isNaN(time)) return 'Unknown';
    const minutes = Math.round((Date.now() - time) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  }

  revokeSession(s: UserSession): void {
    if (s.current || this.revoking()) return;
    this.dialogSrv.confirm(
      `${s.device} · ${s.browser} will be signed out and must sign in again to use your account.`,
      () => {
        this.revoking.set(s.id);
        this.userSrv.revokeSession(s.id)
          .pipe(finalize(() => this.revoking.set(null)))
          .subscribe({
            next: res => {
              if (!res.success) { this.toastSrv.error('Unable to sign out that device'); return; }
              this.sessions.update(list => list.filter(x => x.id !== s.id));
              this.toastSrv.success(`Signed out ${s.device}`);
            },
            error: () => undefined
          });
      },
      'Sign out this device?',
      'warning',
      'Sign out'
    );
  }

  revokeAllOtherSessions(): void {
    if (this.revoking()) return;
    const others = this.sessions().filter(s => !s.current).length;
    this.dialogSrv.confirm(
      `${others} other device${others === 1 ? '' : 's'} will be signed out. This device stays signed in.`,
      () => {
        this.revoking.set('others');
        this.userSrv.revokeOtherSessions()
          .pipe(finalize(() => this.revoking.set(null)))
          .subscribe({
            next: res => {
              if (!res.success) { this.toastSrv.error('Unable to sign out other devices'); return; }
              this.sessions.update(list => list.filter(x => x.current));
              this.toastSrv.success('Signed out all other devices');
            },
            error: () => undefined
          });
      },
      'Sign out all other devices?',
      'warning',
      'Sign out others'
    );
  }
  // #endregion
}
