import { Component, OnInit, inject, signal } from "@angular/core";
import { finalize, forkJoin } from "rxjs";
import { BooBadgeTone, BooButtonComponent, BooErrorStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { AuthService } from "../../../../services/auth/auth.service";
import { SurgeryService } from "../../../../services/admin/surgery.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { SurgeryAlertSeverity, SurgeryCriticalAlert, SurgeryRange, SurgeryRow, SurgeryStats } from "../../../../shared/types/surgery.types";
import { SurgeryDetailDrawerComponent } from "./surgery-detail-drawer.component";
import { SurgeryAlertsTabComponent } from "./tabs/surgery-alerts-tab.component";
import { SurgeryDashboardTabComponent } from "./tabs/surgery-dashboard-tab.component";
import { SurgeryIntraopTabComponent } from "./tabs/surgery-intraop-tab.component";
import { SurgeryOperatingRoomsTabComponent } from "./tabs/surgery-operating-rooms-tab.component";
import { SurgeryPostopTabComponent } from "./tabs/surgery-postop-tab.component";
import { SurgeryQueueTabComponent } from "./tabs/surgery-queue-tab.component";
import { SurgeryScheduleTabComponent } from "./tabs/surgery-schedule-tab.component";
import { SurgeryCancelDrawerComponent } from "./surgery-cancel-drawer.component";
import { SurgeryCreateDrawerComponent } from "./surgery-create-drawer.component";

type TabKey = 'dashboard' | 'schedule' | 'rooms' | 'queue' | 'intraop' | 'postop' | 'alerts';
const LOADING_KEY = 'surgery';

@Component({
  selector: 'admin-surgery',
  standalone: true,
  imports: [
    SharedModule,
    BooErrorStateComponent,
    BooStatusBadgeComponent,
    StatCardComponent,
    SurgeryDashboardTabComponent,
    SurgeryScheduleTabComponent,
    SurgeryOperatingRoomsTabComponent,
    SurgeryQueueTabComponent,
    SurgeryIntraopTabComponent,
    SurgeryPostopTabComponent,
    SurgeryAlertsTabComponent,
    SurgeryDetailDrawerComponent,
    SurgeryCreateDrawerComponent,
    SurgeryCancelDrawerComponent,
    BooButtonComponent,
  ],
  template: `
    <!-- Permission denied -->
    <div *ngIf="!canRead" class="pt-4">
      <boo-error-state icon="lock" title="You don't have access to Surgery" [showRetry]="false"
        description="Ask an administrator for the surgery case read permission."></boo-error-state>
    </div>

    <!-- Loading -->
    <div *ngIf="canRead && loadingSrv.isLoading(LOADING_KEY) && !hasLoadedOnce" role="status" class="flex flex-col items-center justify-center py-24 gap-3">
      <physio-icon name="loader" [size]="32" [class]="'animate-spin text-primary'"></physio-icon>
      <span class="text-gray-500 text-sm">Loading operating room workspace...</span>
    </div>

    <!-- Error -->
    <div *ngIf="canRead && error() && !loadingSrv.isLoading(LOADING_KEY)" class="pt-4">
      <boo-error-state title="Couldn't load the surgery workspace" [description]="error()" (retry)="retryLoad()"></boo-error-state>
    </div>

    <ng-container *ngIf="canRead && !error() && hasLoadedOnce">
      <!-- Sticky module header -->
      <div class="mb-4 shrink-0 rounded-2 border border-borderGray/60 bg-surface">
        <div class="px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-lg font-semibold text-gray-800">Surgery</h1>
            <p class="text-xs text-secondary">Operating Room Management System — scheduling, OR status, and perioperative tracking</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center bg-gray-100 rounded-lg p-0.5" role="group" aria-label="Statistics period">
              <button *ngFor="let r of dateRanges" type="button" (click)="setRange(r.key)" [attr.aria-pressed]="range() === r.key"
                class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
                [ngClass]="range() === r.key ? 'bg-surface text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'">
                {{ r.label }}
              </button>
            </div>
            <button boo-button variant="ghost" size="sm" type="button" [disabled]="loadingSrv.isLoading(LOADING_KEY)" (click)="refresh()">
              <physio-icon name="refresh-cw" [size]="14"></physio-icon> Refresh
            </button>
            <button *ngIf="canSchedule" boo-button variant="primary" size="sm" type="button" (click)="createOpen.set(true)">
              <physio-icon name="circle-plus" [size]="16"></physio-icon> Schedule Surgery
            </button>
          </div>
        </div>

        <!-- Tab nav -->
        <nav class="px-4 border-t border-gray-200 flex items-center gap-1 overflow-x-auto" role="tablist">
          <button *ngFor="let t of tabs" type="button" (click)="setTab(t.key)" [attr.aria-selected]="activeTab() === t.key" role="tab"
            class="px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 -mb-px whitespace-nowrap"
            [ngClass]="activeTab() === t.key ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary hover:border-gray-300'">
            <physio-icon [name]="t.icon" class="w-4 h-4"></physio-icon>
            {{ t.label }}
          </button>
        </nav>
      </div>

      <main class="boo-scrollbar min-h-0 min-w-0 flex-1 overflow-auto pb-5">
        <!-- Clinical alerts banner -->
        <div *ngIf="alerts().length > 0" class="mb-6 flex gap-3 overflow-x-auto pb-1" aria-live="polite">
          <div *ngFor="let a of alertsBySeverity()" class="shrink-0 min-w-[280px] bg-surface border rounded-lg p-3 flex items-start gap-2"
            [ngClass]="alertBorderClass(a.severity)">
            <physio-icon name="triangle-alert" [size]="18" [ngClass]="alertIconClass(a.severity)"></physio-icon>
            <div class="flex-1 min-w-0">
              <boo-status-badge [label]="a.severity" [tone]="alertTone(a.severity)"></boo-status-badge>
              <p class="text-xs text-gray-700 mt-1">{{ a.description }}</p>
            </div>
            <button *ngIf="canUpdate" type="button" (click)="acknowledgeAlert(a)" [disabled]="acknowledgingId() !== null" class="text-gray-400 hover:text-gray-600" aria-label="Acknowledge alert">
              <physio-icon name="x" [size]="16"></physio-icon>
            </button>
          </div>
        </div>

        <!-- Stats strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-9 gap-3 mb-6">
          <boo-stat-card label="Total Scheduled" [value]="stats()?.totalScheduled ?? 0" icon="clipboard" tone="primary"></boo-stat-card>
          <boo-stat-card label="Ongoing" [value]="stats()?.ongoing ?? 0" icon="activity" tone="warning"></boo-stat-card>
          <boo-stat-card label="Completed" [value]="stats()?.completed ?? 0" icon="circle-check" tone="success"></boo-stat-card>
          <boo-stat-card label="Delayed" [value]="stats()?.delayed ?? 0" icon="clock" tone="danger"></boo-stat-card>
          <boo-stat-card label="Emergency" [value]="stats()?.emergency ?? 0" icon="zap" tone="danger"></boo-stat-card>
          <boo-stat-card label="Available ORs" [value]="stats()?.availableRooms ?? 0" icon="hospital" tone="success"></boo-stat-card>
          <boo-stat-card label="Occupied ORs" [value]="stats()?.occupiedRooms ?? 0" icon="building-2" tone="primary"></boo-stat-card>
          <boo-stat-card label="Avg Duration (min)" [value]="stats()?.averageDurationMinutes ?? 0" icon="clock" tone="neutral"></boo-stat-card>
          <boo-stat-card label="OR Utilization" [value]="(stats()?.orUtilizationRate ?? 0) + '%'" icon="gauge" tone="primary"></boo-stat-card>
        </div>

        <!-- Tab content -->
        <surgery-dashboard-tab *ngIf="activeTab() === 'dashboard'" [range]="range()" [refreshKey]="refreshKey()" />
        <surgery-schedule-tab *ngIf="activeTab() === 'schedule'" [refreshKey]="refreshKey()" [canSchedule]="canSchedule" (viewCase)="openDrawer($event)" (cancelCase)="cancelTarget.set($event)" />
        <surgery-operating-rooms-tab *ngIf="activeTab() === 'rooms'" (viewCase)="openDrawer($event)" />
        <surgery-queue-tab *ngIf="activeTab() === 'queue'" (viewCase)="openDrawer($event)" />
        <surgery-intraop-tab *ngIf="activeTab() === 'intraop'" (viewCase)="openDrawer($event)" />
        <surgery-postop-tab *ngIf="activeTab() === 'postop'" (viewCase)="openDrawer($event)" />
        <surgery-alerts-tab *ngIf="activeTab() === 'alerts'" />
      </main>
    </ng-container>

    <surgery-detail-drawer [isOpen]="drawerOpen()" [surgeryId]="drawerSurgeryId()" (close)="closeDrawer()" (changed)="refresh()" />
    <surgery-create-drawer [isOpen]="createOpen()" (close)="createOpen.set(false)" (created)="onCreated()" />
    <surgery-cancel-drawer [isOpen]="!!cancelTarget()" [surgery]="cancelTarget()" (close)="cancelTarget.set(null)" (cancelled)="onCancelled()" />
  `,
})
export class AdminSurgeryComponent implements OnInit {
  readonly LOADING_KEY = LOADING_KEY;

  private readonly authSrv = inject(AuthService);
  readonly canRead = this.authSrv.hasPermission(Permissions.Surgery.SurgeryRead);
  readonly canSchedule = this.authSrv.hasPermission(Permissions.Surgery.SurgerySchedule);
  readonly canUpdate = this.authSrv.hasPermission(Permissions.Surgery.SurgeryUpdate);

  stats = signal<SurgeryStats | null>(null);
  alerts = signal<SurgeryCriticalAlert[]>([]);
  activeTab = signal<TabKey>('dashboard');
  range = signal<SurgeryRange>('today');
  createOpen = signal(false);
  cancelTarget = signal<SurgeryRow | null>(null);
  acknowledgingId = signal<string | null>(null);
  /** Bumped after a change on the server so the visible tab reloads its data. */
  refreshKey = signal(0);
  drawerOpen = signal(false);
  drawerSurgeryId = signal<string | null>(null);

  error = signal<string | null>(null);
  hasLoadedOnce = false;

  readonly tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { key: 'schedule', label: 'Schedule', icon: 'calendar-days' },
    { key: 'rooms', label: 'Operating Rooms', icon: 'building-2' },
    { key: 'queue', label: 'Surgical Queue', icon: 'clipboard-check' },
    { key: 'intraop', label: 'Intra-Operative Tracking', icon: 'activity' },
    { key: 'postop', label: 'Post-Operative Recovery', icon: 'bed' },
    { key: 'alerts', label: 'Clinical Alerts', icon: 'triangle-alert' },
  ];

  readonly dateRanges: { key: SurgeryRange; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Weekly' },
    { key: 'month', label: 'Monthly' },
  ];

  constructor(
    private srv: SurgeryService,
    private toastSrv: ToastService,
    protected loadingSrv: LocalLoadingService,
  ) { }

  ngOnInit(): void {
    if (this.canRead) this.load();
  }

  load(): void {
    this.error.set(null);
    this.loadingSrv.setLoading(LOADING_KEY, true);

    forkJoin({
      stats: this.srv.getStats(this.range()),
      alerts: this.srv.getAlerts(),
    })
      .pipe(finalize(() => this.loadingSrv.setLoading(LOADING_KEY, false)))
      .subscribe({
        next: ({ stats, alerts }) => {
          if (stats.success) this.stats.set(stats.data);
          if (alerts.success) this.alerts.set(alerts.data.filter(a => !a.acknowledged));
          this.hasLoadedOnce = true;
        },
        error: () => {
          this.error.set('Failed to load the surgery workspace. Please try again.');
          this.hasLoadedOnce = true;
        },
      });
  }

  retryLoad(): void {
    this.load();
  }

  setTab(key: TabKey): void { this.activeTab.set(key); }

  setRange(key: SurgeryRange): void {
    if (key === this.range()) return;
    this.range.set(key);
    this.load();
  }

  /** Reloads the header data and the visible tab. */
  refresh(): void {
    this.load();
    this.refreshKey.update(k => k + 1);
  }

  onCreated(): void {
    this.createOpen.set(false);
    this.refresh();
  }

  onCancelled(): void {
    this.cancelTarget.set(null);
    this.refresh();
  }

  alertsBySeverity(): SurgeryCriticalAlert[] {
    const order: Record<SurgeryAlertSeverity, number> = { Critical: 0, High: 1, Warning: 2, Information: 3 };
    return [...this.alerts()].sort((a, b) => order[a.severity] - order[b.severity]);
  }

  alertTone(severity: SurgeryAlertSeverity): BooBadgeTone {
    switch (severity) {
      case 'Critical': return 'danger';
      case 'High': return 'danger';
      case 'Warning': return 'warning';
      default: return 'primary';
    }
  }

  alertBorderClass(severity: SurgeryAlertSeverity): string {
    switch (severity) {
      case 'Critical': return 'border-red-300';
      case 'High': return 'border-red-200';
      case 'Warning': return 'border-amber-300';
      default: return 'border-gray-200';
    }
  }

  alertIconClass(severity: SurgeryAlertSeverity): string {
    switch (severity) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-red-500';
      case 'Warning': return 'text-amber-600';
      default: return 'text-gray-500';
    }
  }

  acknowledgeAlert(alert: SurgeryCriticalAlert): void {
    if (this.acknowledgingId()) return;
    this.acknowledgingId.set(alert.id);
    this.srv.acknowledgeAlert(alert.id).pipe(finalize(() => this.acknowledgingId.set(null))).subscribe(res => {
      if (res.success) {
        this.alerts.set(this.alerts().filter(a => a.id !== alert.id));
        this.toastSrv.success('Alert acknowledged');
      } else {
        this.toastSrv.error('Unable to acknowledge alert');
      }
    });
  }

  openDrawer(surgeryId: string): void {
    this.drawerSurgeryId.set(surgeryId);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
