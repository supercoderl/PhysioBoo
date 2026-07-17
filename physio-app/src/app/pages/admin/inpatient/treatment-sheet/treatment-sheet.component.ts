import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { finalize, forkJoin } from "rxjs";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { TreatmentSheetService } from "../../../../services/admin/treatment-sheet.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { AlertSeverityLevel, ClinicalAlert, TreatmentPatientSummary, TreatmentStats } from "../../../../shared/types/treatment-sheet.types";
import { TreatmentImagingTabComponent } from "./tabs/treatment-imaging-tab.component";
import { TreatmentLaboratoryTabComponent } from "./tabs/treatment-laboratory-tab.component";
import { TreatmentMedicationsTabComponent } from "./tabs/treatment-medications-tab.component";
import { TreatmentNotesTabComponent } from "./tabs/treatment-notes-tab.component";
import { TreatmentOrdersTabComponent } from "./tabs/treatment-orders-tab.component";
import { TreatmentOverviewTabComponent } from "./tabs/treatment-overview-tab.component";
import { TreatmentProceduresTabComponent } from "./tabs/treatment-procedures-tab.component";
import { TreatmentTimelineTabComponent } from "./tabs/treatment-timeline-tab.component";

type TabKey = 'overview' | 'timeline' | 'orders' | 'medications' | 'procedures' | 'laboratory' | 'imaging' | 'notes';

const LOADING_KEY = 'treatment-sheet';

@Component({
  selector: 'admin-treatment-sheet',
  standalone: true,
  imports: [
    SharedModule,
    BooIconComponent,
    StatusBadgeComponent,
    StatCardComponent,
    TreatmentOverviewTabComponent,
    TreatmentTimelineTabComponent,
    TreatmentOrdersTabComponent,
    TreatmentMedicationsTabComponent,
    TreatmentProceduresTabComponent,
    TreatmentLaboratoryTabComponent,
    TreatmentImagingTabComponent,
    TreatmentNotesTabComponent,
  ],
  host: { class: 'block min-h-screen bg-gray-50' },
  template: `
    <!-- Loading -->
    <div *ngIf="loadingSrv.isLoading(LOADING_KEY) && !hasLoadedOnce" class="flex flex-col items-center justify-center py-24 gap-3">
      <boo-icon name="loader" [size]="32" iconClass="animate-spin text-primary"></boo-icon>
      <span class="text-gray-500 text-sm">Loading treatment sheet...</span>
    </div>

    <!-- Error -->
    <div *ngIf="hasError && !loadingSrv.isLoading(LOADING_KEY)" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <boo-icon name="alert-circle" [size]="20" iconClass="text-red-500"></boo-icon>
          <span class="text-red-700 text-sm">Unable to load the treatment sheet for this patient.</span>
        </div>
        <button (click)="load()" class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">Retry</button>
      </div>
    </div>

    <ng-container *ngIf="!hasError && hasLoadedOnce">
      <!-- Sticky patient summary header -->
      <div class="sticky top-0 z-20 bg-surface shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-start gap-3 min-w-0">
            <div class="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
              {{ initials(summary()?.fullName ?? '') }}
            </div>
            <div class="min-w-0">
              <div class="text-lg font-semibold text-gray-800 truncate">{{ summary()?.fullName }}</div>
              <div class="text-xs text-secondary">
                MRN {{ summary()?.mrn }} · Visit {{ summary()?.visitNumber }} · Bed {{ summary()?.bedNumber }} · {{ summary()?.wardName }} · {{ summary()?.departmentName }}
              </div>
              <div class="text-xs text-secondary mt-0.5">
                Admitted {{ summary()?.admissionDate | date:'mediumDate' }} · LOS {{ lengthOfStayDays() }} day(s) · Attending: {{ summary()?.attendingDoctorName }}
              </div>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <boo-status-badge *ngIf="summary()?.primaryDiagnosis" [label]="summary()!.primaryDiagnosis!" tone="primary"></boo-status-badge>
                <boo-status-badge *ngIf="summary()?.isolationStatus" [label]="'Isolation: ' + summary()!.isolationStatus" tone="warning" [dotted]="true"></boo-status-badge>
                <boo-status-badge *ngFor="let a of summary()?.allergies" [label]="'Allergy: ' + a" tone="danger" [dotted]="true"></boo-status-badge>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button (click)="printSheet()" class="px-3 py-2 bg-surface border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm">
              <boo-icon name="printer" [size]="16"></boo-icon> Print Sheet
            </button>
            <button (click)="exportPdf()" class="px-3 py-2 bg-surface border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm">
              <boo-icon name="file-down" [size]="16"></boo-icon> Export PDF
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
            <boo-icon [name]="alertIcon(a.type)" [size]="18" [ngClass]="alertIconClass(a.severity)"></boo-icon>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <boo-status-badge [label]="a.severity" [tone]="alertTone(a.severity)"></boo-status-badge>
              </div>
              <p class="text-xs text-gray-700 mt-1">{{ a.message }}</p>
            </div>
            <button (click)="acknowledgeAlert(a)" class="text-gray-400 hover:text-gray-600" aria-label="Acknowledge alert">
              <boo-icon name="x" [size]="16"></boo-icon>
            </button>
          </div>
        </div>

        <!-- Stats strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <boo-stat-card label="Active Orders" [value]="stats()?.activeOrders ?? 0" icon="clipboard-list" tone="primary"></boo-stat-card>
          <boo-stat-card label="Completed Orders" [value]="stats()?.completedOrders ?? 0" icon="circle-check" tone="success"></boo-stat-card>
          <boo-stat-card label="Pending Orders" [value]="stats()?.pendingOrders ?? 0" icon="clock" tone="neutral"></boo-stat-card>
          <boo-stat-card label="Medication Due" [value]="stats()?.medicationDue ?? 0" icon="pill" tone="warning"></boo-stat-card>
          <boo-stat-card label="Critical Alerts" [value]="stats()?.criticalAlerts ?? 0" icon="alert-triangle" tone="danger"></boo-stat-card>
          <boo-stat-card label="Pending Labs" [value]="stats()?.pendingLabs ?? 0" icon="flask-conical" tone="primary"></boo-stat-card>
          <boo-stat-card label="Pending Imaging" [value]="stats()?.pendingImaging ?? 0" icon="scan" tone="primary"></boo-stat-card>
        </div>

        <!-- Quick actions -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button (click)="setTab('orders')" class="bg-surface border border-gray-200 rounded-lg py-3 hover:border-primary/40 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
            <boo-icon name="plus-circle" [size]="18" iconClass="text-primary"></boo-icon> Add Order
          </button>
          <button (click)="setTab('notes')" class="bg-surface border border-gray-200 rounded-lg py-3 hover:border-primary/40 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
            <boo-icon name="file-plus" [size]="18" iconClass="text-primary"></boo-icon> Add Progress Note
          </button>
          <button (click)="setTab('laboratory')" class="bg-surface border border-gray-200 rounded-lg py-3 hover:border-primary/40 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
            <boo-icon name="flask-conical" [size]="18" iconClass="text-primary"></boo-icon> View Laboratory
          </button>
          <button (click)="setTab('imaging')" class="bg-surface border border-gray-200 rounded-lg py-3 hover:border-primary/40 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
            <boo-icon name="scan" [size]="18" iconClass="text-primary"></boo-icon> View Imaging
          </button>
        </div>

        <!-- Tab content -->
        <treatment-overview-tab *ngIf="activeTab() === 'overview'" [patientId]="patientId" />
        <treatment-timeline-tab *ngIf="activeTab() === 'timeline'" [patientId]="patientId" />
        <treatment-orders-tab *ngIf="activeTab() === 'orders'" [patientId]="patientId" />
        <treatment-medications-tab *ngIf="activeTab() === 'medications'" [patientId]="patientId" />
        <treatment-procedures-tab *ngIf="activeTab() === 'procedures'" [patientId]="patientId" />
        <treatment-laboratory-tab *ngIf="activeTab() === 'laboratory'" [patientId]="patientId" />
        <treatment-imaging-tab *ngIf="activeTab() === 'imaging'" [patientId]="patientId" />
        <treatment-notes-tab *ngIf="activeTab() === 'notes'" [patientId]="patientId" />
      </main>
    </ng-container>
  `,
})
export class AdminTreatmentSheetComponent implements OnInit {
  readonly LOADING_KEY = LOADING_KEY;

  patientId!: string;
  summary = signal<TreatmentPatientSummary | null>(null);
  stats = signal<TreatmentStats | null>(null);
  alerts = signal<ClinicalAlert[]>([]);
  activeTab = signal<TabKey>('overview');

  hasError = false;
  hasLoadedOnce = false;

  readonly tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
    { key: 'timeline', label: 'Timeline', icon: 'history' },
    { key: 'orders', label: 'Orders', icon: 'clipboard-list' },
    { key: 'medications', label: 'Medications', icon: 'pill' },
    { key: 'procedures', label: 'Procedures', icon: 'stethoscope' },
    { key: 'laboratory', label: 'Laboratory', icon: 'flask-conical' },
    { key: 'imaging', label: 'Imaging', icon: 'scan' },
    { key: 'notes', label: 'Notes', icon: 'file-text' },
  ];

  constructor(
    private srv: TreatmentSheetService,
    private route: ActivatedRoute,
    private toastSrv: ToastService,
    protected loadingSrv: LocalLoadingService,
  ) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientId')
      ?? this.route.snapshot.queryParamMap.get('patientId')
      ?? 'pat-1001';
    this.load();
  }

  load(): void {
    this.hasError = false;
    this.loadingSrv.setLoading(LOADING_KEY, true);

    forkJoin({
      summary: this.srv.getSummary(this.patientId),
      stats: this.srv.getStats(this.patientId),
      alerts: this.srv.getAlerts(this.patientId),
    })
      .pipe(finalize(() => this.loadingSrv.setLoading(LOADING_KEY, false)))
      .subscribe({
        next: ({ summary, stats, alerts }) => {
          if (summary.success) this.summary.set(summary.data);
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

  lengthOfStayDays(): number {
    const admitted = this.summary()?.admissionDate;
    if (!admitted) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(admitted).getTime()) / 86_400_000));
  }

  initials(name: string): string {
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] ?? '') + (p.at(-1)?.[0] ?? '')).toUpperCase();
  }

  alertsBySeverity(): ClinicalAlert[] {
    const order: Record<AlertSeverityLevel, number> = { Critical: 0, High: 1, Warning: 2, Information: 3 };
    return [...this.alerts()].sort((a, b) => order[a.severity] - order[b.severity]);
  }

  alertTone(severity: AlertSeverityLevel): BadgeTone {
    switch (severity) {
      case 'Critical': return 'danger';
      case 'High': return 'danger';
      case 'Warning': return 'warning';
      default: return 'primary';
    }
  }

  alertIcon(type: ClinicalAlert['type']): string {
    switch (type) {
      case 'Allergy': return 'alert-triangle';
      case 'DrugInteraction': return 'pill';
      case 'AbnormalLab': return 'flask-conical';
      case 'CriticalVitals': return 'activity';
      case 'InfectionControl': return 'biohazard';
      case 'Isolation': return 'shield-alert';
      default: return 'bell';
    }
  }

  alertBorderClass(severity: AlertSeverityLevel): string {
    switch (severity) {
      case 'Critical': return 'border-red-300';
      case 'High': return 'border-red-200';
      case 'Warning': return 'border-amber-300';
      default: return 'border-gray-200';
    }
  }

  alertIconClass(severity: AlertSeverityLevel): string {
    switch (severity) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-red-500';
      case 'Warning': return 'text-amber-600';
      default: return 'text-gray-500';
    }
  }

  acknowledgeAlert(alert: ClinicalAlert): void {
    this.srv.acknowledgeAlert(alert.id).subscribe(res => {
      if (res.success) {
        this.alerts.set(this.alerts().filter(a => a.id !== alert.id));
        if (this.stats()) this.stats.update(s => s ? { ...s, criticalAlerts: Math.max(0, s.criticalAlerts - (alert.severity === 'Critical' ? 1 : 0)) } : s);
        this.toastSrv.success('Alert acknowledged');
      } else {
        this.toastSrv.error('Unable to acknowledge alert');
      }
    });
  }

  printSheet(): void {
    window.print();
  }

  exportPdf(): void {
    this.toastSrv.info('Export PDF — not wired yet');
  }
}
