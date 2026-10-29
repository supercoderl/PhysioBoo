import { Directive, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ActionItem, PaginationData } from "../../../../../../shared/types/common";
import { FilterConfig } from "../../../../../../shared/types/filter.types";
import { SortOption } from "../../../../../../shared/types/sort";
import { BulkAction } from "../../../../../../shared/types/table.types";
import { BooTableAdminComponent, TableTool } from "../../../../../table/boo-table-admin/boo-table-admin.component";

/** Placeholder for empty optional values in table cells. */
export const EMPTY_CELL = '—';

/**
 * Inputs, outputs and row actions shared by the Common Category table cards. Each card only declares its columns.
 * The card fills the page's table region (`flex-1 min-h-0`) and `boo-table-admin` scrolls its own rows.
 */
@Directive({ host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' } })
export abstract class CategoryTableCardBase<T extends { id: string }> {
    @ViewChild(BooTableAdminComponent) private table?: BooTableAdminComponent;

    // #region Inputs, Outputs, Properties
    @Input() data: PaginationData<T> | null = null;
    @Input() filter!: { pageNumber: number; pageSize: number };
    @Input() loading = false;
    @Input() sortOptions: SortOption[] = [];
    @Input() currentSort = '';
    @Input() filterConfigs: FilterConfig[] = [];
    @Input() currentFilter: Record<string, any> = {};
    @Input() set canUpdate(value: boolean) {
        this._canUpdate = value;
        this.buildActions();
    }
    get canUpdate(): boolean {
        return this._canUpdate;
    }
    @Input() set canDelete(value: boolean) {
        this._canDelete = value;
        this.bulkActions = value
            ? [{ key: 'delete', label: 'Delete', icon: 'trash', variant: 'danger' }]
            : [];
        this.buildActions();
    }
    get canDelete(): boolean {
        return this._canDelete;
    }

    @Output() pageChange = new EventEmitter<number>();
    @Output() searchChange = new EventEmitter<string>();
    @Output() reloadClick = new EventEmitter<void>();
    @Output() sortApply = new EventEmitter<SortOption>();
    @Output() filterApply = new EventEmitter<{ key: string; value: any }>();
    @Output() editClick = new EventEmitter<string>();
    @Output() deleteClick = new EventEmitter<string>();
    /** The page confirms and runs the action, then calls `clearSelection` once the rows are gone. */
    @Output() bulkAction = new EventEmitter<{ action: BulkAction; ids: (number | string)[]; clearSelection: () => void }>();

    readonly empty = EMPTY_CELL;
    tableActions: ActionItem[] = [];
    bulkActions: BulkAction[] = [];

    private _canUpdate = false;
    private _canDelete = false;
    // #endregion

    // #region Methods
    /** Tools the toolbar offers: the column chooser, and filter only when the endpoint supports one. */
    get tools(): TableTool[] {
        return this.filterConfigs.length ? ['columns', 'filter', 'sort'] : ['columns', 'sort'];
    }

    onBulkAction(event: { action: BulkAction; ids: (number | string)[] }): void {
        this.bulkAction.emit({ ...event, clearSelection: () => this.table?.clearSelection() });
    }

    onRowOpen(item: T): void {
        if (this.canUpdate) this.editClick.emit(item.id);
    }

    private buildActions(): void {
        this.tableActions = [
            ...(this._canUpdate ? [{ label: 'Edit', icon: 'pencil', onClick: (item: T) => this.editClick.emit(item.id) }] : []),
            ...(this._canDelete ? [{ label: 'Delete', icon: 'trash', isDanger: true, onClick: (item: T) => this.deleteClick.emit(item.id) }] : [])
        ];
    }
    // #endregion
}
