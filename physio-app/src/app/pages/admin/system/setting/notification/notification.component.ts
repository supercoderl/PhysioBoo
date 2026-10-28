import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { SettingPageComponent } from '../../../../../components/layout/admin/setting/shared/setting-page.component';
import { SettingSectionComponent } from '../../../../../components/layout/admin/setting/shared/setting-section.component';
import { SwitchComponent } from "../../../../../components/switch/switch.component";
import { PreferenceService } from '../../../../../services/common/preference.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';

interface NotificationItem {
  key: string;
  label: string;
  description: string;
}

// Keys already in use; values saved before this page was reorganised still apply.
const KEYS = {
  ALERTS_COMMUNICATION: 'notify.alerts.communication',
  ALERTS_SECURITY: 'notify.alerts.security',
} as const;

const DEFAULTS: Record<string, boolean> = {
  [KEYS.ALERTS_COMMUNICATION]: true,
  [KEYS.ALERTS_SECURITY]: true,
};

/**
 * Settings > Notifications: email preferences stored as user preferences (POST /api/user-preferences,
 * group `notification`). Only changed keys are written; a failed load shows an error instead of defaults, so a
 * save can never overwrite the stored values with values the user never saw.
 */
@Component({
  selector: 'setting-notification',
  standalone: true,
  imports: [
    SharedModule,
    SettingPageComponent,
    SettingSectionComponent,
    SwitchComponent
  ],
  template: `
    <setting-page
      heading="Notifications"
      description="Your email preferences for PhysioBoo announcements and account alerts."
      loadingLabel="Loading your preferences…"
      failedTitle="We couldn’t load your notification preferences"
      saveLabel="Save preferences"
      [loading]="loading()"
      [loadFailed]="loadFailed()"
      [dirty]="isDirty()"
      [saving]="saving()"
      (save)="onSave()"
      (discard)="onDiscard()"
      (retry)="load()"
    >
      <setting-section heading="Email" description="Sent to the email address you sign in with." [flush]="true">
        <ul class="m-0 p-0 list-none divide-y divide-rowDivider">
          <li *ngFor="let item of items" class="flex items-center justify-between gap-4 px-5 py-3.5">
            <div class="min-w-0">
              <p [id]="item.key" class="m-0 text-sm font-medium text-regular">{{ item.label }}</p>
              <p class="m-0 mt-0.5 text-xs text-secondary">{{ item.description }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span *ngIf="isChanged(item.key)" class="text-[11px] font-medium text-amber-700">Unsaved</span>
              <switch [isOpen]="state()[item.key]" [disabled]="saving()" [ariaLabel]="item.label" (change)="toggle(item.key)" />
            </div>
          </li>
        </ul>
      </setting-section>

      <p class="m-0 flex items-start gap-2 text-xs text-secondary">
        <physio-icon name="info" [size]="14" class="shrink-0 mt-0.5" aria-hidden="true" />
        These choices are saved to your account. Account emails you need to sign in, such as invitations and password resets, are always sent.
      </p>
    </setting-page>
  `
})
export class NotificationComponent implements OnInit {
  private prefSrv = inject(PreferenceService);
  private toastSrv = inject(ToastService);

  readonly loading = signal(true);
  readonly loadFailed = signal(false);
  readonly saving = signal(false);

  readonly state = signal<Record<string, boolean>>({ ...DEFAULTS });
  private readonly original = signal<Record<string, boolean>>({ ...DEFAULTS });

  readonly items: NotificationItem[] = [
    { key: KEYS.ALERTS_COMMUNICATION, label: 'Product updates', description: 'News, announcements and new PhysioBoo features.' },
    { key: KEYS.ALERTS_SECURITY, label: 'Security alerts', description: 'Important notices about your account’s security.' },
  ];

  readonly isDirty = computed(() => {
    const a = this.original(), b = this.state();
    return Object.keys(a).some(k => a[k] !== b[k]);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.prefSrv.loadAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.hydrate(),
        error: () => this.loadFailed.set(true)
      });
  }

  private hydrate(): void {
    const next: Record<string, boolean> = {};
    for (const key of Object.keys(DEFAULTS)) {
      next[key] = this.prefSrv.get<boolean>(key, DEFAULTS[key]) === true;
    }
    this.state.set(next);
    this.original.set({ ...next });
  }

  isChanged(key: string): boolean {
    return this.state()[key] !== this.original()[key];
  }

  toggle(key: string): void {
    if (this.saving()) return;
    this.state.update(s => ({ ...s, [key]: !s[key] }));
  }

  onDiscard(): void {
    this.state.set({ ...this.original() });
  }

  onSave(): void {
    if (this.saving() || !this.isDirty()) return;
    const a = this.original();
    const b = { ...this.state() };
    const changed = Object.keys(b)
      .filter(k => a[k] !== b[k])
      .map(k => ({ key: k, value: b[k], group: 'notification' }));

    this.saving.set(true);
    this.prefSrv.setMany(changed)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.original.set(b);
          this.toastSrv.success('Notification preferences saved');
        },
        // The interceptor reports the failure; the switches keep the unsaved choices so the save can be retried.
        error: () => undefined
      });
  }
}
