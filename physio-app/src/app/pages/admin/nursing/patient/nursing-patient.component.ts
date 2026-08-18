import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { NursingService } from "../../../../services/admin/nursing.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { NursingPatient } from "../../../../shared/types/nursing.types";
import { NursingIoTabComponent } from "./tabs/nursing-io-tab.component";
import { NursingMarTabComponent } from "./tabs/nursing-mar-tab.component";
import { NursingNotesTabComponent } from "./tabs/nursing-notes-tab.component";
import { NursingOverviewTabComponent } from "./tabs/nursing-overview-tab.component";
import { NursingTasksTabComponent } from "./tabs/nursing-tasks-tab.component";
import { NursingVitalsTabComponent } from "./tabs/nursing-vitals-tab.component";

type TabKey = 'overview' | 'vitals' | 'mar' | 'io' | 'tasks' | 'notes';

@Component({
    selector: 'admin-nursing-patient',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent,
        ErrorStateComponent,
        StatusBadgeComponent,
        NursingOverviewTabComponent,
        NursingVitalsTabComponent,
        NursingMarTabComponent,
        NursingIoTabComponent,
        NursingTasksTabComponent,
        NursingNotesTabComponent,
    ],
    host: { class: 'block min-h-screen bg-gray-50' },
    template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-24">
      <boo-icon name="loader" iconClass="w-8 h-8 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && error()" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <boo-error-state title="Couldn't load patient" [description]="error()" (retry)="retryLoad()"></boo-error-state>
    </div>

    <ng-container *ngIf="!isLoading() && !error()">
      <!-- Sticky patient context header -->
      <div class="sticky top-0 z-20 bg-surface shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <button (click)="back()" class="text-gray-400 hover:text-gray-600">
              <boo-icon name="arrow-left" [size]="20"></boo-icon>
            </button>
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
              {{ initials(patient()?.patientName ?? '') }}
            </div>
            <div class="min-w-0">
              <div class="text-lg font-semibold text-gray-800 truncate">{{ patient()?.patientName }}</div>
              <div class="text-xs text-secondary">
                {{ patient()?.patientNumber }} · {{ patient()?.wardName }} · Bed {{ patient()?.bedNumber }} · Dr. {{ patient()?.primaryDoctorName }}
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <boo-status-badge *ngIf="patient()?.risk?.fallRisk" label="Fall Risk" tone="warning" [dotted]="true"></boo-status-badge>
            <boo-status-badge *ngIf="patient()?.risk?.isolationRequired" label="Isolation" tone="primary" [dotted]="true"></boo-status-badge>
            <boo-status-badge *ngIf="patient()?.risk?.isEmergency" label="Emergency" tone="danger" [dotted]="true"></boo-status-badge>
            <boo-status-badge *ngIf="patient()?.risk?.hasAllergies" label="Allergy" tone="danger" [dotted]="true"></boo-status-badge>
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

      <!-- Tab content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nursing-overview-tab *ngIf="activeTab() === 'overview'" [patientId]="patientId" />
        <nursing-vitals-tab *ngIf="activeTab() === 'vitals'" [patientId]="patientId" />
        <nursing-mar-tab *ngIf="activeTab() === 'mar'" [patientId]="patientId" />
        <nursing-io-tab *ngIf="activeTab() === 'io'" [patientId]="patientId" />
        <nursing-tasks-tab *ngIf="activeTab() === 'tasks'" [patientId]="patientId" />
        <nursing-notes-tab *ngIf="activeTab() === 'notes'" [patientId]="patientId" />
      </main>
    </ng-container>
    `
})
export class AdminNursingPatientComponent implements OnInit {
    patientId!: string;
    patient = signal<NursingPatient | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);
    activeTab = signal<TabKey>('overview');

    readonly tabs: { key: TabKey; label: string; icon: string }[] = [
        { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
        { key: 'vitals', label: 'Vitals', icon: 'activity' },
        { key: 'mar', label: 'MAR', icon: 'pill' },
        { key: 'io', label: 'Intake & Output', icon: 'droplets' },
        { key: 'tasks', label: 'Tasks', icon: 'clipboard-list' },
        { key: 'notes', label: 'Notes', icon: 'file-text' },
    ];

    constructor(
        private srv: NursingService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.patientId = this.route.snapshot.paramMap.get('patientId') ?? '';
        this.loadPatient();
    }

    retryLoad(): void {
        if (this.patientId) this.loadPatient();
    }

    private loadPatient(): void {
        this.isLoading.set(true);
        this.error.set(null);
        this.srv.getPatient(this.patientId).subscribe({
            next: (res) => {
                if (res.success) this.patient.set(res.data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.error.set('Failed to load the patient. Please try again.');
            },
        });
    }

    setTab(key: TabKey): void { this.activeTab.set(key); }

    back(): void { this.router.navigate(['/admin/nursing/dashboard']); }

    initials(name: string): string {
        const p = name.trim().split(/\s+/);
        return ((p[0]?.[0] ?? '') + (p.at(-1)?.[0] ?? '')).toUpperCase();
    }
}
