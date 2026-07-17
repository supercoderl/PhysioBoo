import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { RxPatientSummary } from "../../../../../shared/types/prescription-rx.types";
import { calcBmi } from "../prescription-rx.util";

interface WarningBadge {
    label: string;
    tone: 'danger' | 'warning' | 'primary';
    detail: string;
}

@Component({
    selector: 'rx-patient-summary',
    standalone: true,
    imports: [SharedModule, BooIconComponent, StatusBadgeComponent],
    template: `
    <div class="bg-surface border border-gray-200 rounded-lg" *ngIf="patient">
      <div class="px-5 py-4 flex flex-wrap items-start gap-6" *ngIf="!collapsed">
        <!-- Identity -->
        <div class="flex items-center gap-3 min-w-[200px]">
          <div class="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
            {{ initialsOf(patient.fullName) }}
          </div>
          <div class="min-w-0">
            <div class="font-bold text-primary truncate">{{ patient.fullName }}</div>
            <div class="text-xs text-secondary truncate">{{ patient.gender }} · {{ patient.ageYears }}y · {{ patient.dateOfBirth | date:'mediumDate' }}</div>
          </div>
        </div>

        <!-- Vitals -->
        <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-xs min-w-[200px]">
          <div><span class="text-secondary">Height:</span> <span class="font-medium text-primary">{{ patient.heightCm || '—' }} cm</span></div>
          <div><span class="text-secondary">Weight:</span> <span class="font-medium text-primary">{{ patient.weightKg || '—' }} kg</span></div>
          <div>
            <span class="text-secondary">BMI:</span>
            <span class="font-medium" [ngClass]="bmiClass()">{{ bmi() ?? '—' }}</span>
          </div>
          <div><span class="text-secondary">Blood:</span> <span class="font-medium text-primary">{{ patient.bloodType || '—' }}</span></div>
        </div>

        <!-- Contact / insurance -->
        <div class="text-xs min-w-[180px] space-y-1">
          <div class="flex items-center gap-1.5 text-secondary"><boo-icon name="phone" [size]="13"></boo-icon> {{ patient.phone || '—' }}</div>
          <div class="flex items-center gap-1.5">
            <boo-icon name="shield-check" [size]="13" [color]="patient.insuranceCovered ? '#059669' : '#94a3b8'"></boo-icon>
            <span [ngClass]="patient.insuranceCovered ? 'text-emerald-700' : 'text-secondary'">{{ patient.insuranceProvider || 'No insurance' }}</span>
          </div>
        </div>

        <!-- Clinical -->
        <div class="flex-1 min-w-[220px] space-y-2">
          <div *ngIf="patient.primaryDiagnosis" class="text-xs">
            <span class="align-middle text-[12px] font-medium py-1 px-2 rounded-[5px] bg-primary/10 text-primary">{{ patient.primaryDiagnosis }}</span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <span *ngFor="let b of warningBadges()"
              class="relative group"
            >
              <boo-status-badge [label]="b.label" [tone]="b.tone" [dotted]="true"></boo-status-badge>
              <span class="pointer-events-none absolute left-0 top-full mt-1 w-max max-w-[220px] bg-gray-900 text-white text-[11px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-40">
                {{ b.detail }}
              </span>
            </span>
          </div>
        </div>

        <button type="button" (click)="collapsed = true" class="text-secondary hover:text-primary self-start">
          <boo-icon name="chevron-up" [size]="16"></boo-icon>
        </button>
      </div>

      <!-- Collapsed strip -->
      <div *ngIf="collapsed" class="px-5 py-2 flex items-center gap-3 cursor-pointer" (click)="collapsed = false">
        <span class="font-semibold text-primary text-sm">{{ patient.fullName }}</span>
        <boo-status-badge *ngFor="let b of warningBadges()" [label]="b.label" [tone]="b.tone" [dotted]="true"></boo-status-badge>
        <boo-icon name="chevron-down" [size]="16" class="ml-auto text-secondary"></boo-icon>
      </div>
    </div>
  `,
})
export class PrescriptionPatientSummaryComponent {
    @Input() patient: RxPatientSummary | null = null;
    collapsed = false;

    bmi(): number | null {
        return calcBmi(this.patient?.heightCm, this.patient?.weightKg);
    }

    bmiClass(): string {
        const v = this.bmi();
        if (v === null) return 'text-secondary';
        if (v < 18.5 || v >= 30) return 'text-amber-600';
        return 'text-primary';
    }

    initialsOf(name?: string | null): string {
        if (!name) return '';
        return name.split(' ').filter(Boolean).slice(-2).map(p => p[0]).join('').toUpperCase();
    }

    warningBadges(): WarningBadge[] {
        if (!this.patient) return [];
        const { flags, allergies, chronicConditions } = this.patient;
        const out: WarningBadge[] = [];
        if (flags.drugAllergy) out.push({ label: 'Drug Allergy', tone: 'danger', detail: allergies.join(', ') || 'See allergy record' });
        if (flags.pregnancy) out.push({ label: 'Pregnancy', tone: 'warning', detail: 'Adjust dosing for pregnancy' });
        if (flags.pediatric) out.push({ label: 'Pediatric', tone: 'primary', detail: 'Pediatric dosing applies' });
        if (flags.elderly) out.push({ label: 'Elderly', tone: 'primary', detail: 'Consider age-related dose adjustment' });
        if (flags.highRisk) out.push({ label: 'High Risk', tone: 'danger', detail: chronicConditions.join(', ') || 'High risk patient' });
        if (flags.controlledRestricted) out.push({ label: 'Controlled Med. Restriction', tone: 'warning', detail: 'Restricted from controlled substances' });
        return out;
    }
}
