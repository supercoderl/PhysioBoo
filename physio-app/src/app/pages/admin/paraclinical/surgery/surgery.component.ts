import { Component, OnInit, signal } from "@angular/core";
import { finalize, forkJoin } from "rxjs";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { SurgeryService } from "../../../../services/admin/surgery.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { SurgeryAlertSeverity, SurgeryCriticalAlert, SurgeryStats } from "../../../../shared/types/surgery.types";
import { SurgeryDetailDrawerComponent } from "./surgery-detail-drawer.component";
import { SurgeryAlertsTabComponent } from "./tabs/surgery-alerts-tab.component";
import { SurgeryDashboardTabComponent } from "./tabs/surgery-dashboard-tab.component";
import { SurgeryIntraopTabComponent } from "./tabs/surgery-intraop-tab.component";
import { SurgeryOperatingRoomsTabComponent } from "./tabs/surgery-operating-rooms-tab.component";
import { SurgeryPostopTabComponent } from "./tabs/surgery-postop-tab.component";
import { SurgeryQueueTabComponent } from "./tabs/surgery-queue-tab.component";
import { SurgeryScheduleTabComponent } from "./tabs/surgery-schedule-tab.component";

type TabKey = 'dashboard' | 'schedule' | 'rooms' | 'queue' | 'intraop' | 'postop' | 'alerts';
type DateRange = 'today' | 'week' | 'month';

const LOADING_KEY = 'surgery';

@Component({
  selector: 'admin-surgery',
  standalone: true,
  imports: [
    SharedModule,
    BooIconComponent,
    ErrorStateComponent,
    StatusBadgeComponent,
    StatCardComponent,
    SurgeryDashboardTabComponent,
    SurgeryScheduleTabComponent,
    SurgeryOperatingRoomsTabComponent,
    SurgeryQueueTabComponent,
    SurgeryIntraopTabComponent,
    SurgeryPostopTabComponent,
    SurgeryAlertsTabComponent,
    SurgeryDetailDrawerComponent,
  ],
  host: { class: 'block min-h-screen bg-gray-50' },
  template: `
    <!-- Loading -->
    <div *ngIf="loadingSrv.isLoading(LOADING_KEY) && !hasLoadedOnce" class="flex flex-col items-center justify-center py-24 gap-3">
      <boo-icon name="loader" [size]="32" iconClass="animate-spin text-primary"></boo-icon>
      <span class="text-gray-500 text-sm">Loading operating room workspace...</span>
    </div>

    <!-- Error -->
    <div *ngIf="error() && !loadingSrv.isLoading(LOADING_KEY)" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <boo-error-state title="Couldn't load the surgery workspace" [description]="error()" (retry)="retryLoad()"></boo-error-state>
    </div>

    <ng-container *ngIf="!error() && hasLoadedOnce">
      <!-- Sticky module header -->
      <div class="sticky top-0 z-20 bg-surface shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-lg font-semibold text-gray-800">Surgery</h1>
            <p class="text-xs text-secondary">Operating Room Management System — scheduling, OR status, and perioperative tracking</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button *ngFor="let r of dateRanges" type="button" (click)="setRange(r.key)"
                class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
                [ngClass]="range() === r.key ? 'bg-surface text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'">
                {{ r.label }}
              </button>
            </div>
            <button class="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <boo-icon name="circle-plus" [size]="16"></boo-icon> Schedule Surgery
            </button>
          </div>
        </div>

        <!-- Tab nav -->
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-200 flex items-center gap-1 overflow-x-auto" role="tablist">
          <button *ngFor="let t of tabs" type="button" (click)="setTab(t.key)" [attr.aria-selected]="activeTab() === t.key" role="tab"
            class="px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 -mb-px whitespace-nowrap"
            [ngClass]="activeTab() === t.key ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary hover:border-gray-300'">
            <boo-icon [name]="t.icon" iconClass="w-4 h-4"></boo-icon>
            {{ t.label }}
          </button>
        </nav>
      </div>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Clinical alerts banner -->
        <div *ngIf="alerts().length > 0" class="mb-6 flex gap-3 overflow-x-auto pb-1" aria-live="polite">
          <div *ngFor="let a of alertsBySeverity()" class="shrink-0 min-w-[280px] bg-surface border rounded-lg p-3 flex items-start gap-2"
            [ngClass]="alertBorderClass(a.severity)">
            <boo-icon name="alert-triangle" [size]="18" [ngClass]="alertIconClass(a.severity)"></boo-icon>
            <div class="flex-1 min-w-0">
              <boo-status-badge [label]="a.severity" [tone]="alertTone(a.severity)"></boo-status-badge>
              <p class="text-xs text-gray-700 mt-1">{{ a.description }}</p>
            </div>
            <button (click)="acknowledgeAlert(a)" class="text-gray-400 hover:text-gray-600" aria-label="Acknowledge alert">
              <boo-icon name="x" [size]="16"></boo-icon>
            </button>
          </div>
        </div>

        <!-- Stats strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-9 gap-3 mb-6">
          <boo-stat-card label="Total Scheduled" [value]="stats()?.totalScheduled ?? 0" icon="clipboard-list" tone="primary"></boo-stat-card>
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
        <surgery-dashboard-tab *ngIf="activeTab() === 'dashboard'" />
        <surgery-schedule-tab *ngIf="activeTab() === 'schedule'" (viewCase)="openDrawer($event)" />
        <surgery-operating-rooms-tab *ngIf="activeTab() === 'rooms'" (viewCase)="openDrawer($event)" />
        <surgery-queue-tab *ngIf="activeTab() === 'queue'" (viewCase)="openDrawer($event)" />
        <surgery-intraop-tab *ngIf="activeTab() === 'intraop'" (viewCase)="openDrawer($event)" />
        <surgery-postop-tab *ngIf="activeTab() === 'postop'" (viewCase)="openDrawer($event)" />
        <surgery-alerts-tab *ngIf="activeTab() === 'alerts'" />
      </main>
    </ng-container>

    <surgery-detail-drawer [isOpen]="drawerOpen()" [surgeryId]="drawerSurgeryId()" (close)="closeDrawer()" />
  `,
})
export class AdminSurgeryComponent implements OnInit {
  readonly LOADING_KEY = LOADING_KEY;

  stats = signal<SurgeryStats | null>(null);
  alerts = signal<SurgeryCriticalAlert[]>([]);
  activeTab = signal<TabKey>('dashboard');
  range = signal<DateRange>('today');
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
    { key: 'alerts', label: 'Clinical Alerts', icon: 'alert-triangle' },
  ];

  readonly dateRanges: { key: DateRange; label: string }[] = [
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
    this.load();
  }

  load(): void {
    this.error.set(null);
    this.loadingSrv.setLoading(LOADING_KEY, true);

    forkJoin({
      stats: this.srv.getStats(),
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

  setRange(key: DateRange): void { this.range.set(key); }

  alertsBySeverity(): SurgeryCriticalAlert[] {
    const order: Record<SurgeryAlertSeverity, number> = { Critical: 0, High: 1, Warning: 2, Information: 3 };
    return [...this.alerts()].sort((a, b) => order[a.severity] - order[b.severity]);
  }

  alertTone(severity: SurgeryAlertSeverity): BadgeTone {
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
    this.srv.acknowledgeAlert(alert.id).subscribe(res => {
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
