import { Component, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData, PaginationDataWithInit } from "../../../../shared/types/common";
import { StockTake, StockTakeFilter, StockTakeKpis, StockTakeSummary } from "../../../../shared/types/stock-take.types";
import { StockTakeActivityRailComponent } from "./stock-take-activity-rail.component";
import { StockTakeAssignDialogComponent } from "./stock-take-assign-dialog.component";
import { StockTakeCompleteDialogComponent } from "./stock-take-complete-dialog.component";
import { StockTakeDifferenceDialogComponent } from "./stock-take-difference-dialog.component";
import { StockTakeDrawerComponent } from "./stock-take-drawer.component";
import { StockTakeFilterBarComponent } from "./stock-take-filter-bar.component";
import { StockTakeHeroHeaderComponent } from "./stock-take-hero-header.component";
import { StockTakeHistoryDrawerComponent } from "./stock-take-history-drawer.component";
import { NoteDialogMode, StockTakeNoteDialogComponent } from "./stock-take-note-dialog.component";
import { StockTakeTableCardComponent } from "./stock-take-table-card.component";

@Component({
    selector: 'admin-stock-take',
    standalone: true,
    imports: [
        SharedModule,
        StockTakeHeroHeaderComponent,
        StockTakeFilterBarComponent,
        StockTakeTableCardComponent,
        StockTakeActivityRailComponent,
        StockTakeDrawerComponent,
        StockTakeHistoryDrawerComponent,
        StockTakeAssignDialogComponent,
        StockTakeNoteDialogComponent,
        StockTakeCompleteDialogComponent,
        StockTakeDifferenceDialogComponent,
    ],
    host: { class: 'block min-h-screen bg-gray-50' },
    template: `
    <main class="px-4 sm:px-6 pt-4 pb-8 space-y-4">
      <stock-take-hero-header [kpis]="kpis()" (create)="openCreateDrawer()" (exportExcel)="onExport()" (print)="onHeaderPrint()"></stock-take-hero-header>

      <stock-take-filter-bar [filter]="filter" (filterChange)="onFilterChange($event)" (searchChange)="onSearchChange($event)" (reset)="onFilterReset()"></stock-take-filter-bar>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div class="h-[640px]">
          <stock-take-table-card
            [data]="data()"
            [loading]="loading()"
            (pageChange)="onPageChange($event)"
            (rowClick)="openHistoryDrawer($event)"
            (editClick)="openEditDrawer($event)"
            (startClick)="onStart($event)"
            (continueClick)="onContinue($event)"
            (assignClick)="openAssignDialog($event)"
            (completeClick)="openCompleteDialog($event)"
            (approveClick)="openNoteDialog($event, 'approve')"
            (rejectClick)="openNoteDialog($event, 'reject')"
            (cancelClick)="openNoteDialog($event, 'cancel')"
            (deleteClick)="onDelete($event)"
            (historyClick)="openHistoryDrawer($event)"
            (printClick)="onPrint($event)"
            (differenceClick)="openDifferenceDialog($event)"
          ></stock-take-table-card>
        </div>

        <stock-take-activity-rail [kpis]="kpis()"></stock-take-activity-rail>
      </div>
    </main>

    <stock-take-drawer [isOpen]="drawerOpen()" [stockTake]="selected()" (close)="drawerOpen.set(false)" (saveSuccess)="onDrawerSaved()"></stock-take-drawer>

    <stock-take-history-drawer [isOpen]="historyOpen()" [stockTake]="selected()" (close)="historyOpen.set(false)"></stock-take-history-drawer>

    <stock-take-assign-dialog [isOpen]="assignOpen()" (close)="assignOpen.set(false)" (confirm)="onAssignConfirm($event)"></stock-take-assign-dialog>

    <stock-take-note-dialog [isOpen]="noteOpen()" [mode]="noteMode()" (close)="noteOpen.set(false)" (confirm)="onNoteConfirm($event)"></stock-take-note-dialog>

    <stock-take-complete-dialog [isOpen]="completeOpen()" [summary]="completeSummary()" (close)="completeOpen.set(false)" (confirm)="onCompleteConfirm()"></stock-take-complete-dialog>

    <stock-take-difference-dialog [isOpen]="differenceOpen()" [stockTake]="selected()" (close)="differenceOpen.set(false)"></stock-take-difference-dialog>
  `,
})
export class AdminStockTakeComponent implements OnInit {
    data = signal<PaginationData<StockTake> | null>(null);
    kpis = signal<StockTakeKpis | null>(null);
    loading = signal(false);

    filter: StockTakeFilter = {};
    search = '';
    pageNumber = 1;
    pageSize = 10;

    selected = signal<StockTake | null>(null);
    drawerOpen = signal(false);
    historyOpen = signal(false);
    assignOpen = signal(false);
    noteOpen = signal(false);
    noteMode = signal<NoteDialogMode>('approve');
    completeOpen = signal(false);
    completeSummary = signal<StockTakeSummary | null>(null);
    differenceOpen = signal(false);

    constructor(
        private srv: StockTakeService,
        private toastSrv: ToastService,
        private dialogSrv: DialogService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.loadKpis();
        this.loadList();
    }

    loadKpis(): void {
        this.srv.getKpis().subscribe(res => { if (res.success) this.kpis.set(res.data); });
    }

    loadList(): void {
        this.loading.set(true);
        this.srv.search({ pageNumber: this.pageNumber, pageSize: this.pageSize, search: this.search, filter: this.filter })
            .subscribe({
                next: res => { this.data.set(res.success ? res.data : PaginationDataWithInit<StockTake>()); this.loading.set(false); },
                error: () => this.loading.set(false),
            });
    }

    onFilterChange(filter: StockTakeFilter): void {
        this.filter = filter;
        this.pageNumber = 1;
        this.loadList();
    }

    onSearchChange(search: string): void {
        this.search = search;
        this.pageNumber = 1;
        this.loadList();
    }

    onFilterReset(): void {
        this.filter = {};
        this.search = '';
        this.pageNumber = 1;
        this.loadList();
    }

    onPageChange(page: number): void {
        this.pageNumber = page;
        this.loadList();
    }

    openCreateDrawer(): void {
        this.selected.set(null);
        this.drawerOpen.set(true);
    }

    openEditDrawer(item: StockTake): void {
        this.selected.set(item);
        this.drawerOpen.set(true);
    }

    onDrawerSaved(): void {
        this.drawerOpen.set(false);
        this.loadList();
        this.loadKpis();
    }

    openHistoryDrawer(item: StockTake): void {
        this.selected.set(item);
        this.historyOpen.set(true);
    }

    openAssignDialog(item: StockTake): void {
        this.selected.set(item);
        this.assignOpen.set(true);
    }

    onAssignConfirm(payload: { assignedTo: string; dueDate?: string | null }): void {
        const item = this.selected();
        if (!item) return;
        this.srv.assignCounter(item.id, payload).subscribe(() => {
            this.toastSrv.success(`Counter assigned to ${item.code}`);
            this.assignOpen.set(false);
            this.loadList();
        });
    }

    openNoteDialog(item: StockTake, mode: NoteDialogMode): void {
        this.selected.set(item);
        this.noteMode.set(mode);
        this.noteOpen.set(true);
    }

    onNoteConfirm(note: string): void {
        const item = this.selected();
        const mode = this.noteMode();
        if (!item) return;

        const action$ = mode === 'approve' ? this.srv.approve(item.id, note)
            : mode === 'reject' ? this.srv.reject(item.id, note)
                : this.srv.cancel(item.id, note);

        action$.subscribe(() => {
            const messages: Record<NoteDialogMode, string> = {
                approve: `${item.code} approved`,
                reject: `${item.code} rejected — returned to Counting`,
                cancel: `${item.code} cancelled`,
            };
            this.toastSrv.success(messages[mode]);
            this.noteOpen.set(false);
            this.loadList();
            this.loadKpis();
        });
    }

    openCompleteDialog(item: StockTake): void {
        this.selected.set(item);
        this.completeSummary.set(null);
        this.completeOpen.set(true);
        this.srv.getSummary(item.id).subscribe(res => { if (res.success) this.completeSummary.set(res.data); });
    }

    onCompleteConfirm(): void {
        const item = this.selected();
        if (!item) return;
        this.srv.complete(item.id).subscribe(() => {
            this.toastSrv.success(`${item.code} submitted for approval`);
            this.completeOpen.set(false);
            this.loadList();
            this.loadKpis();
        });
    }

    openDifferenceDialog(item: StockTake): void {
        this.selected.set(item);
        this.differenceOpen.set(true);
    }

    onStart(item: StockTake): void {
        this.srv.start(item.id).subscribe(() => {
            this.toastSrv.success(`${item.code} started — opening Counting Workspace`);
            this.router.navigate(['/admin/pharmacy/stock-take', item.id, 'count']);
        });
    }

    onContinue(item: StockTake): void {
        this.router.navigate(['/admin/pharmacy/stock-take', item.id, 'count']);
    }

    onDelete(item: StockTake): void {
        this.dialogSrv.confirmDelete(() => {
            this.srv.delete(item.id).subscribe(() => {
                this.toastSrv.success(`${item.code} deleted`);
                this.loadList();
            });
        }, item.code);
    }

    onPrint(item: StockTake): void {
        this.srv.print(item.id).subscribe(() => this.toastSrv.success(`${item.code} sent to printer`));
    }

    onHeaderPrint(): void {
        this.toastSrv.info('Select a stock take row to print, or use Export Excel for the full list.');
    }

    onExport(): void {
        this.srv.exportExcel(this.filter).subscribe(() => this.toastSrv.success('Export started — check your downloads'));
    }
}
