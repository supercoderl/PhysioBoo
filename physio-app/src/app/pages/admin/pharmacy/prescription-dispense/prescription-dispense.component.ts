import { Component, DestroyRef, ElementRef, HostListener, OnInit, ViewChild, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BooButtonComponent, BooEmptyStateComponent, BooInlineErrorState } from '@physioboo/ui';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap } from "rxjs";
import { AuthService } from "../../../../services/auth/auth.service";
import { DispensingService } from "../../../../services/admin/dispensing.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { PagedResponse } from "../../../../shared/types/common";
import {
    BatchOption,
    DispenseLineAction,
    DispenseMedicationItem,
    DispenseMedicineAlternative,
    DispenseMedicineDetail,
    DispenseQueueItem,
    DispenseQueueStats,
    DispenseQueueStatus,
    DispenseSummary,
    DispenseWorkspace,
    DispenseWorkspaceTab,
} from "../../../../shared/types/dispensing.types";
import { DispenseDetailPanelComponent } from "./dispense-detail-panel.component";
import { DispenseMedicationDrawerComponent } from "./dispense-medication-drawer.component";
import { DispenseFilterKey, DispenseQueuePanelComponent } from "./dispense-queue-panel.component";
import { DispenseReasonDialogComponent } from "./dispense-reason-dialog.component";
import { DispenseResultDialogComponent } from "./dispense-result-dialog.component";

type ReasonRequest =
    | { kind: 'hold' }
    | { kind: 'cancel' }
    | { kind: 'substitute'; item: DispenseMedicationItem; alternative: DispenseMedicineAlternative };

const SEARCH_DEBOUNCE_MS = 350;
const DESKTOP_BREAKPOINT_PX = 1024;

@Component({
    selector: 'admin-prescription-dispense',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonComponent,
        BooEmptyStateComponent,
        DispenseQueuePanelComponent,
        DispenseDetailPanelComponent,
        DispenseMedicationDrawerComponent,
        DispenseReasonDialogComponent,
        DispenseResultDialogComponent,
    ],
    template: `
    <header class="flex shrink-0 flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-4">
      <div>
        <h1 class="m-0 text-xl leading-7 font-semibold tracking-tight text-regular">Prescription Dispense</h1>
        <p class="text-xs text-secondary mt-0.5 mb-0">Review prescriptions, pick stock and dispense medicines.</p>
      </div>
      <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
        <dl *ngIf="canRead && stats() as s" class="flex flex-wrap items-center gap-x-5 gap-y-1 m-0" aria-label="Today's dispensing">
          <div><dt class="text-[11px] uppercase tracking-wide text-secondary">Pending</dt><dd class="text-sm font-semibold text-regular m-0">{{ s.pendingCount }}</dd></div>
          <div><dt class="text-[11px] uppercase tracking-wide text-secondary">In progress</dt><dd class="text-sm font-semibold text-regular m-0">{{ s.inProgressCount }}</dd></div>
          <div><dt class="text-[11px] uppercase tracking-wide text-secondary">Done today</dt><dd class="text-sm font-semibold text-regular m-0">{{ s.completedTodayCount }}</dd></div>
          <div><dt class="text-[11px] uppercase tracking-wide text-secondary">Avg. time</dt><dd class="text-sm font-semibold text-regular m-0">{{ s.averageDispensingMinutes | number:'1.0-1' }} min</dd></div>
        </dl>
        <button *ngIf="canRead" boo-button variant="secondary" size="sm" (click)="refreshAll()" [disabled]="queueLoading()">
          <physio-icon name="refresh" [size]="16" [class]="queueLoading() ? 'animate-spin' : ''"></physio-icon>Refresh
        </button>
      </div>
    </header>

    <main class="flex flex-1 flex-col pb-5 lg:min-h-0">
      <boo-empty-state *ngIf="!canRead" appearance="panel" icon="lock" title="You don't have access to dispensing"
        description="Viewing the dispensing queue needs the pharmacy dispensing permission. Ask an administrator to grant it."></boo-empty-state>

      <div *ngIf="canRead" class="grid flex-1 grid-cols-1 gap-4 lg:min-h-[34rem] lg:grid-cols-[380px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <aside class="h-[540px] min-h-0 lg:h-auto" aria-label="Prescription queue">
          <dispense-queue-panel
            [items]="visibleQueue()"
            [selectedId]="selectedId()"
            [loading]="queueLoading()"
            [searching]="searching()"
            [error]="queueError()"
            [search]="search()"
            [status]="statusFilter()"
            [date]="dateFilter()"
            (select)="selectPrescription($event)"
            (searchChange)="onSearchChange($event)"
            (statusChange)="onStatusChange($event)"
            (dateChange)="dateFilter.set($event)"
            (clearFilter)="clearFilter($event)"
            (clearAll)="clearAllFilters()"
            (retry)="loadQueue()"
          ></dispense-queue-panel>
        </aside>

        <div #workspacePane class="min-h-[480px] min-w-0 lg:min-h-0">
          <dispense-detail-panel
            [workspace]="workspace()"
            [loading]="workspaceLoading()"
            [error]="workspaceError()"
            [errorState]="workspaceErrorState()"
            [tab]="tab()"
            [canProcess]="canProcess"
            [locked]="locked()"
            [busyKey]="busy()"
            [notes]="notes()"
            (tabChange)="tab.set($event)"
            (notesChange)="notes.set($event)"
            (acknowledge)="onAcknowledge($event)"
            (lineAction)="onLineAction($event)"
            (hold)="reasonRequest.set({ kind: 'hold' })"
            (cancel)="reasonRequest.set({ kind: 'cancel' })"
            (complete)="onComplete()"
            (refresh)="reloadSelected()"
            (retry)="reloadSelected()"
          ></dispense-detail-panel>
        </div>
      </div>
    </main>

    <dispense-medication-drawer
      [isOpen]="!!drawerItem()"
      [item]="drawerItem()"
      [detail]="drawerDetail()"
      [loading]="drawerLoading()"
      [error]="drawerError()"
      [canProcess]="canProcess"
      [locked]="locked()"
      (close)="drawerItemId.set(null)"
      (selectBatch)="onSelectBatch($event)"
      (substitute)="onSubstitute($event)"
      (retry)="loadMedicineDetail()"
    ></dispense-medication-drawer>

    <dispense-reason-dialog
      [isOpen]="!!reasonRequest()"
      [title]="reasonCopy.title"
      [description]="reasonCopy.description"
      [confirmLabel]="reasonCopy.confirm"
      [danger]="reasonCopy.danger"
      [loading]="locked()"
      (close)="reasonRequest.set(null)"
      (confirm)="onReasonConfirmed($event)"
    ></dispense-reason-dialog>

    <dispense-result-dialog [summary]="result()" [prescriptionNumber]="resultPrescription()" (close)="result.set(null)"></dispense-result-dialog>
  `,
})
export class AdminPrescriptionDispenseComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild('workspacePane') private workspacePane?: ElementRef<HTMLElement>;

    // Queue
    queue = signal<DispenseQueueItem[]>([]);
    stats = signal<DispenseQueueStats | null>(null);
    queueLoading = signal(false);
    searching = signal(false);
    queueError = signal<string | null>(null);
    search = signal('');
    statusFilter = signal<DispenseQueueStatus | null>(null);
    dateFilter = signal<string | null>(null);

    /** The API has no date filter, so the issue date narrows the loaded queue on the client. */
    visibleQueue = computed(() => {
        const date = this.dateFilter();
        return date ? this.queue().filter(q => q.createdAt.slice(0, 10) === date) : this.queue();
    });

    // Workspace
    selectedId = signal<string | null>(null);
    workspace = signal<DispenseWorkspace | null>(null);
    workspaceLoading = signal(false);
    workspaceError = signal<string | null>(null);
    workspaceErrorState = signal<BooInlineErrorState>('default');
    tab = signal<DispenseWorkspaceTab>('review');
    notes = signal('');

    /** Key of the mutation in flight; while set, every action is disabled so nothing is submitted twice. */
    busy = signal<string | null>(null);
    locked = computed(() => this.busy() !== null);

    // Medicine drawer
    drawerItemId = signal<string | null>(null);
    drawerItem = computed(() => this.workspace()?.items.find(i => i.id === this.drawerItemId()) ?? null);
    drawerDetail = signal<DispenseMedicineDetail | null>(null);
    drawerLoading = signal(false);
    drawerError = signal(false);
    private readonly detailCache = new Map<string, DispenseMedicineDetail>();

    // Dialogs
    reasonRequest = signal<ReasonRequest | null>(null);
    result = signal<DispenseSummary | null>(null);
    resultPrescription = signal('');

    private readonly queueRequests$ = new Subject<{ silent: boolean }>();
    private readonly searchInput$ = new Subject<string>();
    private readonly workspaceRequests$ = new Subject<{ id: string; silent: boolean }>();
    private resetTabOnLoad = false;
    private retriedWorkspace = false;
    private notesFor: string | null = null;

    constructor(
        private srv: DispensingService,
        private authSrv: AuthService,
        private toastSrv: ToastService,
        private dialogSrv: DialogService,
    ) { }

    // The route only checks the prescription permission; the API itself requires these two.
    get canRead(): boolean {
        return this.authSrv.hasPermission(Permissions.Pharmacy.DispensingRead);
    }

    get canProcess(): boolean {
        return this.authSrv.hasPermission(Permissions.Pharmacy.DispensingProcess);
    }

    get reasonCopy(): { title: string; description: string; confirm: string; danger: boolean } {
        const request = this.reasonRequest();
        const rx = this.workspace()?.prescriptionNumber ?? '';
        switch (request?.kind) {
            case 'hold':
                return { title: 'Put prescription on hold', description: `${rx} stays in the queue and any reserved stock is kept. Any later action on a line resumes it.`, confirm: 'Put on hold', danger: false };
            case 'cancel':
                return { title: 'Cancel prescription', description: `${rx} will be cancelled and all reserved stock released. This cannot be undone.`, confirm: 'Cancel prescription', danger: true };
            case 'substitute':
                return { title: 'Substitute medicine', description: `Replace ${request.item.name} with ${request.alternative.name}. The prescriber must have allowed substitution.`, confirm: 'Substitute', danger: false };
            default:
                return { title: '', description: '', confirm: 'Confirm', danger: false };
        }
    }

    ngOnInit(): void {
        if (!this.canRead) return;

        this.queueRequests$.pipe(
            switchMap(({ silent }) => {
                if (!silent) this.queueLoading.set(true);
                this.queueError.set(null);
                return this.srv.getQueue(this.search().trim(), this.statusFilter()).pipe(
                    map(res => ({ res, err: null as unknown })),
                    catchError(err => of({ res: null, err })),
                );
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(({ res, err }) => {
            this.queueLoading.set(false);
            this.searching.set(false);
            if (res?.success) this.queue.set(res.data.items);
            else this.queueError.set(this.errorText(err, 'prescriptions'));
        });

        this.workspaceRequests$.pipe(
            switchMap(({ id, silent }) => {
                if (!silent) {
                    this.workspaceLoading.set(true);
                    this.workspaceError.set(null);
                }
                return this.srv.getWorkspace(id).pipe(
                    map(res => ({ id, silent, res, err: null as unknown })),
                    catchError(err => of({ id, silent, res: null, err })),
                );
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(result => this.onWorkspaceLoaded(result));

        this.searchInput$.pipe(
            debounceTime(SEARCH_DEBOUNCE_MS),
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(() => this.loadQueue());

        this.loadQueue();
        this.loadStats();
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key.toLowerCase() === 'b' && this.tab() === 'dispense') {
            const scanInput = document.querySelector<HTMLInputElement>('dispense-medicine-card input[name="scan"]:not([disabled])');
            if (scanInput) {
                event.preventDefault();
                scanInput.focus();
            }
        }
        // Dialogs close themselves; Escape only closes the drawer when nothing is stacked above it.
        if (event.key === 'Escape' && this.drawerItemId() && !this.reasonRequest() && !this.result() && !this.dialogSrv.dialogState()) {
            this.drawerItemId.set(null);
        }
    }

    // #region Queue
    loadQueue(silent = false): void {
        this.queueRequests$.next({ silent });
    }

    loadStats(): void {
        this.srv.getStats().subscribe({
            next: res => { if (res.success) this.stats.set(res.data); },
            error: () => this.stats.set(null),
        });
    }

    refreshAll(): void {
        this.loadQueue();
        this.loadStats();
        this.detailCache.clear();
        this.reloadSelected(true);
    }

    onSearchChange(value: string): void {
        this.search.set(value);
        this.searching.set(true);
        this.searchInput$.next(value.trim());
    }

    onStatusChange(status: DispenseQueueStatus | null): void {
        this.statusFilter.set(status);
        this.loadQueue();
    }

    clearFilter(key: DispenseFilterKey): void {
        if (key === 'search') this.onSearchChange('');
        else if (key === 'status') this.onStatusChange(null);
        else this.dateFilter.set(null);
    }

    clearAllFilters(): void {
        this.search.set('');
        this.statusFilter.set(null);
        this.dateFilter.set(null);
        this.searchInput$.next('');
        this.loadQueue();
    }
    // #endregion

    // #region Workspace
    selectPrescription(item: DispenseQueueItem): void {
        if (item.queueId === this.selectedId() && this.workspace()) return;
        this.selectedId.set(item.queueId);
        this.workspace.set(null);
        this.drawerItemId.set(null);
        this.resetTabOnLoad = true;
        this.retriedWorkspace = false;
        this.workspaceRequests$.next({ id: item.queueId, silent: false });

        if (window.innerWidth < DESKTOP_BREAKPOINT_PX) {
            setTimeout(() => this.workspacePane?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        }
    }

    reloadSelected(silent = false): void {
        const id = this.selectedId();
        if (!id) return;
        if (!silent) this.retriedWorkspace = !!this.workspaceError();
        this.workspaceRequests$.next({ id, silent });
    }

    private onWorkspaceLoaded({ id, silent, res, err }: { id: string; silent: boolean; res: PagedResponse<DispenseWorkspace> | null; err: unknown }): void {
        this.workspaceLoading.set(false);
        if (id !== this.selectedId()) return;

        if (res?.success && res.data) {
            this.workspace.set(res.data);
            this.workspaceError.set(null);
            this.workspaceErrorState.set('default');
            if (this.notesFor !== res.data.workspaceId) {
                this.notesFor = res.data.workspaceId;
                this.notes.set(res.data.pharmacistNotes ?? '');
            }
            if (this.resetTabOnLoad) {
                this.resetTabOnLoad = false;
                const working = res.data.status === 'Preparing' || res.data.status === 'Dispensing';
                this.tab.set(working && this.canProcess ? 'dispense' : 'review');
            }
            return;
        }

        if (res?.success && !res.data) {
            // The prescription left the dispensable states (or never existed) since the queue was loaded.
            this.workspace.set(null);
            this.selectedId.set(null);
            this.toastSrv.info('This prescription is no longer available for dispensing.');
            this.loadQueue(true);
            return;
        }

        if (silent) {
            this.toastSrv.error('Could not refresh the prescription. Showing the last loaded data.');
            return;
        }
        this.workspace.set(null);
        this.workspaceError.set(this.errorText(err, 'this prescription'));
        this.workspaceErrorState.set(this.retriedWorkspace ? 'failed' : 'default');
    }

    /** Server state is the source of truth: after any change, reload it instead of patching the screen. */
    private refreshAfterChange(): void {
        this.detailCache.clear();
        this.reloadSelected(true);
        this.loadQueue(true);
        this.loadStats();
    }
    // #endregion

    // #region Mutations
    private run<T>(key: string, request: Observable<PagedResponse<T>>, options: { success?: string; onSuccess?: (data: T) => void } = {}): void {
        if (this.busy()) return;
        this.busy.set(key);
        request.pipe(finalize(() => this.busy.set(null))).subscribe({
            next: res => {
                if (!res.success) {
                    this.toastSrv.error(res.detailedErrors?.[0] ?? 'The action could not be completed.');
                    this.reloadSelected(true);
                    return;
                }
                if (options.success) this.toastSrv.success(options.success);
                options.onSuccess?.(res.data);
                this.refreshAfterChange();
            },
            // The HTTP interceptor already toasts the API message (e.g. insufficient stock); resync what is shown.
            error: () => this.reloadSelected(true),
        });
    }

    onAcknowledge(alertId: string): void {
        const ws = this.workspace();
        if (!ws) return;
        this.run(`ack:${alertId}`, this.srv.acknowledgeAlert(ws.workspaceId, alertId), { success: 'Clinical alert acknowledged' });
    }

    onLineAction(action: DispenseLineAction): void {
        const ws = this.workspace();
        if (!ws) return;
        const { item } = action;

        switch (action.type) {
            case 'details':
            case 'substitute':
                this.openMedicine(item);
                break;
            case 'status':
                this.run(`status:${item.id}:${action.status}`, this.srv.updateItem(ws.workspaceId, item.id, { status: action.status }), {
                    success: action.status === 'Picked' ? `${item.name} picked` : undefined,
                });
                break;
            case 'quantity':
                this.run(`quantity:${item.id}`, this.srv.updateItem(ws.workspaceId, item.id, { qtyToDispense: action.qty }));
                break;
            case 'batch':
                this.run(`batch:${item.id}`, this.srv.updateItem(ws.workspaceId, item.id, { batchNo: action.batchNo }), { success: `Batch ${action.batchNo} selected` });
                break;
            case 'reserve':
                this.run(`reserve:${item.id}`, this.srv.reserveItem(ws.workspaceId, item.id), { success: `${item.name} reserved` });
                break;
            case 'scan':
                this.run(`scan:${item.id}`, this.srv.scanItem(ws.workspaceId, item.id, action.code), {
                    onSuccess: data => data.matched
                        ? this.toastSrv.success(`${item.name} verified`)
                        : this.toastSrv.error(`That code does not match ${item.name}.`, 'Scan mismatch'),
                });
                break;
        }
    }

    onSelectBatch(batch: BatchOption): void {
        const ws = this.workspace();
        const item = this.drawerItem();
        if (!ws || !item) return;
        this.run(`batch:${item.id}`, this.srv.updateItem(ws.workspaceId, item.id, { batchNo: batch.batchNo }), { success: `Batch ${batch.batchNo} selected` });
    }

    onSubstitute(alternative: DispenseMedicineAlternative): void {
        const item = this.drawerItem();
        if (item) this.reasonRequest.set({ kind: 'substitute', item, alternative });
    }

    onReasonConfirmed(reason: string): void {
        const ws = this.workspace();
        const request = this.reasonRequest();
        if (!ws || !request) return;
        const close = () => this.reasonRequest.set(null);

        switch (request.kind) {
            case 'hold':
                this.run('hold', this.srv.holdPrescription(ws.workspaceId, reason), { success: `${ws.prescriptionNumber} put on hold`, onSuccess: close });
                break;
            case 'cancel':
                this.run('cancel', this.srv.cancelPrescription(ws.workspaceId, reason), { success: `${ws.prescriptionNumber} cancelled`, onSuccess: close });
                break;
            case 'substitute':
                this.run(`substitute:${request.item.id}`, this.srv.replaceItem(ws.workspaceId, request.item.id, request.alternative.id, reason), {
                    success: `${request.item.name} replaced with ${request.alternative.name}`,
                    onSuccess: () => { close(); this.drawerItemId.set(null); },
                });
                break;
        }
    }

    onComplete(): void {
        const ws = this.workspace();
        if (!ws) return;
        this.dialogSrv.confirm(
            `Complete dispensing for ${ws.prescriptionNumber}? Stock is deducted for every picked line and this cannot be undone.`,
            () => this.run('complete', this.srv.completeDispensing(ws.workspaceId, this.notes().trim() || undefined), {
                onSuccess: summary => {
                    this.resultPrescription.set(ws.prescriptionNumber);
                    this.result.set(summary);
                    this.tab.set('review');
                },
            }),
            'Complete Dispensing',
            'success',
            'Complete',
            'Review again',
        );
    }
    // #endregion

    // #region Medicine drawer
    openMedicine(item: DispenseMedicationItem): void {
        this.drawerItemId.set(item.id);
        this.loadMedicineDetail();
    }

    loadMedicineDetail(): void {
        const item = this.drawerItem();
        if (!item) return;
        const cached = this.detailCache.get(item.medicineId);
        this.drawerError.set(false);
        if (cached) {
            this.drawerDetail.set(cached);
            return;
        }
        this.drawerDetail.set(null);
        this.drawerLoading.set(true);
        this.srv.getMedicineDetail(item.medicineId).subscribe({
            next: res => {
                this.drawerLoading.set(false);
                if (res.success && res.data) {
                    this.detailCache.set(item.medicineId, res.data);
                    if (this.drawerItem()?.medicineId === item.medicineId) this.drawerDetail.set(res.data);
                } else {
                    this.drawerError.set(true);
                }
            },
            error: () => {
                this.drawerLoading.set(false);
                this.drawerError.set(true);
            },
        });
    }
    // #endregion

    private errorText(err: unknown, what: string): string {
        const status = (err as { status?: number } | null)?.status;
        if (status === 403) return `You don't have permission to view ${what}.`;
        if (status === 0) return `Couldn't reach the server while loading ${what}. Check your connection and try again.`;
        return `Failed to load ${what}. Please try again.`;
    }
}
