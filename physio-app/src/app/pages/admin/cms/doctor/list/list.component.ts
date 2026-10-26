import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
import { BooDatepickerComponent } from '../../../../../components/date-picker/boo-date-picker.component';
import { CmsDoctorDrawerComponent } from '../../../../../components/layout/admin/cms/doctor/doctor-drawer.component';
import { BooSelectComponent } from '../../../../../components/select/boo-select/boo-select.component';
import { DoctorService } from '../../../../../services/admin/doctor.service';
import { MedicalSpecialtyService } from '../../../../../services/admin/medical-specialty.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { Permissions } from '../../../../../shared/constants/permission.constant';
import { PaginationData } from '../../../../../shared/types/common';
import { Doctor } from '../../../../../shared/types/medical-staff.types';
import { CmsDoctorDetailDrawerComponent } from '../doctor-detail-drawer.component';
import { CmsDoctorProfileDrawerComponent } from '../doctor-profile-drawer.component';
import { cleanSearch, consultModes, displayName, gapSummary, initials, isoDate, languageList, years } from '../doctor.utils';

type LoadError = 'forbidden' | 'failed';

interface FilterChip extends BooFilterChip {
    kind: 'search' | 'range';
}

const PAGE_SIZE = 20;

/**
 * Doctor directory (POST /api/doctors/search): the public face of each doctor — photo, specialty, bio, background
 * and how patients can see them.
 *
 * What the server offers shapes the toolbar: search matches the start of an employee ID only, the one filter is the
 * date a doctor was added (applied when both dates are set), and employee ID is the only sort it honours. There is no
 * server filter for specialty, verification or featured, so none is offered.
 *
 * Doctor records belong to HR (hr:doctor:* permissions). This page edits the public profile only; registration still
 * opens the existing HR registration form because no other screen offers it.
 */
@Component({
    selector: 'cms-doctor-list',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        DecimalPipe,
        FormsModule,
        BooButtonComponent,
        BooIconComponent,
        BooSearchFieldComponent,
        BooFilterChipsComponent,
        BooSelectComponent,
        BooDatepickerComponent,
        BooStatusBadgeComponent,
        BooPaginationComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooInlineErrorComponent,
        CmsDoctorDetailDrawerComponent,
        CmsDoctorProfileDrawerComponent,
        CmsDoctorDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class CmsDoctorListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly srv = inject(DoctorService);
    private readonly specialtySrv = inject(MedicalSpecialtyService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);

    readonly sortOptions = [
        { value: '+employeeid', label: 'Employee ID (A–Z)' },
        { value: '-employeeid', label: 'Employee ID (Z–A)' },
    ];
    readonly skeletonRows = Array.from({ length: 8 });
    readonly name = displayName;
    readonly initials = initials;
    readonly gaps = gapSummary;
    readonly modes = consultModes;
    readonly years = years;
    readonly languages = (d: Doctor) => languageList(d).join(', ');

    today = isoDate(new Date());
    query = '';
    from: string | null = null;
    to: string | null = null;
    sort = '+employeeid';
    page = 1;

    data: PaginationData<Doctor> | null = null;
    loading = false;
    /** A keystroke is waiting for its debounced search. */
    searchPending = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    /** Doctors with a delete in flight. */
    busyIds = new Set<string>();
    /** Photos that failed to load; those rows fall back to initials. */
    brokenPhotos = new Set<string>();

    /** Specialty names by id. Empty when the lookup is not allowed or fails; rows then say the name is unavailable. */
    specialtyNames = new Map<string, string>();

    selected: Doctor | null = null;
    editing: Doctor | null = null;
    registerOpen = false;
    /** Reopen the profile after editing when the edit started there. */
    private returnToDetail = false;

    canRegister = false;
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
                    const range = this.effectiveRange;
                    return this.srv.search({
                        pageNumber: this.page,
                        pageSize: PAGE_SIZE,
                        search: this.searchTerm,
                        sort: this.sort,
                        filter: { start: range?.from ?? '', end: range?.to ?? '' },
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
                // Keep an open profile in step with the refreshed row.
                const open = this.selected;
                if (open) this.selected = this.data.items.find(d => d.id === open.id) ?? open;
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
        this.loadSpecialties();
    }
    // #endregion

    // #region Getters
    get items(): Doctor[] {
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
        return cleanSearch(this.query);
    }

    get rangeInvalid(): boolean {
        return !!this.from && !!this.to && this.from > this.to;
    }

    /** Exactly one date picked; the server only filters when it gets both. */
    get rangePartial(): boolean {
        return !!this.from !== !!this.to;
    }

    get effectiveRange(): { from: string; to: string } | null {
        return this.from && this.to && !this.rangeInvalid ? { from: this.from, to: this.to } : null;
    }

    get hasFilters(): boolean {
        return !!this.searchTerm || !!this.effectiveRange;
    }

    get chips(): FilterChip[] {
        const chips: FilterChip[] = [];
        if (this.searchTerm) chips.push({ kind: 'search', label: `Employee ID “${this.searchTerm}”` });
        const range = this.effectiveRange;
        if (range) chips.push({ kind: 'range', label: `Added ${this.shortDate(range.from)} – ${this.shortDate(range.to)}` });
        return chips;
    }

    get sortLabel(): string {
        return this.sortOptions.find(o => o.value === this.sort)?.label ?? '';
    }

    get selectedSpecialty(): string | null {
        return this.specialtyOf(this.selected);
    }

    get editingSpecialty(): string | null {
        return this.specialtyOf(this.editing);
    }
    // #endregion

    // #region Methods
    load(): void {
        if (this.rangeInvalid) return;
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

    onRangeChange(): void {
        if (this.rangeInvalid) return;
        this.page = 1;
        this.load();
    }

    onSortChange(): void {
        this.page = 1;
        this.load();
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.page) return;
        this.page = page;
        this.load();
    }

    removeChip(chip: FilterChip): void {
        if (chip.kind === 'search') {
            this.clearSearch();
            return;
        }
        this.from = null;
        this.to = null;
        this.onRangeChange();
    }

    clearFilters(): void {
        this.query = '';
        this.from = null;
        this.to = null;
        this.searchPending = false;
        this.lastSearched = '';
        this.page = 1;
        this.load();
    }

    // Drawers
    openDetail(d: Doctor): void {
        this.editing = null;
        this.selected = d;
    }

    openEdit(d: Doctor, fromDetail = false): void {
        if (!this.canUpdate || this.busyIds.has(d.id)) return;
        this.returnToDetail = fromDetail;
        this.selected = null;
        this.editing = d;
    }

    closeEdit(): void {
        const d = this.editing;
        this.editing = null;
        if (d && this.returnToDetail) this.selected = this.items.find(i => i.id === d.id) ?? d;
        this.returnToDetail = false;
    }

    onProfileSaved(d: Doctor): void {
        this.toastSrv.success(displayName(d), 'Profile updated');
        this.replaceRow(d);
        this.editing = null;
        this.returnToDetail = false;
        // Show the saved profile so it can be checked.
        this.selected = d;
    }

    /** The photo is saved on its own while the form stays open; refresh the row and the record being edited. */
    onPhotoChanged(d: Doctor): void {
        this.replaceRow(d);
        // Same id, so the open form keeps what has been typed.
        if (this.editing?.id === d.id) this.editing = d;
        if (this.brokenPhotos.has(d.id)) {
            const next = new Set(this.brokenPhotos);
            next.delete(d.id);
            this.brokenPhotos = next;
        }
    }

    openRegister(): void {
        if (!this.canRegister) return;
        this.selected = null;
        this.editing = null;
        this.registerOpen = true;
    }

    /** The registration form toasts on its own; show the new doctor and refresh the list around it. */
    onRegistered(d: Doctor): void {
        this.registerOpen = false;
        this.selected = d;
        this.load();
    }

    confirmDelete(d: Doctor): void {
        if (!this.canDelete || this.busyIds.has(d.id)) return;
        this.dialogSrv.confirm(
            `Delete ${displayName(d)}? Their doctor record and public profile are removed for good and they disappear from the website and booking. This can't be undone.`,
            () => this.delete(d),
            'Delete doctor',
            'danger',
            'Delete doctor',
            'Keep doctor',
        );
    }

    specialtyOf(d: Doctor | null): string | null {
        return d?.primarySpecialtyId ? this.specialtyNames.get(d.primarySpecialtyId) ?? null : null;
    }

    onPhotoError(d: Doctor): void {
        const next = new Set(this.brokenPhotos);
        next.add(d.id);
        this.brokenPhotos = next;
    }

    trackById(_: number, d: Doctor): string {
        return d.id;
    }
    // #endregion

    // #region Helpers
    private delete(d: Doctor): void {
        this.setBusy(d.id, true);
        this.srv.delete(d.id)
            .pipe(finalize(() => this.setBusy(d.id, false)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success(displayName(d), 'Doctor deleted');
                    if (this.selected?.id === d.id) this.selected = null;
                    // Step back a page when the last row on it was removed.
                    if (this.items.length === 1 && this.page > 1) this.page--;
                    this.load();
                },
                // The global HTTP error toast reports the failure; the row stays.
                error: () => undefined,
            });
    }

    private replaceRow(d: Doctor): void {
        if (this.data) this.data = { ...this.data, items: this.data.items.map(i => i.id === d.id ? d : i) };
        if (this.selected?.id === d.id) this.selected = d;
    }

    /** Names for the specialty ids on each row. Needs specialty read access; without it names show as unavailable. */
    private loadSpecialties(): void {
        this.specialtySrv.search({ pageNumber: 1, pageSize: 200, search: '', sort: '+name', filter: { start: '', end: '' } })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (res?.success) this.specialtyNames = new Map((res.data?.items ?? []).map((s): [string, string] => [s.id, s.name]));
                },
                error: () => undefined,
            });
    }

    private setBusy(id: string, on: boolean): void {
        const next = new Set(this.busyIds);
        if (on) next.add(id);
        else next.delete(id);
        this.busyIds = next;
    }

    private failLoad(kind: LoadError): void {
        this.refreshErrorState = this.data && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
        this.loadError = kind;
    }

    private shortDate(iso: string): string {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    private applyPermissions(perms: string[]): void {
        const can = (code: string) => perms.includes(code);
        // Actions follow the permissions the doctor API enforces.
        this.canRegister = can(Permissions.Hr.DoctorRegister);
        this.canUpdate = can(Permissions.Hr.DoctorUpdate);
        this.canDelete = can(Permissions.Hr.DoctorDelete);
    }
    // #endregion
}
