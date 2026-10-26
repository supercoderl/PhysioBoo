import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
    BooButtonComponent,
    BooCheckboxComponent,
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
import { Observable, Subject, of } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { DepartmentService } from '../../../../services/admin/department.service';
import { DoctorService } from '../../../../services/admin/doctor.service';
import { MedicalServiceService } from '../../../../services/admin/medical-service.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { PaginationData } from '../../../../shared/types/common';
import { ServiceFilter } from '../../../../shared/types/filter.types';
import { MedicalService, ServiceAvailability, ServiceStats, ServiceStatus } from '../../../../shared/types/service.types';
import { CmsServiceDetailDrawerComponent } from './service-detail-drawer.component';
import { CmsServiceEditDrawerComponent } from './service-edit-drawer.component';
import {
    AVAILABILITY,
    AVAILABILITY_OPTIONS,
    LookupOption,
    ServiceMoveKind,
    ServiceTransition,
    availabilityOf,
    bookingRuleOf,
    doctorCountOf,
    formatDuration,
    formatMoney,
    rowMoveOf,
    statusOf,
} from './service.utils';

type LoadError = 'forbidden' | 'failed';
type BusyKind = ServiceMoveKind | 'duplicate' | 'delete';

interface FilterChip extends BooFilterChip {
    kind: 'search' | 'department' | 'doctor' | 'availability';
}

interface StatusTab {
    value: ServiceStatus | null;
    label: string;
}

const PAGE_SIZE = 20;

/**
 * Medical service catalog (POST /api/medical-services/search). The server searches name, code and short name, filters
 * by lifecycle status, department, doctor and availability, and hides archived services unless that status is asked
 * for. Publish, archive and restore have their own endpoints; deactivating is a PATCH of the status alone.
 */
@Component({
    selector: 'admin-service',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DecimalPipe,
        FormsModule,
        BooButtonComponent,
        BooCheckboxComponent,
        BooIconComponent,
        BooSearchFieldComponent,
        BooFilterChipsComponent,
        BooSelectComponent,
        BooStatusBadgeComponent,
        BooPaginationComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooInlineErrorComponent,
        CmsServiceDetailDrawerComponent,
        CmsServiceEditDrawerComponent,
    ],
    templateUrl: './service.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class AdminServiceComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly srv = inject(MedicalServiceService);
    private readonly departmentSrv = inject(DepartmentService);
    private readonly doctorSrv = inject(DoctorService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly statusTabs: StatusTab[] = [
        { value: null, label: 'All services' },
        { value: 'Active', label: 'Active' },
        { value: 'Draft', label: 'Drafts' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Archived', label: 'Archived' },
    ];
    readonly availabilityOptions = AVAILABILITY_OPTIONS;
    readonly sortOptions = [
        { value: '-updatedAt', label: 'Recently updated' },
        { value: '-createdAt', label: 'Newest first' },
        { value: '+name', label: 'Name (A–Z)' },
        { value: '-name', label: 'Name (Z–A)' },
        { value: '+code', label: 'Code (A–Z)' },
        { value: '+basePrice', label: 'Price (low to high)' },
        { value: '-basePrice', label: 'Price (high to low)' },
    ];
    readonly skeletonRows = Array.from({ length: 6 });
    readonly status = statusOf;
    readonly availability = availabilityOf;
    readonly money = formatMoney;
    readonly duration = formatDuration;
    readonly bookingRule = bookingRuleOf;
    readonly doctorCount = doctorCountOf;
    readonly rowMove = rowMoveOf;

    query = '';
    statusFilter: ServiceStatus | null = null;
    departmentFilter: string | null = null;
    doctorFilter: string | null = null;
    availabilityFilter: ServiceAvailability | null = null;
    sort = '-updatedAt';
    page = 1;

    data: PaginationData<MedicalService> | null = null;
    stats: ServiceStats | null = null;
    loading = false;
    /** A keystroke is waiting for its debounced search. */
    searchPending = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    /** Services with a request in flight, and which one. */
    busy = new Map<string, BusyKind>();
    /** Rows ticked on the current page, for bulk archive and delete. */
    picked = new Set<string>();
    bulkBusy: 'archive' | 'delete' | null = null;
    exporting = false;

    departmentOptions: LookupOption[] = [];
    doctorOptions: LookupOption[] = [];

    selected: MedicalService | null = null;
    editorOpen = false;
    editing: MedicalService | null = null;
    /** Reopen the details after editing when the edit started there. */
    private returnToDetail = false;

    canCreate = false;
    canUpdate = false;
    canDelete = false;

    private readonly load$ = new Subject<void>();
    private readonly query$ = new Subject<string>();
    /** The search term last sent to the server. */
    private lastSearched = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));

        // switchMap drops the response of a search the user has already moved past; errors are caught per request
        // so the stream stays alive for the next one.
        this.load$
            .pipe(
                switchMap(() => {
                    this.loading = true;
                    return this.srv.search({
                        pageNumber: this.page,
                        pageSize: PAGE_SIZE,
                        search: this.searchTerm,
                        sort: this.sort,
                        filter: this.buildFilter(),
                    }).pipe(
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
                // Ticks only make sense for rows still on screen.
                const onPage = new Set(this.data.items.map(s => s.id));
                this.picked = new Set([...this.picked].filter(id => onPage.has(id)));
                // Keep open details in step with the refreshed row.
                const open = this.selected;
                if (open) this.selected = this.data.items.find(s => s.id === open.id) ?? open;
            });

        this.query$
            .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                // Read the field now rather than the emitted value, in case filters were cleared meanwhile.
                const term = this.searchTerm;
                this.searchPending = false;
                if (term === this.lastSearched) return;
                this.lastSearched = term;
                this.page = 1;
                this.load();
            });

        this.load();
        this.loadStats();
        this.loadLookups();
    }
    // #endregion

    // #region Getters
    get items(): MedicalService[] {
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

    get searchTerm(): string {
        return this.query.trim();
    }

    /** Filters other than the status tab. */
    get hasFilters(): boolean {
        return this.chips.length > 0;
    }

    get chips(): FilterChip[] {
        const chips: FilterChip[] = [];
        if (this.searchTerm) chips.push({ kind: 'search', label: `“${this.searchTerm}”` });
        if (this.departmentFilter) chips.push({ kind: 'department', label: this.labelOf(this.departmentOptions, this.departmentFilter, 'Department') });
        if (this.doctorFilter) chips.push({ kind: 'doctor', label: this.labelOf(this.doctorOptions, this.doctorFilter, 'Doctor') });
        if (this.availabilityFilter) chips.push({ kind: 'availability', label: AVAILABILITY[this.availabilityFilter].label });
        return chips;
    }

    get activeTab(): StatusTab {
        return this.statusTabs.find(t => t.value === this.statusFilter) ?? this.statusTabs[0];
    }

    get sortLabel(): string {
        return this.sortOptions.find(o => o.value === this.sort)?.label.toLowerCase() ?? '';
    }

    get countNoun(): string {
        const n = this.data?.totalCount ?? 0;
        const noun = n === 1 ? 'service' : 'services';
        switch (this.statusFilter) {
            case 'Active': return `active ${noun}`;
            case 'Draft': return n === 1 ? 'draft' : 'drafts';
            case 'Inactive': return `inactive ${noun}`;
            case 'Archived': return `archived ${noun}`;
            default: return `${noun}, excluding archived`;
        }
    }

    /** Ticking rows is offered only when a bulk action is allowed. */
    get canSelect(): boolean {
        return this.canUpdate || this.canDelete;
    }

    get allPicked(): boolean {
        return this.items.length > 0 && this.items.every(s => this.picked.has(s.id));
    }

    get busySelected(): boolean {
        return !!this.selected && this.busy.has(this.selected.id);
    }

    get pendingSelected(): BusyKind | null {
        return this.selected ? this.busy.get(this.selected.id) ?? null : null;
    }
    // #endregion

    // #region Methods
    load(): void {
        if (this.data && this.loadError === 'failed') this.refreshErrorState = 'retrying';
        this.load$.next();
    }

    onQueryChange(): void {
        this.searchPending = this.searchTerm !== this.lastSearched;
        this.query$.next(this.query);
    }

    clearSearch(): void {
        this.query = '';
        this.onQueryChange();
    }

    selectStatus(value: ServiceStatus | null): void {
        if (value === this.statusFilter) return;
        this.statusFilter = value;
        this.picked = new Set();
        this.page = 1;
        this.load();
    }

    /** Arrow keys, Home and End move between status tabs. */
    onTabKey(event: KeyboardEvent, index: number): void {
        const last = this.statusTabs.length - 1;
        const next = event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
            : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
            : event.key === 'Home' ? 0
            : event.key === 'End' ? last
            : null;
        if (next === null) return;
        event.preventDefault();
        this.selectStatus(this.statusTabs[next].value);
        this.host.querySelector<HTMLElement>(`#service-tab-${next}`)?.focus();
    }

    onFilterChange(): void {
        this.page = 1;
        this.load();
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.page) return;
        this.page = page;
        this.picked = new Set();
        this.load();
    }

    removeChip(chip: FilterChip): void {
        switch (chip.kind) {
            case 'search': this.clearSearch(); return;
            case 'department': this.departmentFilter = null; break;
            case 'doctor': this.doctorFilter = null; break;
            case 'availability': this.availabilityFilter = null; break;
        }
        this.onFilterChange();
    }

    clearFilters(): void {
        this.query = '';
        this.departmentFilter = null;
        this.doctorFilter = null;
        this.availabilityFilter = null;
        this.searchPending = false;
        this.lastSearched = '';
        this.page = 1;
        this.load();
    }

    showAll(): void {
        this.statusFilter = null;
        this.clearFilters();
    }

    // Selection and bulk actions
    togglePick(s: MedicalService, on: boolean): void {
        const next = new Set(this.picked);
        if (on) next.add(s.id);
        else next.delete(s.id);
        this.picked = next;
    }

    togglePickAll(on: boolean): void {
        this.picked = on ? new Set(this.items.map(s => s.id)) : new Set();
    }

    clearPicked(): void {
        this.picked = new Set();
    }

    bulkArchive(): void {
        const ids = [...this.picked];
        if (!this.canUpdate || !ids.length || this.bulkBusy) return;
        const n = ids.length;
        this.dialogSrv.confirm(
            `Archive ${n} ${n === 1 ? 'service' : 'services'}? Active ones leave the website. You can restore them from the Archived tab.`,
            () => this.runBulk('archive', ids, this.srv.bulkArchive(ids), `${n} ${n === 1 ? 'service' : 'services'} archived`),
            'Archive services',
            'warning',
            'Archive',
            'Cancel',
        );
    }

    bulkDelete(): void {
        const ids = [...this.picked];
        if (!this.canDelete || !ids.length || this.bulkBusy) return;
        const n = ids.length;
        this.dialogSrv.confirm(
            `Delete ${n} ${n === 1 ? 'service' : 'services'}? This can't be undone. To keep them on record, archive them instead.`,
            () => this.runBulk('delete', ids, this.srv.bulkDelete(ids), `${n} ${n === 1 ? 'service' : 'services'} deleted`),
            'Delete services',
            'danger',
            'Delete',
            'Cancel',
        );
    }

    /** Downloads the catalog as CSV, with the current search, tab and filters applied. */
    exportCsv(): void {
        if (this.exporting) return;
        this.exporting = true;
        this.srv.export({ pageNumber: 1, pageSize: PAGE_SIZE, search: this.searchTerm, sort: this.sort, filter: this.buildFilter() })
            .pipe(finalize(() => this.exporting = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: blob => this.download(blob, `medical-services-${new Date().toISOString().slice(0, 10)}.csv`),
                // The global HTTP error toast reports the failure.
                error: () => undefined,
            });
    }

    // Drawers
    openDetail(s: MedicalService): void {
        this.editorOpen = false;
        this.editing = null;
        this.selected = s;
    }

    openCreate(): void {
        if (!this.canCreate) return;
        this.returnToDetail = false;
        this.selected = null;
        this.editing = null;
        this.editorOpen = true;
    }

    openEdit(s: MedicalService, fromDetail = false): void {
        if (!this.canUpdate || this.busy.has(s.id)) return;
        this.returnToDetail = fromDetail;
        this.selected = null;
        this.editing = s;
        this.editorOpen = true;
    }

    closeEditor(): void {
        const s = this.editing;
        this.editorOpen = false;
        this.editing = null;
        if (s && this.returnToDetail) this.selected = this.items.find(i => i.id === s.id) ?? s;
        this.returnToDetail = false;
    }

    onSaved({ service, created }: { service: MedicalService | null; id: string; created: boolean }): void {
        const name = service?.name ?? 'Service';
        const verb = created ? (service?.status === 'Active' ? 'Service added and published' : 'Service added') : 'Service updated';
        this.toastSrv.success(name, verb);
        this.editorOpen = false;
        this.editing = null;
        this.returnToDetail = false;
        // Show what was saved so it can be checked, and published when it is a draft.
        this.selected = service;
        this.load();
        this.loadStats();
    }

    /** Applies a status move, asking first when it changes what the website lists. */
    move(s: MedicalService, t: ServiceTransition): void {
        if (!this.canUpdate || this.busy.has(s.id)) return;
        if (!t.confirm) {
            this.applyMove(s, t);
            return;
        }
        const name = `“${s.name}”`;
        switch (t.kind) {
            case 'publish':
                this.dialogSrv.confirm(
                    `${t.label} ${name}? It will be listed on the public website and patients can book it.`,
                    () => this.applyMove(s, t), `${t.label} service`, 'info', t.label, 'Not yet',
                );
                return;
            case 'deactivate':
                this.dialogSrv.confirm(
                    `Deactivate ${name}? It will be taken off the website and can't be booked until you reactivate it.`,
                    () => this.applyMove(s, t), 'Deactivate service', 'warning', 'Deactivate', 'Keep active',
                );
                return;
            default:
                this.dialogSrv.confirm(
                    `Archive ${name}? It leaves the catalog${s.status === 'Active' ? ' and the website' : ''}. You can restore it from the Archived tab.`,
                    () => this.applyMove(s, t), 'Archive service', 'warning', 'Archive', 'Cancel',
                );
        }
    }

    duplicate(s: MedicalService): void {
        if (!this.canCreate || this.busy.has(s.id)) return;
        this.setBusy(s.id, 'duplicate');
        this.srv.duplicate(s.id)
            .pipe(
                switchMap(res => {
                    if (!res?.success || !res.data) throw new Error('Service was not duplicated');
                    return this.srv.search_by_id(res.data);
                }),
                finalize(() => this.setBusy(s.id, null)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    this.toastSrv.success(s.name, 'Copy created as a draft');
                    this.load();
                    this.loadStats();
                    // The copy gets a "-COPY" code; open it so it can be renamed right away.
                    const copy = res?.success && res.data ? res.data : null;
                    if (copy && this.canUpdate) this.openEdit(copy);
                    else if (copy) this.openDetail(copy);
                },
                // The global HTTP error toast reports the failure.
                error: () => undefined,
            });
    }

    confirmDelete(s: MedicalService): void {
        if (!this.canDelete || this.busy.has(s.id)) return;
        const live = s.status === 'Active' ? ' It will also disappear from the website.' : '';
        this.dialogSrv.confirm(
            `Delete “${s.name}”? This can't be undone.${live} To keep it on record, archive it instead.`,
            () => this.delete(s),
            'Delete service',
            'danger',
            'Delete service',
            'Keep service',
        );
    }

    trackById(_: number, s: MedicalService): string {
        return s.id;
    }

    tabIndex(tab: StatusTab): number {
        return this.statusTabs.indexOf(tab);
    }

    /** The other departments a service is linked to, beyond the one named on the row. */
    moreDepartments(s: MedicalService): number {
        return Math.max(0, (s.departmentIds?.length ?? 0) - 1);
    }
    // #endregion

    // #region Helpers
    private applyMove(s: MedicalService, t: ServiceTransition): void {
        this.setBusy(s.id, t.kind);
        const request$: Observable<unknown> =
            t.kind === 'publish' ? this.srv.publish(s.id)
            : t.kind === 'archive' ? this.srv.archive(s.id)
            : t.kind === 'restore' ? this.srv.restore(s.id)
            : this.srv.update(s.id, { status: 'Inactive' });

        request$
            .pipe(
                switchMap(() => this.srv.search_by_id(s.id)),
                finalize(() => this.setBusy(s.id, null)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    const saved = res?.success && res.data ? res.data : { ...s, status: t.to };
                    this.toastSrv.success(saved.name, t.done);
                    if (this.selected?.id === s.id) this.selected = saved;
                    this.load();
                    this.loadStats();
                },
                // The global HTTP error toast reports the failure; the service keeps its status.
                error: () => undefined,
            });
    }

    private delete(s: MedicalService): void {
        this.setBusy(s.id, 'delete');
        this.srv.delete(s.id)
            .pipe(finalize(() => this.setBusy(s.id, null)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success(s.name, 'Service deleted');
                    if (this.selected?.id === s.id) this.selected = null;
                    // Step back a page when the last row on it was removed.
                    if (this.items.length === 1 && this.page > 1) this.page--;
                    this.load();
                    this.loadStats();
                },
                // The global HTTP error toast reports the failure; the row stays.
                error: () => undefined,
            });
    }

    private runBulk(kind: 'archive' | 'delete', ids: string[], request$: Observable<unknown>, done: string): void {
        this.bulkBusy = kind;
        request$
            .pipe(finalize(() => this.bulkBusy = null), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success(done);
                    this.picked = new Set();
                    if (this.selected && ids.includes(this.selected.id)) this.selected = null;
                    if (ids.length >= this.items.length && this.page > 1) this.page--;
                    this.load();
                    this.loadStats();
                },
                // The global HTTP error toast reports the failure; the ticks stay so it can be retried.
                error: () => undefined,
            });
    }

    private loadStats(): void {
        this.srv.stats()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => this.stats = res?.success ? res.data : null,
                // The header summary is optional; it simply stays hidden.
                error: () => this.stats = null,
            });
    }

    /** Names for the department and doctor filters and drawers. Failing leaves those pickers empty, nothing else. */
    private loadLookups(): void {
        this.departmentSrv.search({ pageNumber: 1, pageSize: 200, sort: '+name' })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (res?.success) this.departmentOptions = (res.data.items ?? []).map(d => ({ label: d.name, value: d.id }));
                },
                error: () => undefined,
            });
        this.doctorSrv.search({ pageNumber: 1, pageSize: 200, sort: '+fullName' })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (res?.success) this.doctorOptions = (res.data.items ?? []).map(d => ({ label: d.fullName, value: d.id }));
                },
                error: () => undefined,
            });
    }

    private buildFilter(): ServiceFilter {
        return {
            departmentIds: this.departmentFilter ? [this.departmentFilter] : [],
            doctorIds: this.doctorFilter ? [this.doctorFilter] : [],
            status: this.statusFilter ? [this.statusFilter] : [],
            availability: this.availabilityFilter ? [this.availabilityFilter] : [],
            priceMin: null,
            priceMax: null,
            durationMin: null,
            durationMax: null,
        };
    }

    private download(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    private labelOf(options: LookupOption[], value: string, fallback: string): string {
        return options.find(o => o.value === value)?.label ?? fallback;
    }

    private setBusy(id: string, value: BusyKind | null): void {
        const next = new Map(this.busy);
        if (value === null) next.delete(id);
        else next.set(id, value);
        this.busy = next;
    }

    private failLoad(kind: LoadError): void {
        this.refreshErrorState = this.data && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
        this.loadError = kind;
    }

    private applyPermissions(perms: string[]): void {
        const can = (code: string) => perms.includes(code);
        // Actions follow the permissions the medical-service API enforces (duplicate needs create).
        this.canCreate = can(Permissions.Cms.ServiceCreate);
        this.canUpdate = can(Permissions.Cms.ServiceUpdate);
        this.canDelete = can(Permissions.Cms.ServiceDelete);
        if (!this.canSelect) this.picked = new Set();
    }
    // #endregion
}
