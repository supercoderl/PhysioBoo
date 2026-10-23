import { DatePipe, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, DestroyRef, OnInit, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {
  BooBadgeTone, BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooIconComponent, BooStatusBadgeComponent
} from '@physioboo/ui';
import { NursingService } from "../../../../services/admin/nursing.service";
import { TreatmentSheetService } from "../../../../services/admin/treatment-sheet.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { AcuityLevel, NursingPatient } from "../../../../shared/types/nursing.types";
import { TreatmentPatientSummary } from "../../../../shared/types/treatment-sheet.types";
import { NursingIoTabComponent } from "./tabs/nursing-io-tab.component";
import { NursingMarTabComponent } from "./tabs/nursing-mar-tab.component";
import { NursingNotesTabComponent } from "./tabs/nursing-notes-tab.component";
import { NursingOverviewTabComponent } from "./tabs/nursing-overview-tab.component";
import { NursingTasksTabComponent } from "./tabs/nursing-tasks-tab.component";
import { NursingVitalsTabComponent } from "./tabs/nursing-vitals-tab.component";

type TabKey = 'overview' | 'vitals' | 'mar' | 'io' | 'tasks' | 'notes';
type LoadError = 'invalid' | 'not-found' | 'forbidden' | 'failed';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Component({
  selector: 'admin-nursing-patient',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, DatePipe, RouterLink,
    BooButtonComponent, BooIconComponent, BooEmptyStateComponent, BooErrorStateComponent, BooStatusBadgeComponent,
    NursingOverviewTabComponent, NursingVitalsTabComponent, NursingMarTabComponent,
    NursingIoTabComponent, NursingTasksTabComponent, NursingNotesTabComponent,
  ],
  template: `
    <div class="py-5 flex flex-col gap-4 min-w-0" [attr.aria-busy]="isLoading()">
      <!-- First load -->
      <div *ngIf="isLoading()" aria-hidden="true" class="flex flex-col gap-3">
        <div class="rounded-xl border border-borderGray bg-surface p-4 flex items-center gap-3">
          <div class="h-12 w-12 rounded-full bg-rowDivider animate-pulse"></div>
          <div class="flex-1 flex flex-col gap-2">
            <div class="h-4 w-48 max-w-full rounded bg-rowDivider animate-pulse"></div>
            <div class="h-3 w-72 max-w-full rounded bg-rowDivider animate-pulse"></div>
          </div>
        </div>
        <div class="h-64 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
      </div>
      <span *ngIf="isLoading()" class="sr-only" role="status">Loading the patient…</span>

      <!-- Not loadable -->
      <ng-container *ngIf="!isLoading() && loadError() as err">
        <boo-empty-state *ngIf="err === 'invalid'" appearance="panel" icon="user-x" title="This patient link isn't valid"
          description="Open the patient from your nursing dashboard.">
          <a boo-button variant="outline" routerLink="/admin/nursing/dashboard">Back to dashboard</a>
        </boo-empty-state>
        <boo-empty-state *ngIf="err === 'not-found'" appearance="panel" icon="user-x" title="No admitted patient found"
          description="This patient doesn't exist or is not currently admitted, so there is no nursing chart to show.">
          <a boo-button variant="outline" routerLink="/admin/nursing/dashboard">Back to dashboard</a>
        </boo-empty-state>
        <boo-empty-state *ngIf="err === 'forbidden'" appearance="panel" icon="lock" title="You don't have access to this patient"
          description="Ask an administrator for the nursing read permission.">
          <a boo-button variant="outline" routerLink="/admin/nursing/dashboard">Back to dashboard</a>
        </boo-empty-state>
        <boo-error-state *ngIf="err === 'failed'" appearance="panel" icon="cloud-off" title="We couldn't load this patient"
          description="Something went wrong while loading the chart. Check your connection and try again."
          retryLabel="Try again" (retry)="loadPatient()">
          <a boo-button variant="outline" routerLink="/admin/nursing/dashboard">Back to dashboard</a>
        </boo-error-state>
      </ng-container>

      <ng-container *ngIf="!isLoading() && !loadError() && patient() as p">
        <!-- Patient identity and clinical context: stays in view while the tabs scroll -->
        <header class="sticky top-0 z-20 bg-surface border border-borderGray rounded-xl shadow-sm">
          <div class="px-4 py-3 flex flex-wrap items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <a boo-button variant="ghost" size="sm" [iconOnly]="true" routerLink="/admin/nursing/dashboard" aria-label="Back to nursing dashboard">
                <physio-icon name="arrow-left" [size]="18" aria-hidden="true" />
              </a>
              <div class="h-11 w-11 rounded-full bg-primary/10 flex flex-none items-center justify-center text-sm font-semibold text-primary" aria-hidden="true">
                {{ initials(p.patientName) }}
              </div>
              <div class="min-w-0">
                <h1 class="m-0 text-lg leading-6 font-semibold text-regular break-words">{{ p.patientName }}</h1>
                <p class="m-0 mt-0.5 text-xs leading-5 text-secondary">
                  {{ p.patientNumber }} · {{ p.age }}y · {{ p.gender }}
                  <ng-container *ngIf="summary()?.admissionDate as admitted"> · Admitted {{ admitted | date: 'MMM d, y' }}</ng-container>
                </p>
                <p class="m-0 text-xs leading-5 text-regular">
                  <span class="font-medium">{{ p.wardName }} · Bed {{ p.bedNumber }}</span>
                  <ng-container *ngIf="p.primaryDoctorName"> · Dr. {{ p.primaryDoctorName }}</ng-container>
                </p>
                <p *ngIf="summary()?.primaryDiagnosis as dx" class="m-0 text-xs leading-5 text-secondary">Diagnosis: {{ dx }}</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex flex-wrap gap-1.5">
                <boo-status-badge [label]="'Acuity · ' + p.acuity" [tone]="acuityTone(p.acuity)" />
                <boo-status-badge *ngIf="p.risk.fallRisk" label="Fall risk" tone="warning" [dotted]="true" />
                <boo-status-badge *ngIf="p.risk.isolationRequired" [label]="p.risk.isolationType ? 'Isolation · ' + p.risk.isolationType : 'Isolation'" tone="primary" [dotted]="true" />
                <boo-status-badge *ngIf="p.risk.isEmergency" label="Emergency" tone="danger" [dotted]="true" />
              </div>
              <a *ngIf="treatmentLink" boo-button variant="outline" size="sm" [routerLink]="treatmentLink" [queryParams]="{ patientId: p.patientId }">Treatment sheet</a>
              <button boo-button variant="secondary" size="sm" (click)="refresh()">
                <physio-icon name="refresh" [size]="15" aria-hidden="true" />Refresh
              </button>
            </div>
          </div>

          <!-- Allergies are shown in full whenever the treatment sheet makes them available -->
          <div *ngIf="p.risk.hasAllergies" role="note" class="px-4 py-2 border-t border-dangerBorder bg-dangerSoft text-sm text-danger flex items-start gap-2">
            <physio-icon name="triangle-alert" [size]="16" class="flex-none mt-0.5" aria-hidden="true" />
            <span *ngIf="summary()?.allergies?.length; else allergyFlagOnly"><strong>Allergies:</strong> {{ summary()!.allergies.join(', ') }}</span>
            <ng-template #allergyFlagOnly><span><strong>Allergy recorded.</strong> Check the allergy details before giving any medication.</span></ng-template>
          </div>

          <nav class="px-2 border-t border-borderGray flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Patient chart sections" (keydown)="onTabKeydown($event)">
            <button *ngFor="let t of tabs" type="button" role="tab"
              [id]="'nursing-tab-' + t.key" [attr.aria-controls]="'nursing-panel-' + t.key"
              [attr.aria-selected]="activeTab() === t.key" [attr.tabindex]="activeTab() === t.key ? 0 : -1"
              (click)="setTab(t.key)"
              class="px-3.5 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 -mb-px whitespace-nowrap bg-transparent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t"
              [ngClass]="activeTab() === t.key ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary hover:border-gray-300'">
              <physio-icon [name]="t.icon" [size]="16" aria-hidden="true" />
              {{ t.label }}
            </button>
          </nav>
        </header>

        <!-- Tabs keep their state (drafts, page) once opened, so switching never loses unsaved input -->
        <main class="min-w-0">
          <section *ngFor="let t of tabs" [hidden]="activeTab() !== t.key" role="tabpanel" tabindex="0"
            [id]="'nursing-panel-' + t.key" [attr.aria-labelledby]="'nursing-tab-' + t.key">
            <ng-container *ngIf="visited().has(t.key)" [ngSwitch]="t.key">
              <nursing-overview-tab *ngSwitchCase="'overview'" [patientId]="patientId" [refreshKey]="refreshKey()" />
              <nursing-vitals-tab *ngSwitchCase="'vitals'" [patientId]="patientId" [refreshKey]="refreshKey()" [canWrite]="canWrite" (changed)="refreshPatient()" />
              <nursing-mar-tab *ngSwitchCase="'mar'" [patientId]="patientId" [refreshKey]="refreshKey()" [canWrite]="canWrite" [hasAllergies]="p.risk.hasAllergies" (changed)="refreshPatient()" />
              <nursing-io-tab *ngSwitchCase="'io'" [patientId]="patientId" [refreshKey]="refreshKey()" [canWrite]="canWrite" />
              <nursing-tasks-tab *ngSwitchCase="'tasks'" [patientId]="patientId" [refreshKey]="refreshKey()" [canWrite]="canWrite" (changed)="refreshPatient()" />
              <nursing-notes-tab *ngSwitchCase="'notes'" [patientId]="patientId" [refreshKey]="refreshKey()" [canWrite]="canWrite" />
            </ng-container>
          </section>
        </main>
      </ng-container>
    </div>
  `
})
export class AdminNursingPatientComponent implements OnInit {
  // #region Inputs, Outputs, Properties
  private readonly route = inject(ActivatedRoute);
  private readonly srv = inject(NursingService);
  private readonly treatmentSrv = inject(TreatmentSheetService);
  private readonly authSrv = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  patientId = '';
  patient = signal<NursingPatient | null>(null);
  /** Allergy names, diagnosis and admission date; only available to users who can read the treatment sheet. */
  summary = signal<TreatmentPatientSummary | null>(null);
  isLoading = signal(true);
  loadError = signal<LoadError | null>(null);
  /** Bumped by Refresh so the open tabs reload in place, keeping any unsaved input. */
  refreshKey = signal(0);
  activeTab = signal<TabKey>('overview');
  visited = signal<Set<TabKey>>(new Set<TabKey>(['overview']));

  readonly canWrite = this.authSrv.hasPermission(Permissions.Inpatient.NursingWrite);
  readonly treatmentLink = this.authSrv.hasPermission(Permissions.Inpatient.TreatmentSheetRead) ? '/admin/inpatient/treatment-sheet' : null;

  readonly tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
    { key: 'vitals', label: 'Vitals', icon: 'activity' },
    { key: 'mar', label: 'Medications', icon: 'pill' },
    { key: 'io', label: 'Intake & output', icon: 'droplets' },
    { key: 'tasks', label: 'Tasks', icon: 'clipboard' },
    { key: 'notes', label: 'Notes', icon: 'file-text' },
  ];
  // #endregion

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.patientId = params.get('patientId') ?? '';
      this.activeTab.set('overview');
      this.visited.set(new Set<TabKey>(['overview']));
      this.loadPatient();
    });
  }

  // #region Loading
  loadPatient(): void {
    this.patient.set(null);
    this.summary.set(null);
    this.loadError.set(null);
    if (!GUID.test(this.patientId)) {
      this.loadError.set('invalid');
      this.isLoading.set(false);
      return;
    }

    const requested = this.patientId;
    this.isLoading.set(true);
    this.srv.getPatient(requested).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (requested !== this.patientId) return;
        if (res.success && res.data) {
          this.patient.set(res.data);
          this.loadSummary(requested);
        } else {
          this.loadError.set('not-found');
        }
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (requested !== this.patientId) return;
        this.loadError.set(err.status === 404 ? 'not-found' : err.status === 403 ? 'forbidden' : 'failed');
        this.isLoading.set(false);
      },
    });
  }

  refresh(): void {
    this.refreshPatient();
    this.refreshKey.update(k => k + 1);
  }

  /** Re-reads the header after a chart change (risk flags, last vitals) without hiding the page. */
  refreshPatient(): void {
    const requested = this.patientId;
    this.srv.getPatient(requested).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => { if (requested === this.patientId && res.success && res.data) this.patient.set(res.data); },
      error: () => { /* the header keeps its last values */ },
    });
  }

  private loadSummary(patientId: string): void {
    if (!this.treatmentLink) return;
    this.treatmentSrv.getSummary(patientId, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => { if (patientId === this.patientId && res.success) this.summary.set(res.data ?? null); },
      error: () => { /* the nursing context is complete without it */ },
    });
  }
  // #endregion

  // #region Tabs
  setTab(key: TabKey): void {
    this.activeTab.set(key);
    if (!this.visited().has(key)) this.visited.set(new Set(this.visited()).add(key));
  }

  onTabKeydown(event: KeyboardEvent): void {
    const keys = this.tabs.map(t => t.key);
    const current = keys.indexOf(this.activeTab());
    let next = current;
    switch (event.key) {
      case 'ArrowRight': next = (current + 1) % keys.length; break;
      case 'ArrowLeft': next = (current - 1 + keys.length) % keys.length; break;
      case 'Home': next = 0; break;
      case 'End': next = keys.length - 1; break;
      default: return;
    }
    event.preventDefault();
    this.setTab(keys[next]);
    document.getElementById('nursing-tab-' + keys[next])?.focus();
  }
  // #endregion

  // #region Helpers
  initials(name: string): string {
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }

  acuityTone(acuity: AcuityLevel): BooBadgeTone {
    switch (acuity) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'primary';
      default: return 'neutral';
    }
  }
  // #endregion
}
