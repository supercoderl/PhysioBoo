import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BooButtonComponent, BooEmptyStateComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { StoredClinicalWarning, normalizeWarningSeverity, warningTypeLabel } from '../../../../../shared/types/prescription-rx.types';
import { PrescriptionLine, formatAmount, lineTotal, mealLabel, severityTone, timingLabel } from '../prescription-rx.util';

/** Medication lines of a prescription with their warnings. Editing is reported to the page; nothing is saved here. */
@Component({
    selector: 'rx-medication-table',
    standalone: true,
    imports: [NgIf, NgFor, BooButtonComponent, BooEmptyStateComponent, BooIconComponent, BooStatusBadgeComponent],
    template: `
        <section class="bg-surface border border-borderGray rounded-xl" aria-labelledby="rx-meds-title">
            <header class="px-5 py-3 border-b border-rowDivider flex flex-wrap items-center justify-between gap-2">
                <h2 id="rx-meds-title" class="m-0 text-sm font-semibold text-regular">
                    Medications <span class="text-secondary font-normal">({{ lines.length }})</span>
                </h2>
                <div class="flex flex-wrap items-center gap-2">
                    <button *ngIf="lines.length" type="button" boo-button variant="secondary" size="sm" [loading]="checking" [disabled]="checking" (click)="check.emit()">
                        <physio-icon *ngIf="!checking" name="shield-check" [size]="15" aria-hidden="true" />Check warnings
                    </button>
                    <button *ngIf="editable" type="button" boo-button variant="primary" size="sm" (click)="add.emit()">
                        <physio-icon name="plus" [size]="15" aria-hidden="true" />Add medication
                    </button>
                </div>
            </header>

            <boo-empty-state
                *ngIf="!lines.length"
                appearance="panel"
                icon="pill"
                title="No medications yet"
                [description]="editable ? 'Use Add medication to start this prescription.' : 'This prescription has no medications.'"
                [headingLevel]="3"
            />

            <div *ngIf="lines.length" class="overflow-x-auto">
                <table class="w-full text-sm">
                    <caption class="sr-only">Medications on this prescription</caption>
                    <thead class="bg-gray-50 text-left text-xs text-secondary">
                        <tr>
                            <th scope="col" class="px-5 py-2 font-semibold">Medication</th>
                            <th scope="col" class="px-3 py-2 font-semibold">Dose and schedule</th>
                            <th scope="col" class="px-3 py-2 font-semibold text-right">Duration</th>
                            <th scope="col" class="px-3 py-2 font-semibold text-right">Quantity</th>
                            <th scope="col" class="px-3 py-2 font-semibold text-right">Price</th>
                            <th *ngIf="editable" scope="col" class="px-5 py-2 font-semibold text-right"><span class="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <ng-container *ngFor="let line of lines; trackBy: trackLine">
                            <tr class="align-top border-t border-rowDivider">
                                <td class="px-5 py-3">
                                    <p class="m-0 font-medium text-regular">{{ line.input.medicineName }}</p>
                                    <p class="m-0 text-xs text-secondary">
                                        {{ line.input.genericName || 'No generic name' }}<ng-container *ngIf="line.input.strength"> · {{ line.input.strength }}</ng-container><ng-container *ngIf="line.input.dosageForm"> · {{ line.input.dosageForm }}</ng-container>
                                    </p>
                                    <p *ngIf="!line.input.id" class="m-0 mt-1 text-xs text-warning">Not saved yet</p>
                                </td>
                                <td class="px-3 py-3">
                                    <p class="m-0 text-regular">{{ line.input.dosageInstructions }} · {{ line.input.frequency }}</p>
                                    <p *ngIf="schedule(line) as s" class="m-0 text-xs text-secondary">{{ s }}</p>
                                    <p *ngIf="line.input.routeOfAdministration" class="m-0 text-xs text-secondary">Route: {{ line.input.routeOfAdministration }}</p>
                                    <p *ngIf="line.input.specialInstructions" class="m-0 mt-1 text-xs text-secondary">{{ line.input.specialInstructions }}</p>
                                </td>
                                <td class="px-3 py-3 text-right tabular-nums whitespace-nowrap">{{ line.input.durationInDays }} d</td>
                                <td class="px-3 py-3 text-right tabular-nums whitespace-nowrap">
                                    {{ line.input.quantityPrescribed }} {{ line.input.unit }}
                                    <span *ngIf="line.quantityDispensed" class="block text-xs text-secondary">{{ line.quantityDispensed }} dispensed</span>
                                </td>
                                <td class="px-3 py-3 text-right tabular-nums whitespace-nowrap">
                                    {{ amount(line.input.pricePerUnit) }}
                                    <span class="block text-xs text-secondary">Total {{ amount(total(line)) }}</span>
                                </td>
                                <td *ngIf="editable" class="px-5 py-3 text-right whitespace-nowrap">
                                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" [attr.aria-label]="'Edit ' + line.input.medicineName" (click)="edit.emit(line)">
                                        <physio-icon name="pencil" [size]="16" />
                                    </button>
                                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" [attr.aria-label]="'Remove ' + line.input.medicineName" (click)="remove.emit(line)">
                                        <physio-icon name="trash" [size]="16" />
                                    </button>
                                </td>
                            </tr>
                            <tr *ngIf="warningsOf(line).length">
                                <td [attr.colspan]="editable ? 6 : 5" class="px-5 pb-3 pt-0">
                                    <ul class="m-0 p-0 list-none flex flex-col gap-1.5" [attr.aria-label]="'Warnings for ' + line.input.medicineName">
                                        <li *ngFor="let w of warningsOf(line)" class="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs">
                                            <boo-status-badge [label]="severity(w)" [tone]="tone(w)" />
                                            <span class="min-w-0">
                                                <span class="font-medium text-regular">{{ typeLabel(w) }}:</span> {{ w.message }}
                                                <span *ngIf="w.recommendedAction" class="block text-secondary">{{ w.recommendedAction }}</span>
                                                <span *ngIf="w.acknowledgedAt" class="block text-secondary">Acknowledged</span>
                                            </span>
                                        </li>
                                    </ul>
                                </td>
                            </tr>
                        </ng-container>
                    </tbody>
                </table>
            </div>
        </section>
    `,
})
export class PrescriptionMedicationTableComponent {
    @Input() lines: PrescriptionLine[] = [];
    @Input() editable = false;
    @Input() checking = false;
    @Output() add = new EventEmitter<void>();
    @Output() edit = new EventEmitter<PrescriptionLine>();
    @Output() remove = new EventEmitter<PrescriptionLine>();
    @Output() check = new EventEmitter<void>();

    trackLine = (_: number, line: PrescriptionLine) => line.key;

    amount(n: number): string {
        return formatAmount(n);
    }

    total(line: PrescriptionLine): number {
        return lineTotal(line.input);
    }

    /** "Morning, Evening · After meals" or an empty string. */
    schedule(line: PrescriptionLine): string {
        return [timingLabel(line.input), mealLabel(line.input.beforeAfterMeal)].filter(Boolean).join(' · ');
    }

    /** Stored warnings first, then the result of the last check (a check result replaces nothing that is stored). */
    warningsOf(line: PrescriptionLine): StoredClinicalWarning[] {
        return [...line.stored, ...(line.checked ?? [])];
    }

    severity(w: StoredClinicalWarning): string {
        return normalizeWarningSeverity(w.severity);
    }

    tone(w: StoredClinicalWarning) {
        return severityTone(normalizeWarningSeverity(w.severity));
    }

    typeLabel(w: StoredClinicalWarning): string {
        return warningTypeLabel(w.type);
    }
}
