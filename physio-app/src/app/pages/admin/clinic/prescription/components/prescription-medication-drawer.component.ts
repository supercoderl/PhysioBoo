import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {
    BooButtonComponent,
    BooCheckboxComponent,
    BooIconComponent,
    BooInputComponent,
    BooSearchFieldComponent,
    BooStatusBadgeComponent,
} from '@physioboo/ui';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { BooSelectComponent } from '../../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../../components/textarea/boo-textarea/boo-textarea.component';
import { DrawerComponent } from '../../../../../components/drawer/drawer.component';
import { PrescriptionService } from '../../../../../services/admin/prescription.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../../shared/directives/scrollbar.directive';
import { MedicineSearchResult, PrescriptionItemInput } from '../../../../../shared/types/prescription-rx.types';
import { PrescriptionLine } from '../prescription-rx.util';

const TEXT_MAX = 500;

function notBlank(control: AbstractControl<string>): ValidationErrors | null {
    return String(control.value ?? '').trim() ? null : { required: true };
}

function wholeNumberAtLeast(min: number) {
    return (control: AbstractControl<string>): ValidationErrors | null => {
        const raw = String(control.value ?? '').trim();
        if (!raw) return { required: true };
        const n = Number(raw);
        return Number.isInteger(n) && n >= min ? null : { range: true };
    };
}

function amountAtLeastZero(control: AbstractControl<string>): ValidationErrors | null {
    const raw = String(control.value ?? '').trim();
    if (!raw) return { required: true };
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? null : { range: true };
}

/**
 * Adds a medicine to the prescription or edits one of its lines. The medicine comes from the stock-aware catalog search;
 * that search returns no strength, dosage form, unit or price, so the prescriber enters them (nothing is pre-filled).
 */
@Component({
    selector: 'rx-medication-drawer',
    standalone: true,
    imports: [
        NgIf, NgFor, ReactiveFormsModule, DrawerComponent, CustomScrollbarDirective,
        BooButtonComponent, BooIconComponent, BooInputComponent, BooCheckboxComponent, BooSearchFieldComponent, BooStatusBadgeComponent,
        BooSelectComponent, BooTextareaComponent,
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="form.dirty" (close)="discard()">
            <form
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="rx-med-title"
                [attr.inert]="isOpen ? null : ''"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h2 id="rx-med-title" class="m-0 text-lg font-semibold leading-tight text-regular">{{ line ? 'Edit medication' : 'Add medication' }}</h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5" custom-scrollbar>
                    <!-- Medicine -->
                    <section *ngIf="!line" class="flex flex-col gap-2" aria-label="Find a medicine">
                        <boo-search-field
                            [formControl]="search"
                            label="Search medicines by name"
                            placeholder="Search medicines by name"
                            [busy]="searching"
                            (clear)="search.setValue('')"
                        />
                        <p *ngIf="!canSearch" class="m-0 text-xs text-danger" role="alert">
                            Your account cannot search the medicine catalog, so a new medicine cannot be added.
                        </p>
                        <p *ngIf="searchError" class="m-0 text-xs text-danger" role="alert">{{ searchError }}</p>
                        <p *ngIf="searched && !searching && !searchError && !results.length" class="m-0 text-xs text-secondary" aria-live="polite">
                            No medicine matches "{{ search.value }}".
                        </p>
                        <ul *ngIf="results.length" class="m-0 p-0 list-none border border-borderGray rounded-lg divide-y divide-rowDivider max-h-64 overflow-y-auto" custom-scrollbar>
                            <li *ngFor="let m of results">
                                <button type="button" class="w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50 focus-visible:bg-gray-50" (click)="choose(m)">
                                    <span class="min-w-0">
                                        <span class="block text-sm font-medium text-regular truncate">{{ m.name }}</span>
                                        <span class="block text-xs text-secondary truncate">{{ m.genericName || 'No generic name' }}<ng-container *ngIf="m.category"> · {{ m.category }}</ng-container></span>
                                    </span>
                                    <boo-status-badge [label]="stockLabel(m)" [tone]="stockTone(m)" dotted />
                                </button>
                            </li>
                        </ul>
                    </section>

                    <section *ngIf="medicine" class="rounded-lg border border-borderGray bg-gray-50 px-4 py-3 flex flex-col gap-1" aria-label="Selected medicine">
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                                <p class="m-0 text-sm font-semibold text-regular">{{ medicine.name }}</p>
                                <p class="m-0 text-xs text-secondary">{{ medicine.genericName || 'No generic name' }}</p>
                            </div>
                            <button *ngIf="!line" type="button" boo-button variant="link" size="sm" (click)="clearMedicine()">Change</button>
                        </div>
                        <p *ngIf="isDuplicate" class="m-0 text-xs text-warning" role="status">This medicine is already on the prescription.</p>
                    </section>

                    <ng-container *ngIf="medicine">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="sm:col-span-2">
                                <boo-input id="rx-dosage" name="rx-dosage" formControlName="dosageInstructions" label="Dose per intake" required [maxlength]="textMax" />
                                <p class="m-0 mt-1 text-xs text-secondary">As written for the patient, for example "1 tablet".</p>
                            </div>
                            <boo-input id="rx-frequency" name="rx-frequency" formControlName="frequency" label="Frequency" required [maxlength]="100" />
                            <div>
                                <boo-input id="rx-duration" name="rx-duration" type="number" formControlName="durationInDays" label="Duration (days)" required />
                                <p *ngIf="showRange('durationInDays')" class="m-0 mt-1 text-xs text-danger" role="alert">Enter a whole number of 1 or more.</p>
                            </div>
                            <div>
                                <boo-input id="rx-quantity" name="rx-quantity" type="number" formControlName="quantityPrescribed" label="Quantity" required />
                                <p *ngIf="showRange('quantityPrescribed')" class="m-0 mt-1 text-xs text-danger" role="alert">Enter a whole number of 1 or more.</p>
                            </div>
                            <boo-input id="rx-unit" name="rx-unit" formControlName="unit" label="Unit" required [maxlength]="50" />
                            <div>
                                <boo-input id="rx-price" name="rx-price" type="number" formControlName="pricePerUnit" label="Price per unit" required />
                                <p *ngIf="showRange('pricePerUnit')" class="m-0 mt-1 text-xs text-danger" role="alert">Enter 0 or more.</p>
                            </div>
                            <div>
                                <boo-input id="rx-refills" name="rx-refills" type="number" formControlName="refillCount" label="Refills" required />
                                <p *ngIf="showRange('refillCount')" class="m-0 mt-1 text-xs text-danger" role="alert">Enter a whole number of 0 or more.</p>
                            </div>
                            <boo-input id="rx-strength" name="rx-strength" formControlName="strength" label="Strength" [maxlength]="100" />
                            <boo-select id="rx-form" formControlName="dosageForm" label="Dosage form" [options]="dosageForms" bindLabel="label" bindValue="value" />
                            <boo-input id="rx-route" name="rx-route" formControlName="routeOfAdministration" label="Route of administration" [maxlength]="100" />
                            <boo-select id="rx-meal" formControlName="beforeAfterMeal" label="Relation to meals" [options]="mealOptions" bindLabel="label" bindValue="value" />
                        </div>

                        <fieldset class="m-0 p-0 border-0">
                            <legend class="mb-2 p-0 text-[13px] font-medium text-regular">Time of day</legend>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                                <boo-checkbox id="rx-morning" name="rx-morning" formControlName="timingMorning" label="Morning" />
                                <boo-checkbox id="rx-noon" name="rx-noon" formControlName="timingNoon" label="Noon" />
                                <boo-checkbox id="rx-afternoon" name="rx-afternoon" formControlName="timingAfternoon" label="Afternoon" />
                                <boo-checkbox id="rx-evening" name="rx-evening" formControlName="timingEvening" label="Evening" />
                                <boo-checkbox id="rx-prn" name="rx-prn" formControlName="isPrn" label="As needed (PRN)" />
                            </div>
                        </fieldset>

                        <div>
                            <label for="rx-special" class="block mb-1 text-[13px] font-medium text-regular">Special instructions</label>
                            <boo-textarea id="rx-special" name="rx-special" formControlName="specialInstructions" label="Special instructions" [rows]="3" [maxlength]="textMax" />
                        </div>

                        <boo-checkbox id="rx-insurance" name="rx-insurance" formControlName="isInsuranceCovered" label="Covered by insurance" />
                    </ng-container>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [disabled]="!medicine">{{ line ? 'Update medication' : 'Add to prescription' }}</button>
                </footer>
            </form>
        </drawer>
    `,
})
export class PrescriptionMedicationDrawerComponent implements OnInit, OnChanges {
    @Input() isOpen = false;
    /** The line being edited; null when adding. */
    @Input() line: PrescriptionLine | null = null;
    @Input() canSearch = true;
    /** Medicine ids already on the prescription, to flag a duplicate. */
    @Input() existingMedicineIds: string[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<PrescriptionItemInput>();

    private readonly fb = inject(FormBuilder);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;
    private readonly destroyRef = inject(DestroyRef);
    private readonly rxSrv = inject(PrescriptionService);
    private readonly dialogSrv = inject(DialogService);

    readonly textMax = TEXT_MAX;
    readonly dosageForms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch'].map(v => ({ label: v, value: v }));
    /** Values are the server enum numbers. */
    readonly mealOptions = [{ label: 'Before meals', value: 0 }, { label: 'After meals', value: 1 }, { label: 'Not specified', value: 2 }];

    readonly search = new FormControl('', { nonNullable: true });
    results: MedicineSearchResult[] = [];
    searching = false;
    searched = false;
    searchError: string | null = null;
    medicine: { id: string; name: string; genericName: string | null; isCatalogVerified: boolean } | null = null;

    readonly form = this.fb.nonNullable.group({
        dosageInstructions: ['', [notBlank, Validators.maxLength(TEXT_MAX)]],
        frequency: ['', [notBlank, Validators.maxLength(100)]],
        durationInDays: ['', wholeNumberAtLeast(1)],
        quantityPrescribed: ['', wholeNumberAtLeast(1)],
        unit: ['', [notBlank, Validators.maxLength(50)]],
        pricePerUnit: ['', amountAtLeastZero],
        refillCount: ['0', wholeNumberAtLeast(0)],
        strength: ['', Validators.maxLength(100)],
        dosageForm: [null as string | null],
        routeOfAdministration: ['', Validators.maxLength(100)],
        beforeAfterMeal: [2],
        timingMorning: [false],
        timingNoon: [false],
        timingAfternoon: [false],
        timingEvening: [false],
        isPrn: [false],
        specialInstructions: ['', Validators.maxLength(TEXT_MAX)],
        isInsuranceCovered: [false],
    });

    get isDuplicate(): boolean {
        return !!this.medicine && !this.line && this.existingMedicineIds.includes(this.medicine.id);
    }

    ngOnInit(): void {
        this.search.valueChanges
            .pipe(
                tap(() => { this.searchError = null; }),
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(term => {
                    const q = term.trim();
                    if (q.length < 2 || !this.canSearch) {
                        this.results = [];
                        this.searched = false;
                        this.searching = false;
                        return of(null);
                    }
                    this.searching = true;
                    return this.rxSrv.searchMedicines(q).pipe(
                        catchError(() => {
                            this.searchError = 'Could not search medicines. Try again.';
                            return of(null);
                        }),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(res => {
                if (res) {
                    this.results = res.data?.items ?? [];
                    this.searched = true;
                }
                this.searching = false;
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['isOpen'] && !changes['line']) return;
        if (changes['isOpen'] && !this.isOpen) return;
        if (changes['isOpen']?.currentValue || changes['line']) this.begin();
    }

    private begin(): void {
        this.results = [];
        this.searched = false;
        this.searchError = null;
        this.search.setValue('', { emitEvent: false });
        if (this.line) {
            const i = this.line.input;
            this.medicine = { id: i.medicineId, name: i.medicineName, genericName: i.genericName, isCatalogVerified: i.isCatalogVerified };
            this.form.reset({
                dosageInstructions: i.dosageInstructions,
                frequency: i.frequency,
                durationInDays: String(i.durationInDays),
                quantityPrescribed: String(i.quantityPrescribed),
                unit: i.unit,
                pricePerUnit: String(i.pricePerUnit),
                refillCount: String(i.refillCount),
                strength: i.strength ?? '',
                dosageForm: i.dosageForm,
                routeOfAdministration: i.routeOfAdministration ?? '',
                beforeAfterMeal: i.beforeAfterMeal,
                timingMorning: i.timingMorning,
                timingNoon: i.timingNoon,
                timingAfternoon: i.timingAfternoon,
                timingEvening: i.timingEvening,
                isPrn: i.isPrn,
                specialInstructions: i.specialInstructions ?? '',
                isInsuranceCovered: i.isInsuranceCovered,
            });
        } else {
            this.medicine = null;
            this.form.reset();
        }
        if (this.isOpen) {
            // Wait for the drawer's slide-in before moving focus into it.
            setTimeout(() => this.host.querySelector<HTMLElement>(this.line ? 'input' : 'input[type="search"]')?.focus(), 350);
        }
    }

    stockLabel(m: MedicineSearchResult): string {
        return m.status === 'OutOfStock' ? 'Out of stock' : m.status === 'LowStock' ? 'Low stock' : 'In stock';
    }

    stockTone(m: MedicineSearchResult): 'danger' | 'warning' | 'success' {
        return m.status === 'OutOfStock' ? 'danger' : m.status === 'LowStock' ? 'warning' : 'success';
    }

    choose(m: MedicineSearchResult): void {
        this.medicine = { id: m.id, name: m.name, genericName: m.genericName ?? null, isCatalogVerified: true };
        this.results = [];
        this.search.setValue('', { emitEvent: false });
        this.searched = false;
        setTimeout(() => this.host.querySelector<HTMLElement>('#rx-dosage input, input#rx-dosage')?.focus());
    }

    clearMedicine(): void {
        this.medicine = null;
        setTimeout(() => this.host.querySelector<HTMLElement>('input[type="search"]')?.focus());
    }

    showRange(name: 'durationInDays' | 'quantityPrescribed' | 'pricePerUnit' | 'refillCount'): boolean {
        const c = this.form.controls[name];
        return !!c.errors?.['range'] && (c.touched || c.dirty);
    }

    submit(): void {
        if (!this.medicine) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('.ng-invalid input, .ng-invalid textarea')?.focus());
            return;
        }
        const v = this.form.getRawValue();
        this.saved.emit({
            id: this.line?.input.id ?? null,
            medicineId: this.medicine.id,
            medicineName: this.medicine.name,
            genericName: this.medicine.genericName,
            strength: v.strength.trim() || null,
            dosageForm: v.dosageForm || null,
            quantityPrescribed: Number(v.quantityPrescribed),
            dosageInstructions: v.dosageInstructions.trim(),
            frequency: v.frequency.trim(),
            durationInDays: Number(v.durationInDays),
            routeOfAdministration: v.routeOfAdministration.trim() || null,
            specialInstructions: v.specialInstructions.trim() || null,
            pricePerUnit: Number(v.pricePerUnit),
            timingMorning: v.timingMorning,
            timingNoon: v.timingNoon,
            timingAfternoon: v.timingAfternoon,
            timingEvening: v.timingEvening,
            isPrn: v.isPrn,
            beforeAfterMeal: Number(v.beforeAfterMeal),
            unit: v.unit.trim(),
            refillCount: Number(v.refillCount),
            isInsuranceCovered: v.isInsuranceCovered,
            isCatalogVerified: this.medicine.isCatalogVerified,
        });
    }

    requestClose(): void {
        if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.close.emit();
    }

    /** Called once leaving is confirmed (the drawer backdrop asks itself when the form is dirty). */
    discard(): void {
        this.form.reset();
        this.close.emit();
    }
}
