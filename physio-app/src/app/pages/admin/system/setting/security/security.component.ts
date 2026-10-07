import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SwitchComponent } from "../../../../../components/switch/switch.component";
import { UserService } from '../../../../../services/admin/user.service';
import { PreferenceService } from '../../../../../services/common/preference.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActiveAt: string;
  current: boolean;
}

const KEYS = {
  TWO_FACTOR: 'security.twoFactor',
  ROTATE_PASSWORD: 'security.rotatePassword',
  EMAIL_NEW_LOGIN: 'security.emailOnNewLogin',
} as const;

const DEFAULTS: Record<string, boolean> = {
  [KEYS.TWO_FACTOR]: false,
  [KEYS.ROTATE_PASSWORD]: false,
  [KEYS.EMAIL_NEW_LOGIN]: true,
};

@Component({
  selector: 'setting-security',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    AdminBreadcrumbComponent,
    BooIconComponent,
    SwitchComponent
  ],
  templateUrl: './security.component.html'
})
export class SecurityComponent implements OnInit {
  private prefSrv = inject(PreferenceService);
  private toastSrv = inject(ToastService);
  private userSrv = inject(UserService);

  loading = signal(false);
  loadingSessions = signal(false);
  savingPassword = signal(false);
  savingPrefs = signal(false);

  // password fields
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  showCurrent = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);

  // preferences
  prefs = signal<Record<string, boolean>>({ ...DEFAULTS });
  private originalPrefs = signal<Record<string, boolean>>({ ...DEFAULTS });

  sessions = signal<ActiveSession[]>([]);

  passwordStrength = computed(() => this.scorePassword(this.newPassword()));
  passwordsMatch = computed(() =>
    !this.confirmPassword() || this.newPassword() === this.confirmPassword()
  );
  canSavePassword = computed(() =>
    !!this.currentPassword() &&
    this.passwordStrength() >= 3 &&
    this.passwordsMatch() &&
    this.newPassword() !== this.currentPassword()
  );

  isPrefsDirty = computed(() => {
    const a = this.originalPrefs(), b = this.prefs();
    return Object.keys(a).some(k => a[k] !== b[k]);
  });

  KEYS = KEYS;

  ngOnInit(): void {
    this.loading.set(true);
    this.prefSrv.loadAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.hydrate(),
        error: () => { this.hydrate(); this.toastSrv.error('Failed to load security settings'); }
      });
    this.loadSessions();
  }

  loadSessions(): void {
    this.loadingSessions.set(true);
    this.userSrv.getSessions()
      .pipe(finalize(() => this.loadingSessions.set(false)))
      .subscribe({
        next: res => {
          if (!res.success) return;
          this.sessions.set(res.data.map(s => ({ ...s, lastActiveAt: s.current ? 'Active now' : this.relativeTime(s.lastActiveAt) })));
        },
        error: () => this.toastSrv.error('Failed to load active sessions')
      });
  }

  private relativeTime(iso: string): string {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  }

  private hydrate(): void {
    const next: Record<string, boolean> = {};
    for (const k of Object.keys(DEFAULTS)) {
      next[k] = this.prefSrv.get<boolean>(k, DEFAULTS[k]);
    }
    this.prefs.set(next);
    this.originalPrefs.set({ ...next });
  }

  togglePref(key: string): void {
    this.prefs.update(s => ({ ...s, [key]: !s[key] }));
  }

  isPrefOn(key: string): boolean {
    return !!this.prefs()[key];
  }

  onChangePassword(): void {
    if (!this.canSavePassword() || this.savingPassword()) return;
    this.savingPassword.set(true);
    this.userSrv.changePassword(this.currentPassword(), this.newPassword())
      .pipe(finalize(() => this.savingPassword.set(false)))
      .subscribe({
        next: () => {
          this.currentPassword.set('');
          this.newPassword.set('');
          this.confirmPassword.set('');
          this.toastSrv.success('Password updated');
        },
        error: err => this.toastSrv.error(err?.error?.errors?.[0] ?? err?.error?.detailedErrors?.[0] ?? 'Unable to change password. Check your current password.')
      });
  }

  onSavePrefs(): void {
    if (!this.isPrefsDirty() || this.savingPrefs()) return;
    this.savingPrefs.set(true);
    const a = this.originalPrefs();
    const b = this.prefs();
    const changed = Object.keys(b)
      .filter(k => a[k] !== b[k])
      .map(k => ({ key: k, value: b[k], group: 'security' }));

    this.prefSrv.setMany(changed)
      .pipe(finalize(() => this.savingPrefs.set(false)))
      .subscribe({
        next: () => {
          this.originalPrefs.set({ ...b });
          this.toastSrv.success('Security preferences saved');
        },
        error: () => this.toastSrv.error('Failed to save preferences')
      });
  }

  onCancelPrefs(): void {
    this.prefs.set({ ...this.originalPrefs() });
  }

  revokeSession(s: ActiveSession): void {
    if (s.current) return;
    if (!confirm(`Sign out from ${s.device}?`)) return;
    this.userSrv.revokeSession(s.id).subscribe({
      next: res => {
        if (!res.success) { this.toastSrv.error('Unable to sign out that device'); return; }
        this.sessions.update(list => list.filter(x => x.id !== s.id));
        this.toastSrv.success(`Signed out ${s.device}`);
      },
      error: () => this.toastSrv.error('Unable to sign out that device')
    });
  }

  revokeAllOtherSessions(): void {
    if (!confirm('Sign out from all other devices?')) return;
    this.userSrv.revokeOtherSessions().subscribe({
      next: res => {
        if (!res.success) { this.toastSrv.error('Unable to sign out other devices'); return; }
        this.sessions.update(list => list.filter(x => x.current));
        this.toastSrv.success('Signed out from all other devices');
      },
      error: () => this.toastSrv.error('Unable to sign out other devices')
    });
  }

  private scorePassword(pw: string): number {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  strengthLabel(): string {
    const s = this.passwordStrength();
    if (!this.newPassword()) return '';
    return ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][s];
  }

  strengthColorClass(): string {
    const s = this.passwordStrength();
    return ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'][s];
  }
}
