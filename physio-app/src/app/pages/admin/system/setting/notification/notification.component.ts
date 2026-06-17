import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SwitchComponent } from "../../../../../components/switch/switch.component";
import { PreferenceService } from '../../../../../services/common/preference.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';

interface NotificationGroup {
  title: string;
  description?: string;
  items: NotificationItem[];
}
interface NotificationItem {
  key: string;
  label: string;
  description?: string;
}

const KEYS = {
  ALERTS_COMMUNICATION: 'notify.alerts.communication',
  ALERTS_SECURITY: 'notify.alerts.security',
  ALERTS_MEETUPS: 'notify.alerts.meetups',
  ACTIVITY_COMMENTED: 'notify.activity.commented',
  ACTIVITY_MENTIONED: 'notify.activity.mentioned',
  ACTIVITY_FOLLOWED: 'notify.activity.followed',
  ACTIVITY_JOB_REPLIED: 'notify.activity.jobReplied',
} as const;

const DEFAULTS: Record<string, boolean> = {
  [KEYS.ALERTS_COMMUNICATION]: true,
  [KEYS.ALERTS_SECURITY]: true,
  [KEYS.ALERTS_MEETUPS]: false,
  [KEYS.ACTIVITY_COMMENTED]: true,
  [KEYS.ACTIVITY_MENTIONED]: true,
  [KEYS.ACTIVITY_FOLLOWED]: false,
  [KEYS.ACTIVITY_JOB_REPLIED]: false,
};

@Component({
  selector: 'setting-notification',
  standalone: true,
  imports: [
    SharedModule,
    AdminBreadcrumbComponent,
    SwitchComponent,
    BooIconComponent
  ],
  templateUrl: './notification.component.html'
})
export class NotificationComponent implements OnInit {
  private prefSrv = inject(PreferenceService);
  private toastSrv = inject(ToastService);

  loading = signal(false);
  saving = signal(false);

  state = signal<Record<string, boolean>>({ ...DEFAULTS });
  private original = signal<Record<string, boolean>>({ ...DEFAULTS });

  groups: NotificationGroup[] = [
    {
      title: 'Alerts',
      description: 'Inbox-wide notification categories.',
      items: [
        { key: KEYS.ALERTS_COMMUNICATION, label: 'Communication', description: 'Get news, announcements, and product updates.' },
        { key: KEYS.ALERTS_SECURITY,      label: 'Security',      description: 'Get important notifications about your account security.' },
        { key: KEYS.ALERTS_MEETUPS,       label: 'Meetups',       description: 'Get an email when a Meetup is posted close to my location.' },
      ]
    },
    {
      title: 'Account activity',
      description: 'Email me when…',
      items: [
        { key: KEYS.ACTIVITY_COMMENTED,   label: 'Someone comments on one of my items' },
        { key: KEYS.ACTIVITY_MENTIONED,   label: 'Someone mentions me' },
        { key: KEYS.ACTIVITY_FOLLOWED,    label: 'Someone follows me' },
        { key: KEYS.ACTIVITY_JOB_REPLIED, label: 'Someone replies to my job posting' },
      ]
    }
  ];

  isDirty = computed(() => {
    const a = this.original(), b = this.state();
    return Object.keys(a).some(k => a[k] !== b[k]);
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.prefSrv.loadAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.hydrateFromCache(),
        error: () => {
          this.hydrateFromCache();
          this.toastSrv.error('Failed to load notification settings');
        }
      });
  }

  private hydrateFromCache(): void {
    const next: Record<string, boolean> = {};
    for (const key of Object.keys(DEFAULTS)) {
      next[key] = this.prefSrv.get<boolean>(key, DEFAULTS[key]);
    }
    this.state.set(next);
    this.original.set({ ...next });
  }

  toggle(key: string): void {
    this.state.update(s => ({ ...s, [key]: !s[key] }));
  }

  isOn(key: string): boolean {
    return !!this.state()[key];
  }

  onCancel(): void {
    this.state.set({ ...this.original() });
  }

  onSave(): void {
    if (this.saving() || !this.isDirty()) return;
    this.saving.set(true);
    const a = this.original();
    const b = this.state();
    const changed = Object.keys(b)
      .filter(k => a[k] !== b[k])
      .map(k => ({ key: k, value: b[k], group: 'notification' }));

    this.prefSrv.setMany(changed)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.original.set({ ...b });
          this.toastSrv.success('Notification preferences saved');
        },
        error: () => this.toastSrv.error('Failed to save notification settings')
      });
  }
}
