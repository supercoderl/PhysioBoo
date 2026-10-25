import { HttpContext, HttpErrorResponse } from "@angular/common/http";
import { Component, DestroyRef, OnInit, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { finalize, forkJoin } from "rxjs";
import { BooBadgeTone, BooEmptyStateComponent, BooErrorStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { AdmissionService } from "../../../../services/admin/admission.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { SKIP_ERROR_TOAST } from "../../../../shared/contexts/option.context";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { TreatmentSheetService } from "../../../../services/admin/treatment-sheet.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { AlertSeverityLevel, ClinicalAlert, TreatmentPatientSummary, TreatmentStats } from "../../../../shared/types/treatment-sheet.types";
import { escapeHtml, htmlTable, printHtmlDocument } from "../../../../shared/utils/print.utils";
import { TreatmentImagingTabComponent } from "./tabs/treatment-imaging-tab.component";
import { TreatmentLaboratoryTabComponent } from "./tabs/treatment-laboratory-tab.component";
import { TreatmentMedicationsTabComponent } from "./tabs/treatment-medications-tab.component";
import { TreatmentNotesTabComponent } from "./tabs/treatment-notes-tab.component";
import { TreatmentOrdersTabComponent } from "./tabs/treatment-orders-tab.component";
import { TreatmentOverviewTabComponent } from "./tabs/treatment-overview-tab.component";
import { TreatmentProceduresTabComponent } from "./tabs/treatment-procedures-tab.component";
import { TreatmentTimelineTabComponent } from "./tabs/treatment-timeline-tab.component";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { ButtonIconComponent } from "../../../../components/button/button-icon/button-icon.component";

type TabKey = 'overview' | 'timeline' | 'orders' | 'medications' | 'procedures' | 'laboratory' | 'imaging' | 'notes';

const LOADING_KEY = 'treatment-sheet';
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Component({
  selector: 'admin-treatment-sheet',
  standalone: true,
  imports: [
    SharedModule,

    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooSelectComponent,
    BooStatusBadgeComponent,
    StatCardComponent,
    TreatmentOverviewTabComponent,
    TreatmentTimelineTabComponent,
    TreatmentOrdersTabComponent,
    TreatmentMedicationsTabComponent,
    TreatmentProceduresTabComponent,
    TreatmentLaboratoryTabComponent,
    TreatmentImagingTabComponent,
    TreatmentNotesTabComponent,
    BooButtonAdminComponent,
    ButtonIconComponent
  ],
  template: `
    <!-- No patient selected -->
    <div *ngIf="!patientId" class="mx-auto max-w-xl pt-8">
      <boo-error-state *ngIf="patientsError()" title="Couldn't load admitted patients" [description]="patientsError()" (retry)="loadAdmittedPatients()"></boo-error-state>
      <ng-container *ngIf="!patientsError()">
        <boo-empty-state icon="clipboard-list" title="Select an inpatient" description="Choose a currently admitted patient to open their treatment sheet."></boo-empty-state>
        <boo-select label="Admitted patient" [options]="patientOptions()" [ngModel]="null" (ngModelChange)="selectPatient($event)"></boo-select>
        <p *ngIf="patientsLoading()" class="text-xs text-secondary mt-2" aria-live="polite">Loading admitted patients...</p>
        <p *ngIf="!patientsLoading() && !patientOptions().length" class="text-xs text-secondary mt-2">There are no admitted patients.</p>
      </ng-container>
    </div>

    <!-- Loading -->
    <div *ngIf="patientId && loadingSrv.isLoading(LOADING_KEY) && !hasLoadedOnce" class="flex flex-col items-center justify-center py-24 gap-3">
      <physio-icon name="loader" [size]="32" [class]="'animate-spin text-primary'"></physio-icon>
      <span class="text-gray-500 text-sm">Loading treatment sheet...</span>
    </div>

    <!-- Error -->
    <div *ngIf="patientId && error() && !loadingSrv.isLoading(LOADING_KEY)" class="pt-4">
      <boo-empty-state *ngIf="noActiveStay()" icon="bed" title="No active inpatient stay" [description]="error()"></boo-empty-state>
      <boo-error-state *ngIf="!noActiveStay()" title="Couldn't load the treatment sheet" [description]="error()" (retry)="retryLoad()"></boo-error-state>
      <div class="mt-4 flex justify-center">
        <button-icon [icon]="{ name: 'users', size: 16 }" (onClick)="changePatient()"> Choose another patient </button-icon>
      </div>
    </div>

    <ng-container *ngIf="patientId && !error() && hasLoadedOnce">
      <!-- Sticky patient summary header -->
      <div class="mb-4 shrink-0 rounded-2 border border-borderGray/60 bg-surface">
        <div class="px-4 py-4 flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-start gap-3 min-w-0">
            <div class="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
              {{ initials(summary()?.fullName ?? '') }}
            </div>
            <div class="min-w-0">
              <div class="text-lg font-semibold text-gray-800 truncate">{{ summary()?.fullName }}</div>
              <div class="text-xs text-secondary">
                MRN {{ summary()?.mrn }} · Visit {{ summary()?.visitNumber }} · Bed {{ summary()?.bedNumber || '—' }} · {{ summary()?.wardName || '—' }} · {{ summary()?.departmentName }}
              </div>
              <div class="text-xs text-secondary mt-0.5">
                Admitted {{ summary()?.admissionDate | date:'mediumDate' }} · LOS {{ lengthOfStayDays() }} day(s) · Attending: {{ summary()?.attendingDoctorName || '—' }}
              </div>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <boo-status-badge *ngIf="summary()?.primaryDiagnosis" [label]="summary()!.primaryDiagnosis!" tone="primary"></boo-status-badge>
                <boo-status-badge *ngIf="summary()?.isolationStatus" [label]="'Isolation: ' + summary()!.isolationStatus" tone="warning" [dotted]="true"></boo-status-badge>
                <boo-status-badge *ngFor="let a of summary()?.allergies" [label]="'Allergy: ' + a" tone="danger" [dotted]="true"></boo-status-badge>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <button-icon [icon]="{ name: 'users', size: 16 }" (onClick)="changePatient()"> Change patient </button-icon>
            <button-icon [icon]="{ name: 'printer', size: 16 }" (onClick)="printSheet()"> Print Sheet </button-icon>
            <button-icon [icon]="{ name: 'file-down', size: 16 }" (onClick)="exportPdf()"> Export PDF </button-icon>
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
            <physio-icon [name]="alertIcon(a.type)" [size]="18" [ngClass]="alertIconClass(a.severity)"></physio-icon>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <boo-status-badge [label]="a.severity" [tone]="alertTone(a.severity)"></boo-status-badge>
              </div>
              <p class="text-xs text-gray-700 mt-1">{{ a.message }}</p>
            </div>
            <button *ngIf="canWrite" type="button" (click)="acknowledgeAlert(a)" class="text-gray-400 hover:text-gray-600" aria-label="Acknowledge alert">
              <physio-icon name="x" [size]="16"></physio-icon>
            </button>
          </div>
        </div>

        <!-- Stats strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <boo-stat-card label="Active Orders" [value]="stats()?.activeOrders ?? 0" icon="clipboard-list" tone="primary"></boo-stat-card>
          <boo-stat-card label="Completed Orders" [value]="stats()?.completedOrders ?? 0" icon="circle-check" tone="success"></boo-stat-card>
          <boo-stat-card label="Pending Orders" [value]="stats()?.pendingOrders ?? 0" icon="clock" tone="neutral"></boo-stat-card>
          <boo-stat-card label="Medication Due" [value]="stats()?.medicationDue ?? 0" icon="pill" tone="warning"></boo-stat-card>
          <boo-stat-card label="Critical Alerts" [value]="stats()?.criticalAlerts ?? 0" icon="triangle-alert" tone="danger"></boo-stat-card>
          <boo-stat-card label="Pending Labs" [value]="stats()?.pendingLabs ?? 0" icon="flask-conical" tone="primary"></boo-stat-card>
          <boo-stat-card label="Pending Imaging" [value]="stats()?.pendingImaging ?? 0" icon="scan" tone="primary"></boo-stat-card>
        </div>

        <!-- Quick actions -->
        <div *ngIf="canWrite" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <boo-button-admin (click)="setTab('orders')" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#EFE3E7' }" padding="12px 12px" [fontSize]="14" [radius]="8" fontWeight="500" [gap]="8" buttonClass="w-full" class="w-full">
            <physio-icon name="circle-plus" [size]="18" class="text-primary"></physio-icon> Add Order
          </boo-button-admin>
          <boo-button-admin (click)="setTab('notes')" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#EFE3E7' }" padding="12px 12px" [fontSize]="14" [radius]="8" fontWeight="500" [gap]="8" buttonClass="w-full" class="w-full">
            <physio-icon name="file-plus" [size]="18" class="text-primary"></physio-icon> Add Progress Note
          </boo-button-admin>
          <boo-button-admin (click)="setTab('laboratory')" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#EFE3E7' }" padding="12px 12px" [fontSize]="14" [radius]="8" fontWeight="500" [gap]="8" buttonClass="w-full" class="w-full">
            <physio-icon name="flask-conical" [size]="18" class="text-primary"></physio-icon> View Laboratory
          </boo-button-admin>
          <boo-button-admin (click)="setTab('imaging')" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#EFE3E7' }" padding="12px 12px" [fontSize]="14" [radius]="8" fontWeight="500" [gap]="8" buttonClass="w-full" class="w-full">
            <physio-icon name="scan" [size]="18" class="text-primary"></physio-icon> View Imaging
          </boo-button-admin>
        </div>

        <!-- Tab content. Tabs with forms stay mounted once opened so unsaved entries survive tab switches. -->
        <treatment-overview-tab *ngIf="activeTab() === 'overview'" [patientId]="patientId" />
        <treatment-timeline-tab *ngIf="activeTab() === 'timeline'" [patientId]="patientId" />
        <treatment-orders-tab *ngIf="visited().has('orders')" [hidden]="activeTab() !== 'orders'" [patientId]="patientId" [canWrite]="canWrite" (changed)="refreshSideData()" />
        <treatment-medications-tab *ngIf="visited().has('medications')" [hidden]="activeTab() !== 'medications'" [patientId]="patientId" [canWrite]="canWrite" (changed)="refreshSideData()" />
        <treatment-procedures-tab *ngIf="visited().has('procedures')" [hidden]="activeTab() !== 'procedures'" [patientId]="patientId" [canWrite]="canWrite" (changed)="refreshSideData()" />
        <treatment-laboratory-tab *ngIf="activeTab() === 'laboratory'" [patientId]="patientId" />
        <treatment-imaging-tab *ngIf="activeTab() === 'imaging'" [patientId]="patientId" />
        <treatment-notes-tab *ngIf="visited().has('notes')" [hidden]="activeTab() !== 'notes'" [patientId]="patientId" [canWrite]="canWrite" (changed)="refreshSideData()" />
      </main>
    </ng-container>
  `,
})
export class AdminTreatmentSheetComponent implements OnInit {
  readonly LOADING_KEY = LOADING_KEY;

  patientId: string | null = null;
  summary = signal<TreatmentPatientSummary | null>(null);
  stats = signal<TreatmentStats | null>(null);
  alerts = signal<ClinicalAlert[]>([]);
  activeTab = signal<TabKey>('overview');
  visited = signal<ReadonlySet<TabKey>>(new Set());

  error = signal<string | null>(null);
  noActiveStay = signal(false);
  hasLoadedOnce = false;

  patientOptions = signal<{ label: string; value: string }[]>([]);
  patientsLoading = signal(false);
  patientsError = signal<string | null>(null);

  readonly canWrite = inject(AuthService).hasPermission(Permissions.Inpatient.TreatmentSheetWrite);

  private readonly destroyRef = inject(DestroyRef);
  private readonly silent = new HttpContext().set(SKIP_ERROR_TOAST, true);

  readonly tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
    { key: 'timeline', label: 'Timeline', icon: 'clipboard' },
    { key: 'orders', label: 'Orders', icon: 'clipboard-list' },
    { key: 'medications', label: 'Medications', icon: 'pill' },
    { key: 'procedures', label: 'Procedures', icon: 'stethoscope' },
    { key: 'laboratory', label: 'Laboratory', icon: 'flask-conical' },
    { key: 'imaging', label: 'Imaging', icon: 'scan' },
    { key: 'notes', label: 'Notes', icon: 'file-text' },
  ];

  constructor(
    private srv: TreatmentSheetService,
    private admissionSrv: AdmissionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastSrv: ToastService,
    protected loadingSrv: LocalLoadingService,
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(q => this.openPatient(this.route.snapshot.paramMap.get('patientId') ?? q.get('patientId')));
  }

  /** Switches the sheet to another patient, discarding everything (including tab drafts) held for the previous one. */
  private openPatient(id: string | null): void {
    if (id === this.patientId && (id === null || this.hasLoadedOnce)) return;
    this.patientId = id;
    this.summary.set(null);
    this.stats.set(null);
    this.alerts.set([]);
    this.activeTab.set('overview');
    this.visited.set(new Set());
    this.noActiveStay.set(false);
    this.error.set(null);
    this.hasLoadedOnce = false;

    if (!id) {
      this.loadAdmittedPatients();
    } else if (!GUID.test(id)) {
      this.error.set('This link does not identify a patient. Choose an admitted patient instead.');
      this.hasLoadedOnce = true;
    } else {
      this.load();
    }
  }

  loadAdmittedPatients(): void {
    this.patientsLoading.set(true);
    this.patientsError.set(null);
    this.admissionSrv.search({
      pageNumber: 1,
      pageSize: 100,
      sort: 'admittedat',
      filter: { start: null, end: null, status: 'Admitted', type: null, departmentId: null },
    }, this.silent)
      .pipe(finalize(() => this.patientsLoading.set(false)))
      .subscribe({
        next: res => {
          if (!res.success || !res.data) { this.patientsError.set('The admitted patient list could not be loaded.'); return; }
          this.patientOptions.set(res.data.items.map(a => ({
            label: `${a.patientName} · ${a.patientNumber}${a.bedNumber ? ` · Bed ${a.bedNumber}` : ''}`,
            value: a.patientId,
          })));
        },
        error: () => this.patientsError.set('The admitted patient list could not be loaded.'),
      });
  }

  selectPatient(patientId: string | null): void {
    if (patientId) this.router.navigate([], { relativeTo: this.route, queryParams: { patientId }, queryParamsHandling: 'merge' });
  }

  changePatient(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { patientId: null }, queryParamsHandling: 'merge' });
  }

  load(): void {
    if (!this.patientId) return;
    this.error.set(null);
    this.noActiveStay.set(false);
    this.loadingSrv.setLoading(LOADING_KEY, true);

    forkJoin({
      summary: this.srv.getSummary(this.patientId),
      stats: this.srv.getStats(this.patientId),
      alerts: this.srv.getAlerts(this.patientId),
    })
      .pipe(finalize(() => this.loadingSrv.setLoading(LOADING_KEY, false)))
      .subscribe({
        next: ({ summary, stats, alerts }) => {
          if (!summary.success || !summary.data) {
            this.error.set('Failed to load the treatment sheet for this patient. Please try again.');
          } else {
            this.summary.set(summary.data);
            if (stats.success) this.stats.set(stats.data);
            if (alerts.success) this.alerts.set(alerts.data.filter(a => !a.acknowledged));
          }
          this.hasLoadedOnce = true;
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            this.noActiveStay.set(true);
            this.error.set('This patient has no active admission, so there is no treatment sheet to show.');
          } else {
            this.error.set('Failed to load the treatment sheet for this patient. Please try again.');
          }
          this.hasLoadedOnce = true;
        },
      });
  }

  /** Re-reads the counters and alerts after a tab saved something; on failure the numbers already shown stay. */
  refreshSideData(): void {
    if (!this.patientId) return;
    forkJoin({ stats: this.srv.getStats(this.patientId), alerts: this.srv.getAlerts(this.patientId) })
      .subscribe({
        next: ({ stats, alerts }) => {
          if (stats.success) this.stats.set(stats.data);
          if (alerts.success) this.alerts.set(alerts.data.filter(a => !a.acknowledged));
        },
      });
  }

  retryLoad(): void {
    this.hasLoadedOnce = false;
    this.load();
  }

  setTab(key: TabKey): void {
    this.activeTab.set(key);
    this.visited.update(v => new Set(v).add(key));
  }

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

  alertTone(severity: AlertSeverityLevel): BooBadgeTone {
    switch (severity) {
      case 'Critical': return 'danger';
      case 'High': return 'danger';
      case 'Warning': return 'warning';
      default: return 'primary';
    }
  }

  alertIcon(type: ClinicalAlert['type']): string {
    switch (type) {
      case 'Allergy': return 'triangle-alert';
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
    if (!this.canWrite) return;
    this.srv.acknowledgeAlert(alert.id).subscribe(res => {
      if (res.success) {
        this.alerts.set(this.alerts().filter(a => a.id !== alert.id));
        this.refreshSideData();
        this.toastSrv.success('Alert acknowledged');
      } else {
        this.toastSrv.error('Unable to acknowledge alert');
      }
    });
  }

  printSheet(): void {
    window.print();
  }

  /** Treatment sheet (orders, medication record, notes) printed via the browser — "Save as PDF" exports it. */
  exportPdf(): void {
    const p = this.summary();
    const patientId = this.patientId;
    if (!p || !patientId) return;
    forkJoin({
      orders: this.srv.getOrders(patientId),
      meds: this.srv.getMedications(patientId),
      notes: this.srv.getNotes(patientId),
    }).subscribe({
      next: ({ orders, meds, notes }) => {
        const when = (v?: string | null) => v ? new Date(v).toLocaleString() : '';
        const body = `
          <h1>Treatment sheet</h1>
          <div class="grid">
            <div><strong>Patient:</strong> ${escapeHtml(p.fullName)}</div><div><strong>MRN:</strong> ${escapeHtml(p.mrn)}</div>
            <div><strong>Ward / bed:</strong> ${escapeHtml(p.wardName)} / ${escapeHtml(p.bedNumber)}</div><div><strong>Department:</strong> ${escapeHtml(p.departmentName)}</div>
            <div><strong>Admitted:</strong> ${escapeHtml(when(p.admissionDate))}</div><div><strong>Attending:</strong> ${escapeHtml(p.attendingDoctorName)}</div>
            <div><strong>Diagnosis:</strong> ${escapeHtml(p.primaryDiagnosis ?? '—')}</div><div><strong>Allergies:</strong> ${escapeHtml(p.allergies.join(', ') || 'None known')}</div>
          </div>
          <h2>Orders</h2>
          ${htmlTable(['Order', 'Type', 'Priority', 'Frequency', 'Start', 'Status', 'Ordered by'],
          (orders.success ? orders.data.items : []).map(o => [o.orderName, o.orderType, o.priority, o.frequency ?? '', when(o.startTime), o.status, o.orderingDoctorName]))}
          <h2>Medication administration record</h2>
          ${htmlTable(['Medication', 'Dose', 'Route', 'Frequency', 'Scheduled', 'Status', 'Given by', 'Notes'],
            (meds.success ? meds.data.items : []).map(m => [m.medicationName, m.dose, m.route, m.frequency, when(m.scheduledTime), m.status, m.administeredByName ?? '', m.notes ?? '']))}
          <h2>Progress notes</h2>
          ${htmlTable(['Written', 'Type', 'Author', 'Note'],
              (notes.success ? notes.data.items : []).map(n => [when(n.writtenAt), n.type, n.authorName, n.content]))}`;
        printHtmlDocument(`Treatment sheet ${p.mrn}`, body);
      },
      error: () => this.toastSrv.error('Unable to load the treatment sheet for export')
    });
  }
}
