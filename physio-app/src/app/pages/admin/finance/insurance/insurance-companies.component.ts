import { Component, EventEmitter, OnDestroy, OnInit, Output, computed, inject, signal } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent } from '@physioboo/ui';
import { Subject, catchError, of, switchMap, takeUntil } from "rxjs";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { InsuranceClaimsService } from "../../../../services/admin/insurance-claims.service";
import { InsuranceCompanyService } from "../../../../services/admin/insurance-company.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { InsuranceProviderNode } from "../../../../shared/types/insurance-claims.types";
import { InsuranceCompanyPayload, InsuranceCompanyPermissions, InsuranceLoadState } from "../../../../shared/types/insurance-company.types";
import { InsuranceCompany } from "../../../../shared/types/support.types";
import { InsuranceCompanyFilterBarComponent } from "./insurance-company-filter-bar.component";
import { InsuranceCompanyFormDrawerComponent } from "./insurance-company-form-drawer.component";
import { InsuranceCompanyListComponent } from "./insurance-company-list.component";
import { InsuranceCompanyPanelComponent } from "./insurance-company-panel.component";

const PAGE_SIZE = 10;
const WIDE_QUERY = '(min-width: 1280px)';

/** The Insurers view: find an insurer, review its terms, and (with permission) create, edit, deactivate or delete it. */
@Component({
    selector: 'insurance-companies',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        DrawerComponent,
        InsuranceCompanyFilterBarComponent,
        InsuranceCompanyListComponent,
        InsuranceCompanyPanelComponent,
        InsuranceCompanyFormDrawerComponent,
    ],
    host: { class: 'flex min-h-0 min-w-0 flex-col' },
    template: `
    <div class="flex shrink-0 items-center justify-between gap-3 flex-wrap mb-4">
      <p class="m-0 text-sm text-secondary" aria-live="polite">
        <ng-container *ngIf="data() as d">{{ d.totalCount }} insurer{{ d.totalCount === 1 ? '' : 's' }}{{ hasFilters ? ' match your filters' : '' }}</ng-container>
      </p>
      <button *ngIf="permissions.create" boo-button variant="primary" (click)="openCreate()">
        <physio-icon name="circle-plus" [size]="16"></physio-icon>New insurer
      </button>
    </div>

    <div class="grid flex-1 min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(400px,480px)] gap-5">
      <div class="flex min-h-0 min-w-0 flex-col gap-4">
        <insurance-company-filter-bar
          class="shrink-0"
          [search]="search"
          [sort]="sort"
          [dateFrom]="dateFrom"
          [dateTo]="dateTo"
          (searchChange)="onSearchChange($event)"
          (sortChange)="onSortChange($event)"
          (dateFromChange)="onDateFromChange($event)"
          (dateToChange)="onDateToChange($event)"
          (reset)="onReset()"
        ></insurance-company-filter-bar>

        <section class="flex flex-1 min-h-0 flex-col" aria-label="Insurers" [attr.aria-busy]="listState() === 'loading'">
          <boo-error-state
            *ngIf="listState() === 'error'"
            appearance="panel"
            title="We couldn't load the insurers"
            description="Check your connection and try again. Your filters are kept."
            (retry)="loadList()"
          ></boo-error-state>

          <ng-container *ngIf="listState() !== 'error'">
            <boo-empty-state
              *ngIf="listState() === 'ready' && !data()?.items?.length"
              appearance="panel"
              icon="building-2"
              [title]="hasFilters ? 'No insurers match your filters' : 'No insurers yet'"
              [description]="hasFilters ? 'Try a different name or code, or clear the filters.' : (permissions.create ? 'Add the first insurer to start applying insurance to bills and claims.' : 'Insurers added by an administrator appear here.')"
            >
              <button *ngIf="hasFilters" boo-button variant="secondary" (click)="onReset()">Reset filters</button>
              <button *ngIf="!hasFilters && permissions.create" boo-button variant="primary" (click)="openCreate()">New insurer</button>
            </boo-empty-state>

            <insurance-company-list
              class="flex-1 min-h-0"
              *ngIf="listState() === 'loading' || data()?.items?.length"
              [data]="data()"
              [loading]="listState() === 'loading'"
              [selectedId]="selected()?.id ?? null"
              (pageChange)="onPageChange($event)"
              (select)="selectCompany($event)"
            ></insurance-company-list>
          </ng-container>
        </section>
      </div>

      <aside *ngIf="isWide()" aria-label="Selected insurer" class="min-h-0">
        <ng-container *ngTemplateOutlet="panelTpl; context: { embedded: false }"></ng-container>
      </aside>
    </div>

    <drawer *ngIf="!isWide()" [isOpen]="panelDrawerOpen()" (close)="panelDrawerOpen.set(false)">
      <div *ngIf="panelDrawerOpen()" role="dialog" aria-modal="true" aria-labelledby="insurer-panel-title" class="h-full">
        <ng-container *ngTemplateOutlet="panelTpl; context: { embedded: true }"></ng-container>
      </div>
    </drawer>

    <ng-template #panelTpl let-embedded="embedded">
      <insurance-company-panel
        class="h-full"
        [company]="selected()"
        [permissions]="permissions"
        [claimNode]="selectedClaimNode()"
        [canViewClaims]="canReadClaims"
        [claimsUnavailable]="claimsUnavailable()"
        [embedded]="embedded"
        [busy]="busy()"
        (edit)="openEdit($event)"
        (toggleActive)="onToggleActive($event)"
        (remove)="onDelete($event)"
        (viewClaims)="viewClaims.emit($event)"
        (close)="panelDrawerOpen.set(false)"
      ></insurance-company-panel>
    </ng-template>

    <insurance-company-form-drawer
      [open]="formOpen()"
      [company]="editing()"
      [busy]="busy()"
      (close)="closeForm()"
      (save)="onSave($event)"
    ></insurance-company-form-drawer>
  `,
})
export class InsuranceCompaniesComponent implements OnInit, OnDestroy {
    private readonly companySrv = inject(InsuranceCompanyService);
    private readonly claimsSrv = inject(InsuranceClaimsService);
    private readonly authSrv = inject(AuthService);
    private readonly toastSrv = inject(ToastService);
    private readonly dialogSrv = inject(DialogService);

    /** Hands an insurer to the Claims view. */
    @Output() viewClaims = new EventEmitter<InsuranceCompany>();

    // #region Permissions (the route only guarantees admin:insurance-company:read)
    readonly permissions: InsuranceCompanyPermissions = {
        create: this.authSrv.hasPermission(Permissions.Admin.InsuranceCompanyCreate),
        update: this.authSrv.hasPermission(Permissions.Admin.InsuranceCompanyUpdate),
        delete: this.authSrv.hasPermission(Permissions.Admin.InsuranceCompanyDelete),
    };
    readonly canReadClaims = this.authSrv.hasPermission(Permissions.Finance.InsuranceClaimRead);
    // #endregion

    data = signal<PaginationData<InsuranceCompany> | null>(null);
    listState = signal<InsuranceLoadState>('loading');
    selected = signal<InsuranceCompany | null>(null);
    isWide = signal(false);
    panelDrawerOpen = signal(false);

    formOpen = signal(false);
    editing = signal<InsuranceCompany | null>(null);
    /** One mutation at a time: guards double submits across the form and the panel actions. */
    busy = signal(false);

    claimNodes = signal<InsuranceProviderNode[]>([]);
    claimsState = signal<InsuranceLoadState>('loading');
    /** Claim counts are expected for the selected insurer but are not there (load failed, or the tree lists active insurers only). */
    claimsUnavailable = computed(() => this.canReadClaims && !this.selectedClaimNode() && this.claimsState() !== 'loading');
    selectedClaimNode = computed(() => {
        const id = this.selected()?.id;
        return id ? this.claimNodes().find(n => n.id === id) ?? null : null;
    });

    search = '';
    sort = '-createdAt';
    dateFrom: string | null = null;
    dateTo: string | null = null;
    pageNumber = 1;

    private readonly load$ = new Subject<boolean>();
    private readonly destroy$ = new Subject<void>();
    private wideQuery?: MediaQueryList;
    private readonly onWideChange = (e: MediaQueryListEvent) => this.isWide.set(e.matches);

    get hasFilters(): boolean {
        return !!this.search.trim() || this.hasRange;
    }

    /** The endpoint only filters by date when both ends are present. */
    private get hasRange(): boolean {
        return !!this.dateFrom && !!this.dateTo;
    }

    ngOnInit(): void {
        this.wideQuery = window.matchMedia(WIDE_QUERY);
        this.isWide.set(this.wideQuery.matches);
        this.wideQuery.addEventListener('change', this.onWideChange);

        // switchMap drops the response of a request that a newer search, filter or page change has superseded.
        this.load$.pipe(
            switchMap(silent => {
                if (!silent) this.listState.set('loading');
                return this.companySrv.search({
                    pageNumber: this.pageNumber,
                    pageSize: PAGE_SIZE,
                    search: this.search.trim(),
                    sort: this.sort,
                    filter: { start: this.hasRange ? this.dateFrom! : '', end: this.hasRange ? this.dateTo! : '' },
                }).pipe(catchError(() => of(null)));
            }),
            takeUntil(this.destroy$),
        ).subscribe(res => {
            if (!res?.success) {
                this.listState.set('error');
                return;
            }
            this.data.set(res.data);
            this.listState.set('ready');
            const current = this.selected();
            if (current) {
                // Keep the panel in step with the refreshed row; a row that left the result set stays as last seen.
                const fresh = res.data.items.find(i => i.id === current.id);
                if (fresh) this.selected.set(fresh);
            } else if (this.isWide() && res.data.items.length) {
                this.selected.set(res.data.items[0]);
            }
        });

        this.loadList();
        this.loadClaimNodes();
    }

    ngOnDestroy(): void {
        this.wideQuery?.removeEventListener('change', this.onWideChange);
        this.destroy$.next();
        this.destroy$.complete();
    }

    // #region Loading
    loadList(silent = false): void {
        this.load$.next(silent);
    }

    private loadClaimNodes(): void {
        if (!this.canReadClaims) return;
        this.claimsSrv.getProvidersTree().pipe(catchError(() => of(null)), takeUntil(this.destroy$)).subscribe(res => {
            if (res?.success) {
                this.claimNodes.set(res.data);
                this.claimsState.set('ready');
            } else {
                this.claimsState.set('error');
            }
        });
    }
    // #endregion

    // #region Filters
    onSearchChange(value: string): void {
        if (value.trim() === this.search.trim()) return;
        this.search = value;
        this.pageNumber = 1;
        this.loadList();
    }

    onSortChange(value: string): void {
        if (value === this.sort) return;
        this.sort = value;
        this.pageNumber = 1;
        this.loadList();
    }

    onDateFromChange(value: string | null): void {
        this.applyRange(value, this.dateTo);
    }

    onDateToChange(value: string | null): void {
        this.applyRange(this.dateFrom, value);
    }

    private applyRange(from: string | null, to: string | null): void {
        const before = this.hasRange ? `${this.dateFrom}|${this.dateTo}` : '';
        this.dateFrom = from;
        this.dateTo = to;
        const after = this.hasRange ? `${from}|${to}` : '';
        // A half-set range is not sent, so it must not reload the list.
        if (before === after) return;
        this.pageNumber = 1;
        this.loadList();
    }

    onReset(): void {
        this.search = '';
        this.sort = '-createdAt';
        this.dateFrom = null;
        this.dateTo = null;
        this.pageNumber = 1;
        this.loadList();
    }

    onPageChange(page: number): void {
        this.pageNumber = page;
        this.loadList();
    }
    // #endregion

    // #region Selection
    selectCompany(company: InsuranceCompany): void {
        this.selected.set(company);
        if (!this.isWide()) this.panelDrawerOpen.set(true);
    }
    // #endregion

    // #region Form
    openCreate(): void {
        this.editing.set(null);
        this.formOpen.set(true);
    }

    openEdit(company: InsuranceCompany): void {
        this.editing.set(company);
        this.formOpen.set(true);
    }

    closeForm(): void {
        if (this.busy()) return;
        this.formOpen.set(false);
    }

    onSave(payload: InsuranceCompanyPayload): void {
        if (this.busy()) return;
        const editing = this.editing();
        this.busy.set(true);

        const request$ = editing
            ? this.companySrv.update(editing.id, payload).pipe(switchMap(() => of(editing.id)))
            : this.companySrv.create(payload).pipe(switchMap(res => of(res.success ? res.data : null)));

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: id => {
                if (!id) {
                    this.busy.set(false);
                    this.toastSrv.error("The insurer wasn't saved. Please try again.");
                    return;
                }
                this.afterMutation(id, editing ? 'Insurer updated.' : 'Insurer created.', !editing);
            },
            // The interceptor already toasted the server's message; the drawer stays open with the entered values.
            error: () => this.busy.set(false),
        });
    }
    // #endregion

    // #region Panel actions
    onToggleActive(company: InsuranceCompany): void {
        const activate = !company.isActive;
        const run = () => this.runUpdate(company, { isActive: activate }, activate ? 'Insurer activated.' : 'Insurer deactivated.');
        if (activate) run();
        else this.dialogSrv.confirm(
            `${company.name} will no longer be offered when applying insurance to bills or claims. Existing records are unchanged.`,
            run, 'Deactivate insurer', 'warning', 'Deactivate', 'Keep active',
        );
    }

    onDelete(company: InsuranceCompany): void {
        this.dialogSrv.confirmDelete(() => {
            if (this.busy()) return;
            this.busy.set(true);
            this.companySrv.delete(company.id).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.busy.set(false);
                    this.toastSrv.success('Insurer deleted.');
                    this.selected.set(null);
                    this.panelDrawerOpen.set(false);
                    const items = this.data()?.items.length ?? 0;
                    if (items <= 1 && this.pageNumber > 1) this.pageNumber -= 1;
                    this.loadList(true);
                    this.loadClaimNodes();
                },
                error: () => this.busy.set(false),
            });
        }, company.name);
    }

    private runUpdate(company: InsuranceCompany, change: { isActive: boolean }, message: string): void {
        if (this.busy()) return;
        this.busy.set(true);
        const payload: InsuranceCompanyPayload = {
            name: company.name,
            type: company.type,
            contactPerson: company.contactPerson,
            phone: company.phone,
            email: company.email,
            address: company.address,
            website: company.website,
            cashlessFacility: company.cashlessFacility,
            reimbursementFacility: company.reimbursementFacility,
            networkHospitals: company.networkHospitals,
            maximumCoverageAmount: company.maximumCoverageAmount,
            claimSettlementRatio: company.claimSettlementRatio,
            averageClaimSettlementTime: company.averageClaimSettlementTime,
            requiredDocuments: company.requiredDocuments ?? [],
            termAndConditions: company.termAndConditions,
            isActive: change.isActive,
        };
        this.companySrv.update(company.id, payload).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => this.afterMutation(company.id, message, false),
            error: () => this.busy.set(false),
        });
    }

    /** Re-reads the saved insurer and the list, so what is shown always comes from the server. */
    private afterMutation(id: string, message: string, created: boolean): void {
        this.companySrv.search_by_id(id)
            .pipe(catchError(() => of(null)), takeUntil(this.destroy$))
            .subscribe(company => {
                this.busy.set(false);
                this.formOpen.set(false);
                this.toastSrv.success(message);
                if (company?.success && company.data) this.selected.set(company.data);
                if (created) this.pageNumber = 1;
                this.loadList(true);
                this.loadClaimNodes();
            });
    }
    // #endregion
}
