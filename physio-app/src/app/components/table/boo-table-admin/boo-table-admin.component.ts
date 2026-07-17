import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ContentChildren, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChild } from '@angular/core';
import { ColumnDefDirective } from '../../../shared/directives/column-def.directive';
import { SharedModule } from '../../../shared/shared-imports';
import { Size } from '../../../shared/types/common';
import { FilterConfig } from '../../../shared/types/filter.types';
import { SortOption } from '../../../shared/types/sort';
import { BulkAction, GroupableColumn, SavedView, TableComment } from '../../../shared/types/table.types';
import { PHYSIO_BOO_ANIMATION } from '../../../shared/utils/animation.utils';
import { BooIconComponent } from "../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../input/boo-input/boo-input.component";
import { PaginationComponent } from "./boo-pagination-admin.component";
export { FilterConfig, FilterOption } from '../../../shared/types/filter.types';

@Component({
  selector: 'boo-table-admin',
  standalone: true,
  imports: [SharedModule, PaginationComponent, BooInputComponent, BooIconComponent],
  animations: [
    trigger('rowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  styles: [`
    :host { display: block; height: 100%; min-height: 0; }
    .shimmer {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    tr.data-row:hover td { background-color: rgb(239 246 255 / 0.6); }
    tr.data-row:hover td:first-child { box-shadow: inset 2px 0 0 0 rgb(var(--twc-primary)); }
    tr.data-row.selected td { background-color: rgb(var(--twc-primary) / 0.08) !important; }
    tr.data-row.selected td:first-child { box-shadow: inset 2px 0 0 0 rgb(var(--twc-primary)); }
    tbody tr.data-row:nth-child(even) td { background-color: rgb(248 250 252 / 0.5); }
    tbody tr.data-row:nth-child(even):hover td { background-color: rgb(239 246 255 / 0.6); }
    tbody tr.padding-row td { border-bottom: 1px solid rgb(241 245 249 / 0.6); pointer-events: none; }
    tbody tr.padding-row:nth-child(even) td { background-color: rgb(248 250 252 / 0.5); }
    tbody tr.padding-row:last-child td { border-bottom: 0; }
    thead th { border-bottom: 1.5px solid #e2e8f0; }
    .bulk-bar-enter { animation: bulkBarIn 180ms cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes bulkBarIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Carbon-style batch action bar ───────────────────────── */
    .batch-bar {
      position: absolute;
      inset: 0;
      height: 48px;
      background: rgb(var(--twc-primary));
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 5;
    }
    .batch-bar .selection {
      padding-left: 16px;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.16px;
      white-space: nowrap;
    }
    .batch-bar .actions {
      display: flex;
      align-items: stretch;
      height: 100%;
    }
    .batch-bar .action-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 100%;
      padding: 0 16px;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.16px;
      color: #fff;
      background: transparent;
      border: 0;
      cursor: pointer;
      transition: background-color 110ms ease;
    }
    .batch-bar .action-btn:hover:not(:disabled) {
      background: color-mix(in srgb, rgb(var(--twc-primary)) 80%, black);
    }
    .batch-bar .action-btn:active:not(:disabled) {
      background: #0a3d8a;
    }
    .batch-bar .action-btn:focus-visible {
      outline: 2px solid #fff;
      outline-offset: -2px;
    }
    .batch-bar .action-btn:disabled {
      color: rgba(255, 255, 255, 0.5);
      cursor: not-allowed;
    }
    .batch-bar .action-btn + .action-btn::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 16px;
      background: rgba(255, 255, 255, 0.35);
    }
    .batch-bar .action-btn.danger:hover:not(:disabled) {
      background: #B91C1C;
    }
    .batch-bar .cancel-btn {
      background: color-mix(in srgb, rgb(var(--twc-primary)) 80%, black);
    }
    .batch-bar .selectall-btn {
      margin-left: 12px;
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    .batch-bar .selectall-btn:hover { background: rgba(255, 255, 255, 0.2); }

    /* ── Custom checkbox ─────────────────────────────────────── */
    .boo-checkbox {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      cursor: pointer;
      flex-shrink: 0;
    }
    .boo-checkbox input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      margin: 0;
      cursor: pointer;
      z-index: 2;
    }
    .boo-checkbox .box {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1.5px solid #cbd5e1;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;
      box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
    }
    .boo-checkbox:hover .box {
      border-color: rgb(var(--twc-primary));
      box-shadow: 0 0 0 4px rgb(var(--twc-primary) / 0.08);
    }
    .boo-checkbox input:focus-visible + .box {
      border-color: rgb(var(--twc-primary));
      box-shadow: 0 0 0 3px rgb(var(--twc-primary) / 0.25);
    }
    .boo-checkbox input:checked + .box,
    .boo-checkbox.is-indeterminate .box {
      background: rgb(var(--twc-primary));
      border-color: rgb(var(--twc-primary));
    }
    .boo-checkbox input:checked:active + .box {
      transform: scale(0.92);
    }
    .boo-checkbox .check,
    .boo-checkbox .dash {
      position: absolute;
      pointer-events: none;
      color: #fff;
      opacity: 0;
      transform: scale(0.6);
      transition: opacity 140ms ease, transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .boo-checkbox input:checked ~ .check {
      opacity: 1;
      transform: scale(1);
    }
    .boo-checkbox.is-indeterminate .dash {
      opacity: 1;
      transform: scale(1);
    }
    .boo-checkbox.is-indeterminate input:checked ~ .check {
      opacity: 0;
    }
    .boo-checkbox input:disabled ~ .box {
      background: #f1f5f9;
      border-color: #e2e8f0;
      cursor: not-allowed;
    }
  `],
  template: `
    <div class="flex flex-col h-full bg-surface overflow-hidden border border-gray-200 shadow-sm">

      <!-- ── Toolbar ─────────────────────────────────────────────────── -->
      <div class="flex-none relative w-full border-b border-gray-100 bg-surface" style="height: 48px;">
        <!-- Default toolbar (Lark-style) -->
        <div class="flex items-center justify-between h-12 px-3 gap-2">
          <!-- Left: breadcrumb + Add record + tool icons -->
          <div class="flex items-center min-w-0">
            <button *ngIf="showCollapse" [class]="toolBtn" title="Collapse sidebar" (click)="collapseToggle.emit()">
              <boo-icon name="chevrons-left" iconClass="w-4 h-4" />
            </button>

            <div *ngIf="title || subtitle" class="inline-flex items-center gap-1.5 text-[13px] text-slate-600 px-1.5">
              <span *ngIf="title">{{ title }}</span>
              <span *ngIf="title && subtitle" class="text-slate-300">/</span>
              <span *ngIf="subtitle"
                class="inline-flex items-center gap-1 text-slate-900 font-medium px-1.5 py-1 rounded cursor-pointer hover:bg-slate-100">
                <boo-icon name="table-2" iconClass="w-3.5 h-3.5" />
                <span>{{ subtitle }}</span>
                <boo-icon name="chevron-down" iconClass="w-3 h-3" />
              </span>
            </div>

            <button *ngIf="showAddRecord"
              class="inline-flex items-center gap-1 h-7 pl-2 pr-2.5 text-[13px] font-medium text-primary rounded transition-colors hover:bg-primary/10"
              (click)="addRecord.emit()"
            >
              <boo-icon name="plus" iconClass="w-4 h-4" />
              <span>Add record</span>
            </button>

            <span *ngIf="title || subtitle || showAddRecord" class="w-px h-[18px] bg-gray-200 mx-1.5"></span>

            <div class="flex items-center gap-0.5">
              <button *ngIf="availableTools.includes('settings')" [class]="toolBtnCls('settings')" title="View settings" (click)="onToolClick('settings')">
                <boo-icon name="settings" iconClass="w-4 h-4" />
              </button>
              <button *ngIf="availableTools.includes('filter')" [class]="toolBtnCls('filter')" title="Filter" (click)="onToolClick('filter')">
                <boo-icon name="list-filter" iconClass="w-4 h-4" />
              </button>
              <button *ngIf="availableTools.includes('view')" [class]="toolBtnCls('view')" title="View" (click)="onToolClick('view')">
                <boo-icon name="rows-4" iconClass="w-4 h-4" />
              </button>
              <button *ngIf="availableTools.includes('sort')" [class]="toolBtnCls('sort')" title="Sort" (click)="onToolClick('sort')">
                <boo-icon name="arrow-down-narrow-wide" iconClass="w-4 h-4" />
              </button>
              <button *ngIf="availableTools.includes('group')" [class]="toolBtnCls('group')" title="Group" (click)="onToolClick('group')">
                <boo-icon name="layers" iconClass="w-4 h-4" />
              </button>
              <button *ngIf="availableTools.includes('comment')" [class]="toolBtnCls('comment')" title="Comment" (click)="onToolClick('comment')">
                <boo-icon name="message-square" iconClass="w-4 h-4" />
                <span *ngIf="comments.length"
                  class="ml-0.5 text-[10px] font-semibold text-gray-700">{{ comments.length }}</span>
              </button>
            </div>
          </div>

          <!-- Right: search -->
          <div class="flex items-center shrink-0">
            <span class="w-px h-[18px] bg-gray-200 mx-1.5"></span>
            <button [class]="toolBtn" title="Reload" (click)="onReload()">
              <boo-icon
                [class.animate-spin]="loading"
                [name]="loading ? 'loader-circle' : 'refresh-cw'"
                iconClass="w-4 h-4"
              />
            </button>

            <div class="inline-flex items-center overflow-hidden transition-[width] duration-200"
              [class.w-7]="!searchExpanded" [class.w-56]="searchExpanded">
              <button *ngIf="!searchExpanded" [class]="toolBtn" title="Search" (click)="searchExpanded = true">
                <boo-icon name="search" iconClass="w-4 h-4" />
              </button>
              <div *ngIf="searchExpanded" class="w-full flex items-center pl-1">
                <boo-input label="Search..." size="small" (search)="onSearch($event)" (blur)="onSearchBlur()">
                  <boo-icon name="search" color="#64748B" endfix />
                </boo-input>
              </div>
            </div>
          </div>
        </div>

        <!-- Batch action bar (overlays toolbar when rows selected) -->
        <div *ngIf="selectedRows.length > 0" class="batch-bar bulk-bar-enter">
          <div class="selection flex items-center">
            <span>{{ selectedRows.length }} item{{ selectedRows.length === 1 ? '' : 's' }} selected</span>
          </div>

          <div class="actions">
            <button
              *ngFor="let action of bulkActions"
              class="action-btn"
              [class.danger]="action.variant === 'danger'"
              [disabled]="action.disabled"
              [title]="action.label"
              (click)="runBulkAction(action)"
            >
              <span>{{ action.label }}</span>
              <boo-icon *ngIf="action.icon" [name]="action.icon" iconClass="w-4 h-4" color="#fff" />
            </button>
            <button class="action-btn cancel-btn" (click)="clearSelection()">
              <span>Cancel</span>
            </button>
          </div>
        </div>

        <!-- ── Tool popover panels (anchored under toolbar) ──────────── -->
        <ng-container *ngIf="activeTool">
          <div class="fixed inset-0 z-30" (click)="closeToolPanel()"></div>

          <div *ngIf="activeTool === 'sort'"
            class="absolute top-12 z-40 w-56 bg-surface border border-gray-200 rounded-md shadow-lg py-1"
            [style.left]="toolAnchorLeft + 'px'">
            <div class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sort by</div>
            <ng-container *ngIf="sortOptions.length; else emptySort">
              <button *ngFor="let opt of sortOptions"
                class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                [class.text-primary]="currentSort === opt.value"
                [class.font-medium]="currentSort === opt.value"
                (click)="applySort(opt)">
                <span>{{ opt.label }}</span>
                <boo-icon *ngIf="currentSort === opt.value" name="check" iconClass="w-4 h-4" />
              </button>
            </ng-container>
            <ng-template #emptySort>
              <div class="px-3 py-3 text-xs text-slate-400">No sort options configured</div>
            </ng-template>
          </div>

          <div *ngIf="activeTool === 'settings'"
            class="absolute top-12 z-40 w-64 bg-surface border border-gray-200 rounded-md shadow-lg py-1"
            [style.left]="toolAnchorLeft + 'px'">
            <div class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Density</div>
            <div class="px-3 py-1 flex gap-1">
              <button *ngFor="let d of ['small','middle','large']"
                class="flex-1 px-2 py-1 text-xs rounded border transition-colors"
                [class.bg-primary]="size === d" [class.text-white]="size === d" [class.border-primary]="size === d"
                [class.border-gray-200]="size !== d" [class.text-slate-600]="size !== d"
                [class.hover:bg-slate-50]="size !== d"
                (click)="setDensity($any(d))">
                {{ d === 'small' ? 'Compact' : d === 'middle' ? 'Default' : 'Spacious' }}
              </button>
            </div>
            <div class="border-t border-gray-100 mt-1 pt-1">
              <button class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
                (click)="toggleStriped()">
                <span>Striped rows</span>
                <span class="relative inline-block w-8 h-4 rounded-full transition-colors"
                  [class.bg-primary]="striped" [class.bg-gray-300]="!striped">
                  <span class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform"
                    [style.transform]="striped ? 'translateX(16px)' : 'translateX(0)'"></span>
                </span>
              </button>
            </div>
            <div class="border-t border-gray-100 mt-1 pt-1">
              <button class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                (click)="onResetView()">
                <boo-icon name="rotate-ccw" iconClass="w-4 h-4" />
                <span>Reset view</span>
              </button>
            </div>
          </div>

          <div *ngIf="activeTool === 'view'"
            class="absolute top-12 z-40 w-64 bg-surface border border-gray-200 rounded-md shadow-lg py-1 max-h-80 overflow-y-auto"
            [style.left]="toolAnchorLeft + 'px'">
            <div class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Saved views</div>
            <ng-container *ngIf="savedViews.length; else emptyViews">
              <div *ngFor="let v of savedViews"
                class="group flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                (click)="pickView(v)">
                <div class="flex items-center gap-2 min-w-0">
                  <boo-icon [name]="v.icon || 'rows-4'" iconClass="w-3.5 h-3.5 text-slate-400" />
                  <span class="truncate" [class.text-primary]="currentViewId === v.id"
                    [class.font-medium]="currentViewId === v.id">{{ v.name }}</span>
                  <span *ngIf="v.isDefault" class="text-[10px] text-slate-400 uppercase">default</span>
                </div>
                <button *ngIf="!v.isDefault"
                  class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5 rounded"
                  (click)="$event.stopPropagation(); deleteView(v)">
                  <boo-icon name="trash-2" iconClass="w-3.5 h-3.5" />
                </button>
              </div>
            </ng-container>
            <ng-template #emptyViews>
              <div class="px-3 py-3 text-xs text-slate-400">No saved views</div>
            </ng-template>
            <div class="border-t border-gray-100 mt-1 pt-1">
              <button class="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5"
                (click)="onSaveAsNewView()">
                <boo-icon name="plus" iconClass="w-4 h-4" />
                <span>Save current view as…</span>
              </button>
            </div>
          </div>

          <div *ngIf="activeTool === 'group'"
            class="absolute top-12 z-40 w-64 bg-surface border border-gray-200 rounded-md shadow-lg py-1 max-h-80 overflow-y-auto"
            [style.left]="toolAnchorLeft + 'px'">
            <div class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Group by</div>
            <button class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
              (click)="pickGroup(null)">
              <span>No grouping</span>
              <boo-icon *ngIf="!currentGroupBy" name="check" iconClass="w-4 h-4 text-primary" />
            </button>
            <ng-container *ngIf="groupableColumns.length; else emptyGroups">
              <button *ngFor="let col of groupableColumns"
                class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
                [class.text-primary]="currentGroupBy === col.key"
                [class.font-medium]="currentGroupBy === col.key"
                (click)="pickGroup(col.key)">
                <span>{{ col.label }}</span>
                <boo-icon *ngIf="currentGroupBy === col.key" name="check" iconClass="w-4 h-4" />
              </button>
            </ng-container>
            <ng-template #emptyGroups>
              <div class="px-3 py-3 text-xs text-slate-400">No groupable columns configured</div>
            </ng-template>
          </div>

          <div *ngIf="activeTool === 'comment'"
            class="absolute top-12 z-40 w-80 bg-surface border border-gray-200 rounded-md shadow-lg flex flex-col max-h-96"
            [style.left]="toolAnchorLeft + 'px'">
            <div class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-gray-100">
              Comments ({{ comments.length }})
            </div>
            <div class="flex-1 overflow-y-auto px-3 py-2 space-y-3">
              <ng-container *ngIf="comments.length; else emptyComments">
                <div *ngFor="let c of comments" class="group flex gap-2 text-sm">
                  <div class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0 overflow-hidden">
                    <img *ngIf="c.avatar" [src]="c.avatar" [alt]="c.author" class="w-full h-full object-cover" />
                    <span *ngIf="!c.avatar">{{ c.author.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-baseline justify-between gap-2">
                      <span class="font-medium text-slate-800 text-xs">{{ c.author }}</span>
                      <span class="text-[10px] text-slate-400">{{ c.createdAt }}</span>
                    </div>
                    <p class="text-[13px] text-slate-700 mt-0.5 break-words whitespace-pre-wrap m-0">{{ c.text }}</p>
                  </div>
                  <button class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5"
                    (click)="commentDelete.emit(c)">
                    <boo-icon name="trash-2" iconClass="w-3 h-3" />
                  </button>
                </div>
              </ng-container>
              <ng-template #emptyComments>
                <div class="text-xs text-slate-400 text-center py-4">No comments yet</div>
              </ng-template>
            </div>
            <div class="border-t border-gray-100 p-2 flex items-end gap-2">
              <textarea
                #commentInput
                rows="1"
                placeholder="Add a comment…"
                class="flex-1 resize-none text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-primary"
                (keydown.enter)="$event.preventDefault(); submitComment(commentInput)"
              ></textarea>
              <button class="px-3 py-1.5 bg-primary text-white text-xs rounded hover:bg-primary/90 disabled:opacity-50"
                (click)="submitComment(commentInput)">
                Send
              </button>
            </div>
          </div>

          <div *ngIf="activeTool === 'filter'"
            class="absolute top-12 z-40 w-64 bg-surface border border-gray-200 rounded-md shadow-lg py-1 max-h-80 overflow-y-auto"
            [style.left]="toolAnchorLeft + 'px'">
            <ng-container *ngIf="filterConfigs.length; else emptyFilter">
              <div *ngFor="let cfg of filterConfigs" class="border-b border-gray-100 last:border-0 py-1">
                <div class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {{ cfg.label }}
                </div>
                <button class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
                  (click)="applyFilter(cfg, null)">
                  <span>All</span>
                  <boo-icon *ngIf="getFilterValue(cfg.key) === null || getFilterValue(cfg.key) === undefined"
                    name="check" iconClass="w-4 h-4 text-primary" />
                </button>
                <ng-container *ngIf="cfg.type === 'boolean'">
                  <button class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
                    (click)="applyFilter(cfg, true)">
                    <span>{{ cfg.trueLabel || 'True' }}</span>
                    <boo-icon *ngIf="getFilterValue(cfg.key) === true" name="check" iconClass="w-4 h-4 text-primary" />
                  </button>
                  <button class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
                    (click)="applyFilter(cfg, false)">
                    <span>{{ cfg.falseLabel || 'False' }}</span>
                    <boo-icon *ngIf="getFilterValue(cfg.key) === false" name="check" iconClass="w-4 h-4 text-primary" />
                  </button>
                </ng-container>
                <ng-container *ngIf="cfg.type === 'select'">
                  <button *ngFor="let opt of cfg.options"
                    class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
                    (click)="applyFilter(cfg, opt.value)">
                    <span>{{ opt.label }}</span>
                    <boo-icon *ngIf="getFilterValue(cfg.key) === opt.value" name="check" iconClass="w-4 h-4 text-primary" />
                  </button>
                </ng-container>
              </div>
            </ng-container>
            <ng-template #emptyFilter>
              <div class="px-3 py-3 text-xs text-slate-400">No filters configured</div>
            </ng-template>
          </div>
        </ng-container>
      </div>

      <!-- ── Table scroll area ─────────────────────────────────────────── -->
      <div #scrollArea class="flex-1 min-h-0 w-full overflow-auto relative">
        <table class="w-full table-auto border-separate" style="border-spacing: 0;">

          <!-- Header -->
          <thead
            *ngIf="showHeader && columnsArray.length > 0"
            class="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10"
          >
            <tr cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="drop($event)">
              <th
                *ngFor="let col of columnsArray; let i = index"
                class="group p-0 h-12 bg-slate-50 border-b border-gray-200 border-r border-slate-100/70 select-none"
                [ngClass]="col.headerClass"
                [style.width]="col.width"
                [style.min-width]="col.width"
              >
                <div *ngIf="col.type === 'checkbox'" class="flex items-center h-12 px-4">
                  <label class="boo-checkbox" [class.is-indeterminate]="someSelected">
                    <input
                      type="checkbox"
                      [checked]="allSelected"
                      [indeterminate]="someSelected"
                      (change)="toggleSelectAll()"
                      [attr.aria-label]="someSelected ? 'Select all on page' : (allSelected ? 'Deselect all' : 'Select all')"
                    />
                    <span class="box"></span>
                    <svg class="check" width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg class="dash" width="10" height="2" viewBox="0 0 10 2" fill="none">
                      <path d="M1 1H9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                    </svg>
                  </label>
                </div>

                <div *ngIf="col.type !== 'checkbox'" class="flex items-center gap-1.5 h-12 px-2.5 text-xs font-medium text-slate-600 normal-case tracking-normal">
                  <boo-icon
                    *ngIf="col.typeIcon"
                    [name]="col.typeIcon"
                    iconClass="w-3.5 h-3.5 text-slate-400"
                  />
                  <span class="flex-1 min-w-0 truncate">{{ col.headerLabel }}</span>
                  <button
                    *ngIf="col.sortable"
                    (click)="handleSort(col.name)"
                    class="p-0.5 rounded text-slate-400 hover:bg-slate-200 transition-opacity opacity-0 group-hover:opacity-100"
                    [class.!opacity-100]="sortConfig.key === col.name"
                    [title]="sortConfig.key === col.name ? (sortConfig.direction === 'asc' ? 'Sort desc' : 'Sort asc') : 'Sort'"
                  >
                    <boo-icon
                      [name]="sortConfig.key === col.name ? (sortConfig.direction === 'asc' ? 'arrow-up' : 'arrow-down') : 'chevron-down'"
                      iconClass="w-3 h-3"
                    />
                  </button>
                </div>
              </th>
              <th
                *ngIf="showAddColumn"
                class="w-10 h-12 p-0 bg-slate-50 border-b border-gray-200 cursor-pointer hover:bg-slate-100 transition-colors"
                (click)="addColumn.emit()"
                title="Add column"
              >
                <div class="flex items-center justify-center h-12 text-slate-400">
                  <boo-icon name="plus" iconClass="w-4 h-4" />
                </div>
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody class="bg-surface relative divide-y divide-gray-100">
            <!-- Skeleton -->
            @if (loading) {
              @for (item of skeletonRows; track $index) {
                <tr>
                  @for (col of columnsArray; track col; let ci = $index) {
                    <td [ngClass]="[tdPaddingClass]">
                      <div class="flex items-center gap-2" [ngClass]="contentLimitClass">
                        <div *ngIf="ci === 0" class="shimmer w-7 h-7 rounded-lg shrink-0"></div>
                        <div class="shimmer h-3 rounded-full flex-1" [style.max-width.%]="getStableWidth($index * columnsArray.length + ci)"></div>
                      </div>
                    </td>
                  }
                </tr>
              }
            }
            @else {
              @if (currentGroupBy) {
                @for (group of groupedData; track group.key) {
                  <tr class="bg-slate-50 cursor-pointer select-none" (click)="toggleGroup(group.key)">
                    <td [attr.colspan]="columnsArray.length + (showAddColumn ? 1 : 0)"
                      class="px-3 py-1.5 text-xs font-semibold text-slate-700 border-b border-gray-200">
                      <div class="flex items-center gap-1.5">
                        <boo-icon [name]="collapsedGroups.has(group.key) ? 'chevron-right' : 'chevron-down'" iconClass="w-3.5 h-3.5 text-slate-500" />
                        <span>{{ group.label }}</span>
                        <span class="text-slate-400 font-normal">({{ group.rows.length }})</span>
                      </div>
                    </td>
                  </tr>
                  @if (!collapsedGroups.has(group.key)) {
                    @for (row of group.rows; track row.id) {
                      <tr
                        @rowAnimation
                        class="data-row transition-colors duration-100 cursor-default"
                        [class.selected]="isSelected(row[rowKey])"
                        [ngClass]="rowHeightClass"
                      >
                        @for (col of columnsArray; track col) {
                          <td class="text-sm text-gray-800 transition-colors duration-100" [class]="tdClass" [ngClass]="[tdPaddingClass]">
                            <div class="flex items-center w-full overflow-hidden" [ngClass]="contentLimitClass">
                              <label *ngIf="col.type === 'checkbox'" class="boo-checkbox mr-3">
                                <input type="checkbox"
                                  [checked]="isSelected(row[rowKey])"
                                  (change)="toggleRowSelection(row[rowKey], $event)"
                                  (click)="$event.stopPropagation()" />
                                <span class="box"></span>
                                <svg class="check" width="10" height="10" viewBox="0 0 16 16" fill="none">
                                  <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                              </label>
                              <div class="line-clamp-2 whitespace-normal break-words w-full" [ngClass]="col.cellClass">
                                <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row }"></ng-container>
                              </div>
                            </div>
                          </td>
                        }
                      </tr>
                    }
                  }
                }
              }
              @else {
              @for (row of data; track row.id; let idx = $index) {
                <tr
                  @rowAnimation
                  class="data-row transition-colors duration-100 cursor-default"
                  [class.selected]="isSelected(row.id)"
                  [ngClass]="rowHeightClass"
                >
                  @for (col of columnsArray; track col) {
                    <td class="text-sm text-gray-800 transition-colors duration-100" [class]="tdClass" [ngClass]="[tdPaddingClass]">
                      <div class="flex items-center w-full overflow-hidden" [ngClass]="contentLimitClass">
                        <label *ngIf="col.type === 'checkbox'" class="boo-checkbox mr-3">
                          <input
                            type="checkbox"
                            [checked]="isSelected(row[rowKey])"
                            (change)="toggleRowSelection(row[rowKey], $event)"
                            (click)="$event.stopPropagation()"
                            [attr.aria-label]="'Select row'"
                          />
                          <span class="box"></span>
                          <svg class="check" width="10" height="10" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </label>
                        <div class="line-clamp-2 whitespace-normal break-words w-full" [ngClass]="col.cellClass">
                          <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row }"></ng-container>
                        </div>
                      </div>
                    </td>
                  }
                </tr>
              }
              @for (filler of paddingRows; track $index) {
                <tr class="padding-row" [ngClass]="rowHeightClass" aria-hidden="true">
                  @for (col of columnsArray; track col) {
                    <td [ngClass]="[tdPaddingClass]"></td>
                  }
                  @if (showAddColumn) { <td></td> }
                </tr>
              }
              }
            }
          </tbody>
        </table>

        <!-- Empty state -->
        <div *ngIf="!loading && data.length === 0"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
          <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <boo-icon name="rows-4"></boo-icon>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-500 mb-0.5">No records found</p>
            <p class="text-xs text-gray-400">Try adjusting your search or filters</p>
          </div>
        </div>
      </div>

      <!-- ── Footer ────────────────────────────────────────────────────── -->
      <div *ngIf="showFooter"
        class="flex-none border-t border-gray-100 bg-gray-50/60 flex items-center justify-between px-4 py-2 z-10">
        <span class="text-xs text-gray-400 select-none">
          <ng-container *ngIf="!loading && totalItems > 0">
            Showing
            <span class="font-semibold text-gray-600">{{ rangeStart }}–{{ rangeEnd }}</span>
            of
            <span class="font-semibold text-gray-600">{{ totalItems | number }}</span>
          </ng-container>
          <ng-container *ngIf="loading">
            <div class="shimmer h-3 w-32 rounded-full inline-block"></div>
          </ng-container>
        </span>
        <boo-pagination-admin
          [totalItems]="totalItems"
          [pageSize]="pageSize"
          [currentPage]="currentPage"
          (pageChange)="onPageChange($event)"
          [loading]="loading"
        />
      </div>
    </div>
  `
})
export class BooTableAdminComponent implements AfterContentInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('scrollArea', { static: false }) scrollArea?: ElementRef<HTMLElement>;
  private resizeObserver?: ResizeObserver;
  visibleRowCount = 0;

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) { }

  ngAfterViewInit(): void {
    this.measureVisibleRows();
    if (this.scrollArea && typeof ResizeObserver !== 'undefined') {
      this.zone.runOutsideAngular(() => {
        this.resizeObserver = new ResizeObserver(() => {
          this.measureVisibleRows();
          this.zone.run(() => this.cdr.markForCheck());
        });
        this.resizeObserver.observe(this.scrollArea!.nativeElement);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['data'] || changes['size']) && this.scrollArea) {
      setTimeout(() => {
        this.measureVisibleRows();
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private measureVisibleRows(): void {
    if (!this.scrollArea) return;
    const el = this.scrollArea.nativeElement;
    const fallback = this.size === 'small' ? 36 : this.size === 'large' ? 80 : 48;
    const firstRow = el.querySelector('tbody tr.data-row') as HTMLElement | null;
    const rowH = (firstRow?.offsetHeight || fallback) || 1;
    const headerEl = el.querySelector('thead') as HTMLElement | null;
    const headerH = headerEl?.offsetHeight ?? (this.showHeader ? 48 : 0);
    const available = (el.clientHeight - headerH) || 0;
    this.visibleRowCount = Math.max(0, Math.floor(available / rowH));
  }

  // #region Inputs, Outputs, Properties
  @Input() data: any[] = [];
  @Input() showHeader: boolean = true;
  @Input() showBorder: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() tdClass: string = "";
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 5;
  @Input() totalItems: number = 0;
  @Input() maxVisiblePages: number = 5;
  @Input() loading: boolean = false;
  @Input() size: Size = 'middle';
  @Input() bulkActions: BulkAction[] = [];
  @Input() rowKey: string = 'id';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showAddRecord: boolean = false;
  @Input() showAddColumn: boolean = false;
  @Input() showCollapse: boolean = false;
  @Input() activeTool: '' | 'settings' | 'filter' | 'view' | 'sort' | 'group' | 'comment' = '';
  @Input() sortOptions: SortOption[] = [];
  @Input() currentSort?: string = '';
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() currentFilter?: Record<string, any> = {};
  @Input() savedViews: SavedView[] = [];
  @Input() currentViewId: string | null = null;
  @Input() groupableColumns: GroupableColumn[] = [];
  @Input() currentGroupBy: string | null = null;
  @Input() comments: TableComment[] = [];
  @Input() currentUserName: string = 'You';
  @Input() availableTools: ('settings' | 'filter' | 'view' | 'sort' | 'group' | 'comment')[]
    = ['settings', 'filter', 'view', 'sort', 'group', 'comment'];
  @Input() fillEmpty: boolean = true;

  @Output() reload = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{ key: string, direction: 'asc' | 'desc' }>();
  @Output() selectionChange = new EventEmitter<(number | string)[]>();
  @Output() bulkAction = new EventEmitter<{ action: BulkAction, ids: (number | string)[], selectAllPages: boolean }>();
  @Output() selectAllAcrossPages = new EventEmitter<void>();
  @Output() addRecord = new EventEmitter<void>();
  @Output() addColumn = new EventEmitter<void>();
  @Output() collapseToggle = new EventEmitter<void>();
  @Output() toolClick = new EventEmitter<string>();
  @Output() sortApply = new EventEmitter<SortOption>();
  @Output() filterApply = new EventEmitter<{ key: string; value: any }>();
  @Output() densityChange = new EventEmitter<Size>();
  @Output() stripedChange = new EventEmitter<boolean>();
  @Output() resetView = new EventEmitter<void>();
  @Output() viewSelect = new EventEmitter<SavedView>();
  @Output() viewSaveAsNew = new EventEmitter<void>();
  @Output() viewDelete = new EventEmitter<SavedView>();
  @Output() groupApply = new EventEmitter<string | null>();
  @Output() commentAdd = new EventEmitter<string>();
  @Output() commentDelete = new EventEmitter<TableComment>();

  @ContentChildren(ColumnDefDirective, { descendants: true }) columnDefs!: QueryList<ColumnDefDirective>;

  columnsArray: any[] = [];
  selectedRows: (number | string)[] = [];
  allDataSelected = false;
  sortConfig = { key: '', direction: 'asc' as 'asc' | 'desc' };
  striped = true;
  searchExpanded = false;
  private lastSelectedIndex: number | null = null;

  readonly toolBtn = 'inline-flex items-center justify-center w-7 h-7 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors';
  readonly toolBtnActive = 'inline-flex items-center justify-center w-7 h-7 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors';

  toolBtnCls(tool: string): string {
    return this.activeTool === tool ? this.toolBtnActive : this.toolBtn;
  }

  booAnim = PHYSIO_BOO_ANIMATION;

  get skeletonRows(): number[] {
    return Array(this.pageSize).fill(0);
  }

  get tdPaddingClass(): string {
    switch (this.size) {
      case 'small': return 'px-3 py-1.5 text-xs';
      case 'large': return 'px-6 py-4 text-base';
      default: return 'px-4 py-2.5 text-sm';
    }
  }

  get rowHeightClass(): string {
    switch (this.size) {
      case 'small': return 'h-9';
      case 'large': return 'h-20';
      default: return 'h-12';
    }
  }

  get contentLimitClass(): string {
    switch (this.size) {
      case 'small': return 'h-5';
      case 'large': return 'h-14';
      default: return 'h-8';
    }
  }

  get allSelected(): boolean {
    return this.data.length > 0 && this.data.every(r => this.selectedRows.includes(r[this.rowKey]));
  }

  get someSelected(): boolean {
    return this.selectedRows.length > 0 && !this.allSelected;
  }

  get rangeStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paddingRows(): number[] {
    if (!this.fillEmpty || this.loading || this.currentGroupBy) return [];
    if (this.visibleRowCount <= 0) return [];
    const gap = Math.max(0, this.visibleRowCount - this.data.length);
    return Array(gap).fill(0);
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngAfterContentInit() {
    if (this.totalItems === 0 && this.data) {
      this.totalItems = this.data.length;
    }
    this.columnDefs.changes.subscribe(() => {
      this.columnsArray = this.columnDefs.toArray();
    });
    if (this.columnDefs) {
      this.columnsArray = this.columnDefs.toArray();
    }
  }
  // #endregion

  // #region Methods
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onSearch(val: string): void {
    this.searchChange.emit(val);
  }

  onReload(): void {
    this.reload.emit();
  }

  toolAnchorLeft = 0;

  onToolClick(tool: 'settings' | 'filter' | 'view' | 'sort' | 'group' | 'comment'): void {
    this.activeTool = this.activeTool === tool ? '' : tool;
    if (this.activeTool && typeof document !== 'undefined') {
      setTimeout(() => {
        const btn = document.querySelector('boo-table-admin button[title="' + this.titleFor(tool) + '"]') as HTMLElement | null;
        if (btn) {
          const tableEl = btn.closest('boo-table-admin') as HTMLElement | null;
          const btnRect = btn.getBoundingClientRect();
          const tableRect = tableEl?.getBoundingClientRect();
          const left = tableRect ? btnRect.left - tableRect.left : btnRect.left;
          this.toolAnchorLeft = Math.max(8, left - 100);
        }
      });
    }
    this.toolClick.emit(this.activeTool);
  }

  private titleFor(tool: string): string {
    const map: Record<string, string> = {
      settings: 'View settings', filter: 'Filter', view: 'View',
      sort: 'Sort', group: 'Group', comment: 'Comment'
    };
    return map[tool] ?? '';
  }

  closeToolPanel(): void {
    this.activeTool = '';
    this.toolClick.emit('');
  }

  applySort(opt: SortOption): void {
    this.sortApply.emit(opt);
    this.closeToolPanel();
  }

  applyFilter(cfg: FilterConfig, value: any): void {
    this.filterApply.emit({ key: cfg.key, value });
    this.closeToolPanel();
  }

  getFilterValue(key: string): any {
    return this.currentFilter?.[key];
  }

  setDensity(d: Size): void {
    this.size = d;
    this.densityChange.emit(d);
  }

  toggleStriped(): void {
    this.striped = !this.striped;
    this.stripedChange.emit(this.striped);
  }

  onResetView(): void {
    this.size = 'middle';
    this.striped = true;
    this.resetView.emit();
    this.closeToolPanel();
  }

  pickView(v: SavedView): void {
    this.viewSelect.emit(v);
    this.closeToolPanel();
  }

  deleteView(v: SavedView): void {
    if (!confirm(`Delete view "${v.name}"?`)) return;
    this.viewDelete.emit(v);
  }

  onSaveAsNewView(): void {
    this.viewSaveAsNew.emit();
    this.closeToolPanel();
  }

  pickGroup(key: string | null): void {
    this.currentGroupBy = key;
    this.groupApply.emit(key);
    this.closeToolPanel();
  }

  collapsedGroups = new Set<string>();
  toggleGroup(key: string): void {
    if (this.collapsedGroups.has(key)) this.collapsedGroups.delete(key);
    else this.collapsedGroups.add(key);
  }

  get groupedData(): { key: string; label: string; rows: any[] }[] {
    if (!this.currentGroupBy) return [];
    const groups = new Map<string, any[]>();
    for (const row of this.data) {
      const raw = row[this.currentGroupBy] ?? '—';
      const key = String(raw);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }
    return Array.from(groups.entries()).map(([key, rows]) => ({
      key, label: key, rows
    }));
  }

  submitComment(textarea: HTMLTextAreaElement): void {
    const text = textarea.value.trim();
    if (!text) return;
    this.commentAdd.emit(text);
    textarea.value = '';
  }

  onSearchBlur(): void {
    setTimeout(() => { this.searchExpanded = false; }, 150);
  }

  getTypeIcon(type?: string): string {
    switch (type) {
      case 'text': return 'a-large-small';
      case 'number': return 'hash';
      case 'date': return 'calendar';
      case 'datetime': return 'calendar-clock';
      case 'select': return 'list';
      case 'multi-select': return 'list-checks';
      case 'user': return 'user';
      case 'attachment': return 'paperclip';
      case 'priority': return 'circle-dot';
      case 'status': return 'circle';
      case 'link': return 'link';
      case 'email': return 'mail';
      case 'phone': return 'phone';
      default: return '';
    }
  }

  handleSort(columnKey: string): void {
    if (this.sortConfig.key === columnKey) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig = { key: columnKey, direction: 'asc' };
    }
    this.sortChange.emit(this.sortConfig);
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columnsArray, event.previousIndex, event.currentIndex);
  }

  // Row Selection Logic
  toggleRowSelection(id: number | string, event?: Event): void {
    const mouseEvt = event as MouseEvent | undefined;
    const currentIdx = this.data.findIndex(r => r[this.rowKey] === id);

    if (mouseEvt?.shiftKey && this.lastSelectedIndex !== null && currentIdx !== -1) {
      const [start, end] = [this.lastSelectedIndex, currentIdx].sort((a, b) => a - b);
      const rangeIds = this.data.slice(start, end + 1).map(r => r[this.rowKey]);
      const shouldSelect = !this.isSelected(id);
      for (const rid of rangeIds) {
        const idx = this.selectedRows.indexOf(rid);
        if (shouldSelect && idx === -1) this.selectedRows.push(rid);
        else if (!shouldSelect && idx > -1) this.selectedRows.splice(idx, 1);
      }
    } else {
      const index = this.selectedRows.indexOf(id);
      if (index > -1) this.selectedRows.splice(index, 1);
      else this.selectedRows.push(id);
    }

    this.lastSelectedIndex = currentIdx;
    this.allDataSelected = false;
    this.emitSelection();
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      const pageIds = this.data.map(r => r[this.rowKey]);
      this.selectedRows = this.selectedRows.filter(id => !pageIds.includes(id));
      this.allDataSelected = false;
    } else {
      const pageIds = this.data.map(r => r[this.rowKey]);
      const merged = new Set([...this.selectedRows, ...pageIds]);
      this.selectedRows = Array.from(merged);
    }
    this.lastSelectedIndex = null;
    this.emitSelection();
  }

  isSelected(id: number | string): boolean {
    return this.selectedRows.includes(id);
  }

  clearSelection(): void {
    this.selectedRows = [];
    this.allDataSelected = false;
    this.lastSelectedIndex = null;
    this.emitSelection();
  }

  selectAllPages(): void {
    this.allDataSelected = true;
    this.selectAllAcrossPages.emit();
  }

  runBulkAction(action: BulkAction): void {
    if (action.disabled) return;
    if (action.requireConfirm && !confirm(`${action.label} ${this.selectedRows.length} item(s)?`)) return;
    this.bulkAction.emit({
      action,
      ids: [...this.selectedRows],
      selectAllPages: this.allDataSelected
    });
  }

  getBulkActionClass(action: BulkAction): string {
    switch (action.variant) {
      case 'danger':
        return 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300';
      case 'primary':
        return 'border-primary bg-primary text-white hover:bg-primary/90';
      default:
        return 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300';
    }
  }

  private emitSelection(): void {
    this.selectionChange.emit([...this.selectedRows]);
  }

  getStableWidth(index: number): number {
    const randomBase = (index * 37) % 40;
    return 50 + randomBase;
  }
  // #endregion
}