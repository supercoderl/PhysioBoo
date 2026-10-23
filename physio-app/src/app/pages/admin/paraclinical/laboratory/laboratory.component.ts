import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { finalize, forkJoin } from "rxjs";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { LaboratoryService } from "../../../../services/admin/laboratory.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { LabAlertSeverity, LabCriticalAlert, LabStats } from "../../../../shared/types/laboratory.types";
import { LaboratoryPatientResultDrawerComponent } from "./patient-result-drawer.component";
import { LaboratoryCriticalAlertsTabComponent } from "./tabs/laboratory-critical-alerts-tab.component";
import { LaboratoryDashboardTabComponent } from "./tabs/laboratory-dashboard-tab.component";
import { LaboratoryOrdersTabComponent } from "./tabs/laboratory-orders-tab.component";
import { LaboratoryResultVerificationTabComponent } from "./tabs/laboratory-result-verification-tab.component";
import { LaboratorySampleTrackingTabComponent } from "./tabs/laboratory-sample-tracking-tab.component";
import { alertTone } from "./laboratory-display";

type TabKey = 'dashboard' | 'orders' | 'sample-tracking' | 'result-verification' | 'critical-alerts';

const LOADING_KEY = 'laboratory';

@Component({
  selector: 'admin-laboratory',
  standalone: true,
  imports: [
    SharedModule,

    BooErrorStateComponent,
    BooStatusBadgeComponent,
    StatCardComponent,
    LaboratoryDashboardTabComponent,
    LaboratoryOrdersTabComponent,
    LaboratorySampleTrackingTabComponent,
    LaboratoryResultVerificationTabComponent,
    LaboratoryCriticalAlertsTabComponent,
    LaboratoryPatientResultDrawerComponent,
    BooButtonComponent,
    BooEmptyStateComponent
  ],
  host: { class: 'block min-h-screen bg-gray-50' },
  template: `
    <!-- No access -->
    <div *ngIf="!canRead" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <boo-empty-state appearance="panel" icon="lock" title="You don't have access to the laboratory"
        description="Ask an administrator for the laboratory order read permission." />
    </div>

    <!-- Loading -->
    <div *ngIf="canRead && loadingSrv.isLoading(LOADING_KEY) && !hasLoadedOnce" class="flex flex-col items-center justify-center py-24 gap-3" role="status">
      <physio-icon name="loader" [size]="32" [class]="'animate-spin text-primary'"></physio-icon>
      <span class="text-gray-500 text-sm">Loading laboratory workspace...</span>
    </div>

    <!-- Error -->
    <div *ngIf="canRead && error() && !loadingSrv.isLoading(LOADING_KEY)" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <boo-error-state title="Couldn't load laboratory workspace" [description]="error()" (retry)="retryLoad()"></boo-error-state>
    </div>

    <ng-container *ngIf="canRead && !error() && hasLoadedOnce">
      <!-- Sticky module header -->
      <div class="sticky top-0 z-20 bg-surface shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-lg font-semibold text-gray-800">Laboratory</h1>
            <p class="text-xs text-secondary">Laboratory Information System — orders, samples, results, and verification</p>
          </div>
          <button boo-button variant="secondary" size="sm" type="button" [loading]="refreshing()" (click)="refresh()">
            <physio-icon name="refresh-cw" [size]="16"></physio-icon> Refresh
          </button>
        </div>

        <!-- Tab nav -->
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-200 flex items-center gap-1 overflow-x-auto" role="tablist">
          <button *ngFor="let t of tabs" type="button" (click)="setTab(t.key)" [attr.aria-selected]="activeTab() === t.key" role="tab"
            class="px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 -mb-px whitespace-nowrap"
            [ngClass]="activeTab() === t.key ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary hover:border-gray-300'">
            <physio-icon [name]="t.icon" class="w-4 h-4"></physio-icon>
            {{ t.label }}
          </button>
        </nav>
      </div>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Critical result alerts banner -->
        <div *ngIf="alerts().length > 0" class="mb-6 flex gap-3 overflow-x-auto pb-1" aria-live="polite">
          <div *ngFor="let a of alertsBySeverity()" class="shrink-0 min-w-[280px] bg-surface border rounded-lg p-3 flex items-start gap-2"
            [ngClass]="alertBorderClass(a.severity)">
            <physio-icon name="triangle-alert" [size]="18" [ngClass]="alertIconClass(a.severity)"></physio-icon>
            <div class="flex-1 min-w-0">
              <boo-status-badge [label]="a.severity" [tone]="alertTone(a.severity)"></boo-status-badge>
              <p class="text-xs text-gray-700 mt-1">{{ a.description }}</p>
            </div>
            <button *ngIf="canAcknowledge" type="button" (click)="acknowledgeAlert(a)" [disabled]="acknowledgingId() === a.id"
              class="text-gray-400 hover:text-gray-600 disabled:opacity-40" [attr.aria-label]="'Acknowledge ' + a.severity + ' alert'">
              <physio-icon name="x" [size]="16"></physio-icon>
            </button>
          </div>
        </div>

        <!-- Stats strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          <boo-stat-card label="Total Orders" [value]="stats()?.totalOrders ?? 0" icon="clipboard-list" tone="primary"></boo-stat-card>
          <boo-stat-card label="Pending Collection" [value]="stats()?.pendingCollection ?? 0" icon="syringe" tone="neutral"></boo-stat-card>
          <boo-stat-card label="Collected" [value]="stats()?.collectedSamples ?? 0" icon="test-tube" tone="primary"></boo-stat-card>
          <boo-stat-card label="In Processing" [value]="stats()?.inProcessing ?? 0" icon="loader" tone="primary"></boo-stat-card>
          <boo-stat-card label="Pending Verification" [value]="stats()?.pendingVerification ?? 0" icon="clipboard-check" tone="warning"></boo-stat-card>
          <boo-stat-card label="Completed" [value]="stats()?.completedTests ?? 0" icon="circle-check" tone="success"></boo-stat-card>
          <boo-stat-card label="Critical Results" [value]="stats()?.criticalResults ?? 0" icon="triangle-alert" tone="danger"></boo-stat-card>
          <boo-stat-card label="Avg TAT (hrs)" [value]="stats()?.averageTatHours ?? 0" icon="timer" tone="neutral"></boo-stat-card>
        </div>

        <!-- Tab content -->
        <laboratory-dashboard-tab *ngIf="activeTab() === 'dashboard'" [refreshKey]="refreshKey()" />
        <laboratory-orders-tab *ngIf="activeTab() === 'orders'" [refreshKey]="refreshKey()" (viewPatient)="openPatientDrawer($event)" />
        <laboratory-sample-tracking-tab *ngIf="activeTab() === 'sample-tracking'" [refreshKey]="refreshKey()" (changed)="reloadSummary()" />
        <laboratory-result-verification-tab *ngIf="activeTab() === 'result-verification'" [refreshKey]="refreshKey()" (changed)="reloadSummary()" />
        <laboratory-critical-alerts-tab *ngIf="activeTab() === 'critical-alerts'" [refreshKey]="refreshKey()" (changed)="reloadSummary()" />
      </main>
    </ng-container>

    <laboratory-patient-result-drawer [isOpen]="drawerOpen()" [mrn]="drawerMrn()" (close)="closePatientDrawer()" />
  `,
})
export class AdminLaboratoryComponent implements OnInit {
  readonly LOADING_KEY = LOADING_KEY;

  stats = signal<LabStats | null>(null);
  alerts = signal<LabCriticalAlert[]>([]);
  activeTab = signal<TabKey>('dashboard');
  drawerOpen = signal(false);
  drawerMrn = signal<string | null>(null);

  error = signal<string | null>(null);
  hasLoadedOnce = false;
  /** Bumped by Refresh so the open tab reloads its list in place. */
  refreshKey = signal(0);
  refreshing = signal(false);
  acknowledgingId = signal<string | null>(null);

  private readonly authSrv = inject(AuthService);

  readonly canRead = this.authSrv.hasPermission(Permissions.Lab.LabOrderRead);
  readonly canAcknowledge = this.authSrv.hasPermission(Permissions.Lab.AlertAcknowledge);
  readonly alertTone = alertTone;

  readonly tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { key: 'orders', label: 'Orders', icon: 'clipboard' },
    { key: 'sample-tracking', label: 'Sample Collection & Tracking', icon: 'test-tube' },
    { key: 'result-verification', label: 'Result Entry & Verification', icon: 'clipboard-check' },
    { key: 'critical-alerts', label: 'Critical Alerts', icon: 'triangle-alert' },
  ];

  constructor(
    private route: ActivatedRoute,
    private srv: LaboratoryService,
    private toastSrv: ToastService,
    protected loadingSrv: LocalLoadingService,
  ) { }

  ngOnInit(): void {
    if (!this.canRead) return;
    this.load();
    // Deep link from the treatment sheet, surgery or medical record: ?patient=<id or MRN>
    const patient = this.route.snapshot.queryParamMap.get('patient');
    if (patient) this.openPatientDrawer(patient);
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
          this.error.set('Failed to load the laboratory workspace. Please try again.');
          this.hasLoadedOnce = true;
        },
      });
  }

  retryLoad(): void { this.load(); }

  /** Reloads the counters and the alert banner after a tab changed something, without a loading state. */
  reloadSummary(): void {
    forkJoin({ stats: this.srv.getStats(), alerts: this.srv.getAlerts() })
      .pipe(finalize(() => this.refreshing.set(false)))
      .subscribe({
        next: ({ stats, alerts }) => {
          if (stats.success) this.stats.set(stats.data);
          if (alerts.success) this.alerts.set(alerts.data.filter(a => !a.acknowledged));
        },
      });
  }

  refresh(): void {
    if (this.refreshing()) return;
    this.refreshing.set(true);
    this.refreshKey.update(k => k + 1);
    this.reloadSummary();
  }

  setTab(key: TabKey): void { this.activeTab.set(key); }

  alertsBySeverity(): LabCriticalAlert[] {
    const order: Record<LabAlertSeverity, number> = { Critical: 0, High: 1, Warning: 2, Information: 3 };
    return [...this.alerts()].sort((a, b) => order[a.severity] - order[b.severity]);
  }

  alertBorderClass(severity: LabAlertSeverity): string {
    switch (severity) {
      case 'Critical': return 'border-red-300';
      case 'High': return 'border-red-200';
      case 'Warning': return 'border-amber-300';
      default: return 'border-gray-200';
    }
  }

  alertIconClass(severity: LabAlertSeverity): string {
    switch (severity) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-red-500';
      case 'Warning': return 'text-amber-600';
      default: return 'text-gray-500';
    }
  }

  acknowledgeAlert(alert: LabCriticalAlert): void {
    if (this.acknowledgingId()) return;
    this.acknowledgingId.set(alert.id);
    this.srv.acknowledgeAlert(alert.id).pipe(finalize(() => this.acknowledgingId.set(null))).subscribe(res => {
      if (res.success) {
        this.toastSrv.success('Alert acknowledged');
        this.refreshKey.update(k => k + 1);
        this.reloadSummary();
      } else {
        this.toastSrv.error('Unable to acknowledge alert');
      }
    });
  }

  openPatientDrawer(mrn: string): void {
    this.drawerMrn.set(mrn);
    this.drawerOpen.set(true);
  }

  closePatientDrawer(): void {
    this.drawerOpen.set(false);
  }
}
