import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooFilterChip,
    BooFilterChipsComponent,
    BooIconComponent,
    BooInlineErrorComponent,
    BooInlineErrorState,
    BooPaginationComponent,
    BooSearchFieldComponent,
    BooStatusBadgeComponent,
} from '@physioboo/ui';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { AdminBreadcrumbComponent } from '../../../../components/breadcrumb/admin-breadcrumb.component';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { AdmissionService } from '../../../../services/admin/admission.service';
import { DepartmentService } from '../../../../services/admin/department.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { SKIP_ERROR_TOAST } from '../../../../shared/contexts/option.context';
import { Admission } from '../../../../shared/types/admission.types';
import { PaginationData } from '../../../../shared/types/common';
import { Department } from '../../../../shared/types/operation.types';
import { AdmissionDetailDrawerComponent } from './admission-detail-drawer.component';
import { AdmissionFormDrawerComponent, SavedAdmission } from './admission-form-drawer.component';
import { ADMISSION_STATUS, ADMISSION_TYPES, admissionStatus, admissionTypeTone, isActive } from './admission.utils';

type LoadError = 'forbidden' | 'failed';
type FilterKey = 'search' | 'status' | 'type' | 'department' | 'from' | 'to';

interface FilterChip extends BooFilterChip {
    key: FilterKey;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const LOOKUP_SIZE = 100;
/** "All" entry of a select; the select binds a null value to it. */
const ALL = null;

/**
 * Inpatient admissions. The list pages and filters on the server (search, status, type, department, admitted-between);
 * an admission is created for an existing patient, optionally with an available bed, and can be edited or discharged
 * while the patient is still admitted.
 */
@Component({
    selector: 'admin-admission',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        FormsModule,
        AdminBreadcrumbComponent,
        BooButtonComponent,
        BooDatepickerComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooFilterChipsComponent,
        BooIconComponent,
        BooInlineErrorComponent,
        BooPaginationComponent,
        BooSearchFieldComponent,
        BooSelectComponent,
        BooStatusBadgeComponent,
        AdmissionFormDrawerComponent,
        AdmissionDetailDrawerComponent,
    ],
    templateUrl: './admission.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class AdminAdmissionComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly admissionSrv = inject(AdmissionService);
    private readonly departmentSrv = inject(DepartmentService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly silent = new HttpContext().set(SKIP_ERROR_TOAST, true);

    readonly status = admissionStatus;
    readonly typeTone = admissionTypeTone;
    readonly active = isActive;
    readonly skeletonRows = Array.from({ length: 6 });
    readonly statusOptions = [
        { label: 'All statuses', value: ALL as string | null },
        ...Object.entries(ADMISSION_STATUS).map(([value, s]) => ({ label: s.label, value })),
    ];
    readonly typeOptions = [
        { label: 'All types', value: ALL as string | null },
        ...ADMISSION_TYPES.map(t => ({ label: t, value: t as string | null })),
    ];

    query = '';
    statusFilter: string | null = ALL;
    typeFilter: string | null = ALL;
    departmentId: string | null = ALL;
    from: string | null = null;
    to: string | null = null;
    page = 1;

    departmentOptions: { label: string; value: string | null }[] = [{ label: 'All departments', value: ALL }];
    chips: FilterChip[] = [];

    data: PaginationData<Admission> | null = null;
    loading = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';

    formOpen = false;
    editing: Admission | null = null;
    selected: Admission | null = null;
    discharging = false;

    canCreate = false;
    canUpdate = false;
    canDischarge = false;
    registerLink: string | null = null;

    private readonly load$ = new Subject<void>();
    private readonly search$ = new Subject<void>();
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));

        // switchMap drops the response of a search the user has already moved past; errors are caught per request
        // so the stream stays alive for the next search.
        this.load$
            .pipe(
                switchMap(() => {
                    this.loading = true;
                    return this.admissionSrv.search({
                        pageNumber: this.page,
                        pageSize: PAGE_SIZE,
                        sort: '-admittedat',
                        search: this.query.trim() || undefined,
                        filter: {
                            start: this.from,
                            end: this.to,
                            status: this.statusFilter,
                            type: this.typeFilter,
                            departmentId: this.departmentId,
                        },
                    }, this.silent).pipe(
                        map(res => ({ res, err: null as HttpErrorResponse | null })),
                        catchError((err: HttpErrorResponse) => of({ res: null, err })),
                        finalize(() => this.loading = false),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(({ res, err }) => {
                if (err || !res?.success || !res.data) {
                    this.failLoad(err?.status === 403 ? 'forbidden' : 'failed');
                    return;
                }
                this.data = { ...res.data, items: res.data.items ?? [] };
                this.loadError = null;
                this.refreshErrorState = 'default';
                // Keep an open details panel in step with the refreshed row.
                const open = this.selected;
                if (open) this.selected = this.data.items.find(a => a.id === open.id) ?? open;
            });

        this.search$
            .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.applyFilters());

        this.loadDepartments();
        this.buildChips();
        this.load();
    }
    // #endregion

    // #region Getters
    get items(): Admission[] {
        return this.data?.items ?? [];
    }

    get totalPages(): number {
        return Math.max(1, this.data?.totalPages ?? Math.ceil((this.data?.totalCount ?? 0) / PAGE_SIZE));
    }

    get firstShown(): number {
        return this.items.length ? (this.page - 1) * PAGE_SIZE + 1 : 0;
    }

    get lastShown(): number {
        return (this.page - 1) * PAGE_SIZE + this.items.length;
    }

    get rangeInvalid(): boolean {
        return !!this.from && !!this.to && this.from > this.to;
    }

    get filtering(): boolean {
        return this.chips.length > 0;
    }
    // #endregion

    // #region Methods
    load(): void {
        if (this.rangeInvalid) return;
        if (this.data && this.loadError === 'failed') this.refreshErrorState = 'retrying';
        this.load$.next();
    }

    onSearchInput(): void {
        this.search$.next();
    }

    applyFilters(): void {
        this.page = 1;
        this.buildChips();
        this.load();
    }

    removeChip(chip: FilterChip): void {
        switch (chip.key) {
            case 'search': this.query = ''; break;
            case 'status': this.statusFilter = ALL; break;
            case 'type': this.typeFilter = ALL; break;
            case 'department': this.departmentId = ALL; break;
            case 'from': this.from = null; break;
            case 'to': this.to = null; break;
        }
        this.applyFilters();
    }

    clearFilters(): void {
        this.query = '';
        this.statusFilter = ALL;
        this.typeFilter = ALL;
        this.departmentId = ALL;
        this.from = null;
        this.to = null;
        this.applyFilters();
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.page) return;
        this.page = page;
        this.load();
    }

    openForm(): void {
        this.editing = null;
        this.formOpen = true;
    }

    openEdit(): void {
        if (!this.selected) return;
        this.editing = this.selected;
        this.formOpen = true;
    }

    closeForm(): void {
        this.formOpen = false;
    }

    onSaved(saved: SavedAdmission): void {
        this.closeForm();

        if (saved.mode === 'create') {
            // The new admission must be visible: show the newest first with no filter that could hide it.
            this.clearFiltersSilently();
        }
        this.load();

        this.admissionSrv.search_by_id(saved.id, this.silent)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    const a = res.success ? res.data : null;
                    if (a) this.selected = a;
                    this.toastSrv.success(
                        a ? `${a.patientName || 'Patient'} · ${a.admissionNumber}` : 'Admission saved',
                        saved.mode === 'create' ? 'Patient admitted' : 'Admission updated',
                    );
                },
                error: () => this.toastSrv.success('Admission saved', saved.mode === 'create' ? 'Patient admitted' : 'Admission updated'),
            });
    }

    confirmDischarge(notes: string | null): void {
        const a = this.selected;
        if (!a || this.discharging) return;
        this.dialogSrv.confirm(
            `Discharge ${a.patientName || 'this patient'} (${a.admissionNumber})?${a.bedNumber ? ` Bed ${a.bedNumber} becomes available.` : ''} This can't be undone here.`,
            () => this.discharge(a, notes),
            'Discharge patient',
            'warning',
            'Discharge',
            'Keep admitted',
        );
    }

    openDetails(a: Admission): void {
        this.selected = a;
    }

    trackById(_: number, a: Admission): string {
        return a.id;
    }
    // #endregion

    // #region Helpers
    private discharge(a: Admission, notes: string | null): void {
        this.discharging = true;
        this.admissionSrv.discharge(a.id, { notes })
            .pipe(finalize(() => this.discharging = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (!res.success) return;
                    this.toastSrv.success(`${a.patientName || 'Patient'} · ${a.admissionNumber}`, 'Patient discharged');
                    this.refreshSelected(a.id);
                    this.load();
                },
                // The global HTTP error toast reports the failure (e.g. already discharged); the notes stay in the panel.
                error: () => this.refreshSelected(a.id),
            });
    }

    /** Fetches the admission again so the open panel shows its real status, even when the list filter hides it. */
    private refreshSelected(id: string): void {
        this.admissionSrv.search_by_id(id, this.silent)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (res.success && res.data && this.selected?.id === id) this.selected = res.data;
                },
                error: () => undefined,
            });
    }

    private loadDepartments(): void {
        // The filter is optional: when the departments can't be read the page works without it.
        this.departmentSrv.search({ pageNumber: 1, pageSize: LOOKUP_SIZE, filter: { start: '', end: '' } }, this.silent)
            .pipe(
                map(res => (res?.success ? res.data?.items ?? [] : []).filter((d: Department) => d.isActive)),
                catchError(() => of<Department[]>([])),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(items => {
                this.departmentOptions = [{ label: 'All departments', value: ALL }, ...items.map(d => ({ label: d.name, value: d.id as string | null }))];
                this.buildChips();
            });
    }

    private clearFiltersSilently(): void {
        this.query = '';
        this.statusFilter = ALL;
        this.typeFilter = ALL;
        this.departmentId = ALL;
        this.from = null;
        this.to = null;
        this.page = 1;
        this.buildChips();
    }

    private buildChips(): void {
        const chips: FilterChip[] = [];
        if (this.query.trim()) chips.push({ key: 'search', label: `Search: ${this.query.trim()}` });
        if (this.statusFilter) chips.push({ key: 'status', label: this.status(this.statusFilter).label });
        if (this.typeFilter) chips.push({ key: 'type', label: this.typeFilter });
        if (this.departmentId) chips.push({ key: 'department', label: this.departmentOptions.find(o => o.value === this.departmentId)?.label ?? 'Department' });
        if (this.from) chips.push({ key: 'from', label: `From ${this.dayLabel(this.from)}` });
        if (this.to) chips.push({ key: 'to', label: `To ${this.dayLabel(this.to)}` });
        this.chips = chips;
    }

    /** YYYY-MM-DD as a short local date (new Date('YYYY-MM-DD') would be UTC midnight). */
    private dayLabel(value: string): string {
        const [y, m, d] = value.split('-').map(Number);
        return y && m && d ? new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : value;
    }

    private failLoad(kind: LoadError): void {
        this.refreshErrorState = this.data && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
        this.loadError = kind;
    }

    private applyPermissions(perms: string[]): void {
        const can = (code: string) => perms.includes(code);
        // Actions follow the permissions the admission API enforces.
        this.canCreate = can(Permissions.Inpatient.AdmissionCreate);
        this.canUpdate = can(Permissions.Inpatient.AdmissionUpdate);
        this.canDischarge = can(Permissions.Inpatient.AdmissionDischarge);
        this.registerLink = can(Permissions.Reception.PatientRegister) ? '/admin/reception/registration' : null;
    }
    // #endregion
}
