import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { Severity } from "../../../../../shared/enums/severity";
import { SharedModule } from "../../../../../shared/shared-imports";
import {
    HistoricalSummary,
    PatientAllergy,
    PatientContext,
    PatientDemographics,
} from "../../../../../shared/types/medical-record.types";

@Component({
  selector: 'mr-overview-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <!-- LEFT — Patient + Contacts + Care Team -->
      <div class="space-y-4">
        <!-- Demographics -->
        <section class="bg-surface border border-gray-200 rounded-lg">
          <header class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
              <boo-icon name="user" iconClass="w-4 h-4 text-secondary"></boo-icon>
              Demographics
            </h3>
          </header>
          <dl class="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm" *ngIf="demographics">
            <div><dt class="text-xs text-secondary mb-0.5">Full name</dt><dd class="text-primary m-0">{{ demographics.fullName }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Preferred name</dt><dd class="text-primary m-0">{{ demographics.preferredName || '—' }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Gender</dt><dd class="text-primary m-0">{{ demographics.gender }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Date of birth</dt><dd class="text-primary m-0">{{ demographics.dateOfBirth | date:'longDate' }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Marital status</dt><dd class="text-primary m-0">{{ demographics.maritalStatus || '—' }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Language</dt><dd class="text-primary m-0">{{ demographics.preferredLanguage || '—' }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Occupation</dt><dd class="text-primary m-0">{{ demographics.occupation || '—' }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Nationality</dt><dd class="text-primary m-0">{{ demographics.nationality || '—' }}</dd></div>
            <div class="col-span-2"><dt class="text-xs text-secondary mb-0.5">Address</dt><dd class="text-primary m-0">{{ demographics.address || '—' }}</dd></div>
          </dl>
        </section>

        <!-- Emergency contact -->
        <section class="bg-surface border border-gray-200 rounded-lg">
          <header class="px-5 py-3 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
              <boo-icon name="phone" iconClass="w-4 h-4 text-secondary"></boo-icon>
              Emergency contact
            </h3>
          </header>
          <dl class="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm" *ngIf="demographics">
            <div><dt class="text-xs text-secondary mb-0.5">Name</dt><dd class="text-primary m-0">{{ demographics.emergencyContactName || '—' }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Relationship</dt><dd class="text-primary m-0">{{ demographics.emergencyContactRelationship || '—' }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Phone</dt><dd class="text-primary m-0">{{ demographics.emergencyContactPhone || '—' }}</dd></div>
          </dl>
        </section>

        <!-- Insurance -->
        <section *ngIf="patient" class="bg-surface border border-gray-200 rounded-lg">
          <header class="px-5 py-3 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
              <boo-icon name="shield-check" iconClass="w-4 h-4 text-secondary"></boo-icon>
              Insurance
            </h3>
          </header>
          <dl class="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt class="text-xs text-secondary mb-0.5">Provider</dt><dd class="text-primary m-0">{{ patient.insuranceProvider || '—' }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Policy #</dt><dd class="font-mono text-primary m-0">{{ patient.insurancePolicyNumber || '—' }}</dd></div>
            <div><dt class="text-xs text-secondary mb-0.5">Expires</dt><dd class="text-primary m-0">{{ patient.insuranceExpiryDate ? (patient.insuranceExpiryDate | date:'longDate') : '—' }}</dd></div>
          </dl>
        </section>

        <!-- Care team -->
        <section *ngIf="patient" class="bg-surface border border-gray-200 rounded-lg">
          <header class="px-5 py-3 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
              <boo-icon name="users" iconClass="w-4 h-4 text-secondary"></boo-icon>
              Care team
            </h3>
          </header>
          <ul class="divide-y divide-gray-100 m-0 p-0 list-none">
            <li *ngFor="let m of patient.careTeam" class="px-5 py-3 flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                {{ initials(m.fullName) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-sm text-primary font-medium truncate">{{ m.fullName }}</div>
                <div class="text-xs text-secondary truncate">{{ m.role }}<span *ngIf="m.department"> · {{ m.department }}</span></div>
              </div>
              <span *ngIf="m.phone" class="text-xs text-secondary font-mono">{{ m.phone }}</span>
            </li>
          </ul>
        </section>
      </div>

      <!-- RIGHT — History narratives + Allergies -->
      <div class="space-y-4">
        <!-- Allergies (critical, top of right column) -->
        <section class="bg-surface border border-gray-200 rounded-lg">
          <header class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
              <boo-icon name="alert-triangle" iconClass="w-4 h-4 text-red-600"></boo-icon>
              Allergies
              <span class="text-xs text-secondary font-normal">({{ allergies?.length || 0 }})</span>
            </h3>
          </header>
          <ul *ngIf="allergies?.length" class="divide-y divide-gray-100 m-0 p-0 list-none">
            <li *ngFor="let a of allergies" class="px-5 py-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-semibold text-primary">{{ a.allergenName }}</span>
                    <span class="text-[10px] uppercase tracking-wider text-secondary px-1.5 py-0.5 bg-gray-100 rounded">{{ a.allergenType }}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full" [ngClass]="severityClass(a.severity)">{{ a.severity }}</span>
                  </div>
                  <div class="text-xs text-secondary"><span class="text-gray-400">Reaction</span> {{ a.reactionType || '—' }}</div>
                  <div *ngIf="a.notes" class="text-xs text-secondary mt-1 italic">{{ a.notes }}</div>
                </div>
              </div>
            </li>
          </ul>
          <div *ngIf="!allergies?.length" class="px-5 py-6 text-center text-xs text-secondary">No known allergies.</div>
        </section>

        <!-- Narrative histories -->
        <section *ngFor="let h of historySections()" class="bg-surface border border-gray-200 rounded-lg">
          <header class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
              <boo-icon [name]="h.icon" iconClass="w-4 h-4 text-secondary"></boo-icon>
              {{ h.label }}
            </h3>
          </header>
          <div class="px-5 py-4">
            <p *ngIf="h.body" class="text-sm text-primary whitespace-pre-wrap m-0 leading-relaxed">{{ h.body }}</p>
            <p *ngIf="!h.body" class="text-xs text-secondary italic m-0">Not documented yet.</p>
          </div>
        </section>

        <div *ngIf="history?.lastUpdatedAt" class="text-[11px] text-secondary text-right px-1">
          Last updated {{ history?.lastUpdatedAt | date:'medium' }} by {{ history?.lastUpdatedByName || '—' }}
        </div>
      </div>
    </div>
    `,
})
export class OverviewTabComponent {
  @Input() patient: PatientContext | null = null;
  @Input() demographics: PatientDemographics | null = null;
  @Input() history: HistoricalSummary | null = null;
  @Input() allergies: PatientAllergy[] | null = null;

  initials(name: string): string {
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] ?? '') + (p.at(-1)?.[0] ?? '')).toUpperCase();
  }

  severityClass(s: Severity): string {
    switch (s) {
      case Severity.Critical: return 'bg-red-100 text-red-700';
      case Severity.Severe: return 'bg-red-50 text-red-700';
      case Severity.Moderate: return 'bg-amber-50 text-amber-700';
      default: return 'bg-emerald-50 text-emerald-700';
    }
  }

  historySections() {
    const h = this.history;
    return [
      { label: 'Past medical history', icon: 'book-open', body: h?.pastMedicalHistory },
      { label: 'Family history', icon: 'users-round', body: h?.familyHistory },
      { label: 'Social history', icon: 'leaf', body: h?.socialHistory },
      { label: 'Review of systems', icon: 'clipboard-check', body: h?.reviewOfSystems },
    ];
  }
}
