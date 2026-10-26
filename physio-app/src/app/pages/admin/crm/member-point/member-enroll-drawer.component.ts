import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BooButtonComponent, BooCheckboxComponent, BooIconComponent, BooSearchFieldComponent } from '@physioboo/ui';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { MemberService } from '../../../../services/admin/member.service';
import { PatientService } from '../../../../services/admin/patient.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { MembershipTier } from '../../../../shared/types/member.types';
import { Patient } from '../../../../shared/types/patient.types';
import { cleanSearch, displayName } from '../patient/patient.utils';
import { TIER_OPTIONS, serverMessage } from './member.utils';

const LOOKUP_SIZE = 8;

/**
 * Enrolls an existing patient in the loyalty programme (POST /api/members). Patients are found with the patient
 * search, which matches the start of a patient number only. Any loyalty points the patient already holds carry
 * over into the new membership.
 */
@Component({
    selector: 'crm-member-enroll-drawer',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DecimalPipe,
        FormsModule,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooSearchFieldComponent,
        BooCheckboxComponent,
        BooSelectComponent,
    ],
    template: `
        <drawer [isOpen]="open" [isShowDialog]="dirty && !submitting" (close)="discard()">
            <form
                *ngIf="open"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="member-enroll-title"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">Loyalty programme</p>
                        <h2 id="member-enroll-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular">Enroll a member</h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">Members are existing patients. Register new people at reception first.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close enroll member" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    <!-- Patient -->
                    <div>
                        <p class="m-0 mb-1 text-[13px] font-medium text-regular">Patient <span class="text-danger" aria-hidden="true">*</span></p>
                        <div *ngIf="patient as p; else lookupTpl" class="flex items-center justify-between gap-3 rounded-lg border border-rowDivider px-4 py-3">
                            <div class="min-w-0">
                                <p class="m-0 text-sm font-semibold text-regular truncate">{{ patientName(p) }}</p>
                                <p class="m-0 mt-0.5 text-xs text-secondary tabular-nums truncate">{{ p.patientNumber }}<ng-container *ngIf="p.phone"> · {{ p.phone }}</ng-container></p>
                                <p *ngIf="p.loyaltyPoints > 0" class="m-0 mt-1 text-xs text-secondary"><span class="font-medium text-regular tabular-nums">{{ p.loyaltyPoints | number }} pts</span> already earned will carry over.</p>
                            </div>
                            <button type="button" boo-button variant="link" size="sm" [disabled]="submitting" (click)="clearPatient()">Change</button>
                        </div>
                        <ng-template #lookupTpl>
                            <boo-search-field
                                label="Find a patient by patient number"
                                placeholder="Patient number, e.g. PAT-"
                                name="me-patient"
                                [maxlength]="50"
                                [(ngModel)]="query"
                                (ngModelChange)="onQueryChange()"
                                [busy]="searching"
                                (clear)="query = ''; onQueryChange()"
                                aria-describedby="me-patient-msg"
                            />
                            <p id="me-patient-msg" class="m-0 mt-1 text-xs" [class.text-danger]="lookupError" [class.text-secondary]="!lookupError" aria-live="polite">
                                <ng-container *ngIf="lookupError; else lookupHintTpl">{{ lookupError }}</ng-container>
                                <ng-template #lookupHintTpl>
                                    <ng-container *ngIf="searched && !results.length && !searching; else typeHintTpl">No patient number starts with “{{ searched }}”.</ng-container>
                                    <ng-template #typeHintTpl>Matches the start of a patient number.</ng-template>
                                </ng-template>
                            </p>
                            <ul *ngIf="results.length" class="m-0 mt-2 p-0 list-none rounded-lg border border-rowDivider divide-y divide-rowDivider" aria-label="Matching patients">
                                <li *ngFor="let p of results">
                                    <button
                                        type="button"
                                        class="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-transparent border-0 text-left cursor-pointer hover:bg-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                                        (click)="selectPatient(p)"
                                    >
                                        <span class="min-w-0">
                                            <span class="block text-sm font-medium text-regular truncate">{{ patientName(p) }}</span>
                                            <span class="block mt-0.5 text-xs text-secondary tabular-nums truncate">{{ p.patientNumber }}<ng-container *ngIf="p.phone"> · {{ p.phone }}</ng-container></span>
                                        </span>
                                        <physio-icon name="chevron-right" [size]="14" class="flex-none text-placeholder" aria-hidden="true" />
                                    </button>
                                </li>
                            </ul>
                        </ng-template>
                    </div>

                    <div class="sm:w-1/2">
                        <label for="me-enroll-tier" class="block mb-1 text-[13px] font-medium text-regular">Tier <span class="text-danger" aria-hidden="true">*</span></label>
                        <boo-select id="me-enroll-tier" name="me-enroll-tier" label="Select a tier" required [options]="tierOptions" [(ngModel)]="tier" (ngModelChange)="touched = true" />
                    </div>

                    <boo-checkbox name="me-terms" [(ngModel)]="agreed" (ngModelChange)="touched = true" label="The patient agrees to the loyalty programme terms and conditions" />

                    <p *ngIf="submitError" class="m-0 flex items-start gap-2 rounded-lg border border-dangerBorder bg-dangerSoft px-3 py-2.5 text-sm text-danger" role="alert">
                        <physio-icon name="circle-alert" [size]="16" class="flex-none mt-0.5" aria-hidden="true" />
                        <span>{{ submitError }}</span>
                    </p>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!canSubmit">Enroll member</button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CrmMemberEnrollDrawerComponent implements OnChanges {
    @Input() open = false;
    @Output() close = new EventEmitter<void>();
    /** Carries the new member's id. */
    @Output() enrolled = new EventEmitter<{ id: string; patient: Patient }>();

    private readonly memberSrv = inject(MemberService);
    private readonly patientSrv = inject(PatientService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);

    readonly tierOptions = TIER_OPTIONS;
    readonly patientName = displayName;

    query = '';
    searched = '';
    searching = false;
    results: Patient[] = [];
    lookupError: string | null = null;
    patient: Patient | null = null;
    tier: MembershipTier | null = null;
    agreed = false;
    touched = false;
    submitting = false;
    submitError: string | null = null;

    private readonly query$ = new Subject<string>();

    constructor() {
        this.query$
            .pipe(
                debounceTime(300),
                switchMap(term => {
                    if (!term) {
                        this.searching = false;
                        return of({ term, items: [] as Patient[], err: null as HttpErrorResponse | null });
                    }
                    return this.patientSrv.search({ pageNumber: 1, pageSize: LOOKUP_SIZE, search: term, filter: { start: '', end: '' } }).pipe(
                        map(res => ({ term, items: res?.success ? res.data?.items ?? [] : [], err: null as HttpErrorResponse | null })),
                        catchError((err: HttpErrorResponse) => of({ term, items: [] as Patient[], err })),
                        finalize(() => this.searching = false),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(({ term, items, err }) => {
                this.searched = term;
                this.results = items;
                this.lookupError = err
                    ? err.status === 403 ? "You don't have access to patient records." : "Couldn't search patients. Try again."
                    : null;
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['open']?.currentValue && !changes['open'].previousValue) this.reset();
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open) this.requestClose();
    }

    get dirty(): boolean {
        return !!this.patient || this.touched || !!this.query.trim();
    }

    get canSubmit(): boolean {
        return !!this.patient && !!this.tier && this.agreed && !this.submitting;
    }

    onQueryChange(): void {
        const term = cleanSearch(this.query);
        this.searching = !!term;
        if (!term) {
            this.results = [];
            this.searched = '';
        }
        this.query$.next(term);
    }

    selectPatient(p: Patient): void {
        this.patient = p;
        this.results = [];
        this.query = '';
        this.searched = '';
        this.submitError = null;
    }

    clearPatient(): void {
        this.patient = null;
        this.submitError = null;
    }

    submit(): void {
        const p = this.patient;
        const tier = this.tier;
        if (!p || !tier || !this.canSubmit) return;
        this.submitting = true;
        this.submitError = null;
        this.memberSrv.enroll({ patientId: p.id, tier })
            .pipe(finalize(() => this.submitting = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (!res?.success || !res.data) {
                        this.submitError = res?.errors?.[0] ?? "The patient wasn't enrolled.";
                        return;
                    }
                    this.touched = false;
                    this.enrolled.emit({ id: res.data, patient: p });
                },
                error: err => this.submitError = serverMessage(err) ?? "The patient wasn't enrolled. Check your connection and try again.",
            });
    }

    requestClose(): void {
        if (this.submitting) return;
        if (this.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.discard();
    }

    discard(): void {
        if (this.submitting) return;
        this.reset();
        this.close.emit();
    }

    private reset(): void {
        this.query = '';
        this.searched = '';
        this.searching = false;
        this.results = [];
        this.lookupError = null;
        this.patient = null;
        this.tier = null;
        this.agreed = false;
        this.touched = false;
        this.submitError = null;
        this.query$.next('');
    }
}
