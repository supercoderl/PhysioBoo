import { Component, OnInit, signal } from "@angular/core";
import { finalize, forkJoin } from "rxjs";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { RadiologyService } from "../../../../services/admin/radiology.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { CriticalFindingAlert, RadiologyAlertSeverity, RadiologyStats } from "../../../../shared/types/radiology.types";
import { RadiologyPatientStudyDrawerComponent } from "./patient-study-drawer.component";
import { RadiologyCriticalFindingsTabComponent } from "./tabs/radiology-critical-findings-tab.component";
import { RadiologyDashboardTabComponent } from "./tabs/radiology-dashboard-tab.component";
import { RadiologyOrdersTabComponent } from "./tabs/radiology-orders-tab.component";
import { RadiologyQueueTabComponent } from "./tabs/radiology-queue-tab.component";
import { RadiologyReportingTabComponent } from "./tabs/radiology-reporting-tab.component";
import { RadiologySchedulingTabComponent } from "./tabs/radiology-scheduling-tab.component";
import { RadiologyStudyTrackingTabComponent } from "./tabs/radiology-study-tracking-tab.component";

type TabKey = 'dashboard' | 'orders' | 'scheduling' | 'queue' | 'study-tracking' | 'reporting' | 'critical-findings';

const LOADING_KEY = 'radiology';

@Component({
  selector: 'admin-radiology',
  standalone: true,
  imports: [
    SharedModule,
    BooIconComponent,
    StatusBadgeComponent,
    StatCardComponent,
    RadiologyDashboardTabComponent,
    RadiologyOrdersTabComponent,
    RadiologySchedulingTabComponent,
    RadiologyQueueTabComponent,
    RadiologyStudyTrackingTabComponent,
    RadiologyReportingTabComponent,
    RadiologyCriticalFindingsTabComponent,
    RadiologyPatientStudyDrawerComponent,
  ],
  host: { class: 'block min-h-screen bg-gray-50' },
  template: `
    <!-- Loading -->
    <div *ngIf="loadingSrv.isLoading(LOADING_KEY) && !hasLoadedOnce" class="flex flex-col items-center justify-center py-24 gap-3">
      <boo-icon name="loader" [size]="32" iconClass="animate-spin text-primary"></boo-icon>
      <span class="text-gray-500 text-sm">Loading radiology workspace...</span>
    </div>

    <!-- Error -->
    <div *ngIf="hasError && !loadingSrv.isLoading(LOADING_KEY)" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <boo-icon name="alert-circle" [size]="20" iconClass="text-red-500"></boo-icon>
          <span class="text-red-700 text-sm">Unable to load the radiology workspace.</span>
        </div>
        <button (click)="load()" class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">Retry</button>
      </div>
    </div>

    <ng-container *ngIf="!hasError && hasLoadedOnce">
      <!-- Sticky module header -->
      <div class="sticky top-0 z-20 bg-surface shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-lg font-semibold text-gray-800">Radiology</h1>
            <p class="text-xs text-secondary">Radiology Information System — orders, scheduling, imaging, and reporting</p>
          </div>
          <button class="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <boo-icon name="plus-circle" [size]="16"></boo-icon> New Order
          </button>
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
        <!-- Critical findings alerts banner -->
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
          <boo-stat-card label="Total Orders" [value]="stats()?.totalOrders ?? 0" icon="clipboard-list" tone="primary"></boo-stat-card>
          <boo-stat-card label="Waiting for Scheduling" [value]="stats()?.waitingForScheduling ?? 0" icon="calendar-clock" tone="neutral"></boo-stat-card>
          <boo-stat-card label="Scheduled" [value]="stats()?.scheduledStudies ?? 0" icon="calendar-check" tone="primary"></boo-stat-card>
          <boo-stat-card label="In Progress" [value]="stats()?.inProgress ?? 0" icon="loader" tone="primary"></boo-stat-card>
          <boo-stat-card label="Pending Reporting" [value]="stats()?.pendingReporting ?? 0" icon="file-edit" tone="warning"></boo-stat-card>
          <boo-stat-card label="Pending Verification" [value]="stats()?.pendingVerification ?? 0" icon="clipboard-check" tone="warning"></boo-stat-card>
          <boo-stat-card label="Completed" [value]="stats()?.completedStudies ?? 0" icon="circle-check" tone="success"></boo-stat-card>
          <boo-stat-card label="Critical Findings" [value]="stats()?.criticalFindings ?? 0" icon="alert-triangle" tone="danger"></boo-stat-card>
          <boo-stat-card label="Avg TAT (hrs)" [value]="stats()?.averageTatHours ?? 0" icon="timer" tone="neutral"></boo-stat-card>
        </div>

        <!-- Tab content -->
        <radiology-dashboard-tab *ngIf="activeTab() === 'dashboard'" />
        <radiology-orders-tab *ngIf="activeTab() === 'orders'" (viewPatient)="openPatientDrawer($event)" />
        <radiology-scheduling-tab *ngIf="activeTab() === 'scheduling'" />
        <radiology-queue-tab *ngIf="activeTab() === 'queue'" />
        <radiology-study-tracking-tab *ngIf="activeTab() === 'study-tracking'" />
        <radiology-reporting-tab *ngIf="activeTab() === 'reporting'" />
        <radiology-critical-findings-tab *ngIf="activeTab() === 'critical-findings'" />
      </main>
    </ng-container>

    <radiology-patient-study-drawer [isOpen]="drawerOpen()" [patientId]="drawerPatientId()" (close)="closePatientDrawer()" />
  `,
})
export class AdminRadiologyComponent implements OnInit {
  readonly LOADING_KEY = LOADING_KEY;

  stats = signal<RadiologyStats | null>(null);
  alerts = signal<CriticalFindingAlert[]>([]);
  activeTab = signal<TabKey>('dashboard');
  drawerOpen = signal(false);
  drawerPatientId = signal<string | null>(null);

  hasError = false;
  hasLoadedOnce = false;

  readonly tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { key: 'orders', label: 'Imaging Orders', icon: 'clipboard-list' },
    { key: 'scheduling', label: 'Scheduling', icon: 'calendar-clock' },
    { key: 'queue', label: 'Examination Queue', icon: 'list-ordered' },
    { key: 'study-tracking', label: 'Study Tracking & Image Review', icon: 'scan' },
    { key: 'reporting', label: 'Radiologist Reporting & Verification', icon: 'file-edit' },
    { key: 'critical-findings', label: 'Critical Findings', icon: 'alert-triangle' },
  ];

  constructor(
    private srv: RadiologyService,
    private toastSrv: ToastService,
    protected loadingSrv: LocalLoadingService,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.hasError = false;
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
          this.hasError = true;
          this.hasLoadedOnce = true;
        },
      });
  }

  setTab(key: TabKey): void { this.activeTab.set(key); }

  alertsBySeverity(): CriticalFindingAlert[] {
    const order: Record<RadiologyAlertSeverity, number> = { Critical: 0, High: 1, Warning: 2, Information: 3 };
    return [...this.alerts()].sort((a, b) => order[a.severity] - order[b.severity]);
  }

  alertTone(severity: RadiologyAlertSeverity): BadgeTone {
    switch (severity) {
      case 'Critical': return 'danger';
      case 'High': return 'danger';
      case 'Warning': return 'warning';
      default: return 'primary';
    }
  }

  alertBorderClass(severity: RadiologyAlertSeverity): string {
    switch (severity) {
      case 'Critical': return 'border-red-300';
      case 'High': return 'border-red-200';
      case 'Warning': return 'border-amber-300';
      default: return 'border-gray-200';
    }
  }

  alertIconClass(severity: RadiologyAlertSeverity): string {
    switch (severity) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-red-500';
      case 'Warning': return 'text-amber-600';
      default: return 'text-gray-500';
    }
  }

  acknowledgeAlert(alert: CriticalFindingAlert): void {
    this.srv.acknowledgeAlert(alert.id).subscribe(res => {
      if (res.success) {
        this.alerts.set(this.alerts().filter(a => a.id !== alert.id));
        if (this.stats() && alert.severity === 'Critical') {
          this.stats.update(s => s ? { ...s, criticalFindings: Math.max(0, s.criticalFindings - 1) } : s);
        }
        this.toastSrv.success('Finding acknowledged');
      } else {
        this.toastSrv.error('Unable to acknowledge finding');
      }
    });
  }

  openPatientDrawer(patientId: string): void {
    this.drawerPatientId.set(patientId);
    this.drawerOpen.set(true);
  }

  closePatientDrawer(): void {
    this.drawerOpen.set(false);
  }
}
