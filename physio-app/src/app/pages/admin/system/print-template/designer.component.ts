import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, DestroyRef, ElementRef, NgZone, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BooButtonComponent, BooEmptyStateComponent, BooSearchFieldComponent } from '@physioboo/ui';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { PrintTemplateService } from '../../../../services/admin/print-template.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { PrintService } from '../../../../services/common/print.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Orientation } from '../../../../shared/enums/print-orientation';
import { PaperSize } from '../../../../shared/enums/print-paper-size';
import { SharedModule } from '../../../../shared/shared-imports';
import { PlaceholderGroup, PrintTemplateDetail, PrintTemplateVersion } from '../../../../shared/types/print-template.types';
import { convertEnumToSelection } from '../../../../shared/utils/common';
import { ElementEdit, FieldOption, PrintElementPropertiesComponent } from './designer/element-properties.component';
import {
  CompileContext, ELEMENT_PALETTE, FONT_FAMILIES, LayoutSection, PaletteItem, PrintElement, PrintLayout, SECTIONS,
  blockStyle, cloneElement, compileLayout, createElement, decodeLayout, documentHtml, elementInner, emptyLayout,
  importLegacy, isReceipt, paperMm, renderPreview, sampleCollections, setPath, starterLayout, userCss
} from './designer/print-layout';

const MM_TO_PX = 96 / 25.4;
const HISTORY_LIMIT = 100;
const ZOOM_STEPS = [0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 2];

@Component({
  selector: 'admin-print-template-designer',
  standalone: true,
  imports: [
    SharedModule, ReactiveFormsModule, BooSelectComponent, BooButtonComponent, BooSearchFieldComponent,
    BooEmptyStateComponent, PrintElementPropertiesComponent
  ],
  styleUrls: ['./designer/designer.styles.css'],
  host: { class: 'block h-full min-h-0', '(document:keydown)': 'onKeydown($event)' },
  template: `
    <form [formGroup]="form" (ngSubmit)="onSave()" class="flex flex-col h-full min-h-0 overflow-hidden bg-slate-50">

      <!-- #region Toolbar -->
      <header class="flex-none flex items-center gap-3 px-3 h-14 bg-surface border-b border-gray-200">
        <button type="button" (click)="goBack()" title="Back to templates"
          class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex-none">
          <physio-icon name="arrow-left" [size]="16" />
        </button>

        <div class="min-w-0 flex-1 max-w-[420px]">
          <input type="text" formControlName="name" placeholder="Untitled template" aria-label="Template name"
            [class.ptd-missing]="form.controls.name.touched && form.controls.name.invalid"
            class="block w-full text-[15px] font-semibold text-gray-900 bg-transparent outline-none border-0 truncate rounded px-1 -mx-1 hover:bg-gray-50 focus:bg-gray-50" />
          <div class="flex items-center gap-1.5 text-xs text-gray-500">
            <input type="text" formControlName="code" placeholder="template-code" aria-label="Template code"
              [class.ptd-missing]="form.controls.code.touched && form.controls.code.invalid"
              class="bg-transparent outline-none border-0 w-32 truncate font-mono rounded px-1 -mx-1 hover:bg-gray-50 focus:bg-gray-50" />
            <span class="text-gray-300">·</span>
            <boo-select formControlName="module" size="small" [height]="22" [borderWidth]="0" [options]="moduleOptions" />
            <span class="text-gray-300">·</span>
            <boo-select formControlName="documentType" size="small" [height]="22" [borderWidth]="0" [options]="docTypeOptions" />
          </div>
        </div>

        <div class="flex items-center gap-1 mx-auto">
          <button type="button" class="ptd-tool" title="Undo (Ctrl+Z)" [disabled]="!canUndo()" (click)="undo()">
            <physio-icon name="undo-2" [size]="16" />
          </button>
          <button type="button" class="ptd-tool" title="Redo (Ctrl+Shift+Z)" [disabled]="!canRedo()" (click)="redo()">
            <physio-icon name="redo-2" [size]="16" />
          </button>
          <span class="w-px h-5 bg-gray-200 mx-1.5"></span>
          <button type="button" class="ptd-tool" title="Zoom out" [disabled]="zoom() <= zoomSteps[0]" (click)="stepZoom(-1)">
            <physio-icon name="zoom-out" [size]="16" />
          </button>
          <button type="button" title="Fit page to width" (click)="fitWidth()"
            class="h-8 min-w-[52px] px-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 tabular-nums">
            {{ (zoom() * 100) | number:'1.0-0' }}%
          </button>
          <button type="button" class="ptd-tool" title="Zoom in" [disabled]="zoom() >= zoomSteps[zoomSteps.length - 1]" (click)="stepZoom(1)">
            <physio-icon name="zoom-in" [size]="16" />
          </button>
          <span class="w-px h-5 bg-gray-200 mx-1.5"></span>
          <div class="ptd-seg !mt-0" role="tablist" aria-label="Editor mode">
            <button type="button" role="tab" [class.on]="mode() === 'design'" [attr.aria-selected]="mode() === 'design'" (click)="mode.set('design')">
              <physio-icon name="pencil" [size]="13" class="inline-flex mr-1 align-[-2px]" />Design
            </button>
            <button type="button" role="tab" [class.on]="mode() === 'preview'" [attr.aria-selected]="mode() === 'preview'" (click)="mode.set('preview')">
              <physio-icon name="eye" [size]="13" class="inline-flex mr-1 align-[-2px]" />Preview
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-none">
          <span *ngIf="form.dirty && !isSaving()" class="hidden xl:inline text-xs text-amber-600">Unsaved changes</span>
          <button boo-button variant="secondary" size="sm" type="button" (click)="onTestPrint()" [disabled]="isLoading()" classname="!h-8 !text-xs">
            <physio-icon name="printer" [size]="14" /> Print preview
          </button>
          <button boo-button variant="primary" size="sm" type="submit" [loading]="isSaving()"
            [disabled]="!form.dirty || isLoading()" classname="!h-8 !text-xs">
            <physio-icon *ngIf="!isSaving()" name="save" [size]="14" class="text-white" /> Save
          </button>
        </div>
      </header>
      <!-- #endregion -->

      <div class="flex-1 min-h-0 grid grid-cols-[248px_minmax(0,1fr)_300px] 2xl:grid-cols-[272px_minmax(0,1fr)_320px]">

        <!-- #region Palette -->
        <aside class="min-h-0 flex flex-col bg-surface border-r border-gray-200">
          <div class="flex-none p-3 border-b border-gray-100">
            <boo-search-field label="Search elements and fields" placeholder="Search elements and fields" size="small"
              [ngModelOptions]="{ standalone: true }" [ngModel]="paletteFilter()" (ngModelChange)="paletteFilter.set($event)"
              (clear)="paletteFilter.set('')" />
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto px-3 pb-4"
            cdkDropList id="ptd-palette" cdkDropListSortingDisabled
            [cdkDropListConnectedTo]="sectionListIds" [cdkDropListEnterPredicate]="noEnter">

            <p class="text-[11px] text-gray-500 mt-3 mb-2 leading-snug">Drag onto the page, or click to add after the selected element.</p>

            <ng-container *ngIf="filteredElements().length">
              <h3 class="ptd-group-title mt-3 mb-2">Elements</h3>
              <div class="grid grid-cols-2 gap-1.5">
                <button type="button" *ngFor="let item of filteredElements()"
                  cdkDrag [cdkDragData]="item" (click)="addFromPalette(item)"
                  [title]="item.description"
                  class="ptd-tile">
                  <physio-icon [name]="item.icon" [size]="16" class="text-primary" />
                  <span class="text-[11.5px] font-medium text-gray-800 leading-tight text-center">{{ item.label }}</span>
                  <div *cdkDragPlaceholder class="ptd-tile">
                    <physio-icon [name]="item.icon" [size]="16" class="text-primary" />
                    <span class="text-[11.5px] font-medium text-gray-800 leading-tight text-center">{{ item.label }}</span>
                  </div>
                  <div *cdkDragPreview class="ptd-drag-chip">
                    <physio-icon [name]="item.icon" [size]="14" /> {{ item.label }}
                  </div>
                </button>
              </div>
            </ng-container>

            <div *ngFor="let g of filteredFields()" class="mt-4">
              <h3 class="ptd-group-title mb-1.5">{{ g.group }}</h3>
              <div class="flex flex-col gap-0.5">
                <button type="button" *ngFor="let f of g.items"
                  cdkDrag [cdkDragData]="f" (click)="addFromPalette(f)"
                  class="ptd-field">
                  <physio-icon name="hash" [size]="12" class="text-primary/70 flex-none" />
                  <span class="min-w-0 flex-1 text-left">
                    <span class="block text-xs text-gray-800 truncate">{{ f.label }}</span>
                    <span class="block text-[10.5px] text-gray-400 font-mono truncate">{{ f.field!.key }}</span>
                  </span>
                  <div *cdkDragPlaceholder class="ptd-field">
                    <physio-icon name="hash" [size]="12" class="text-primary/70 flex-none" />
                    <span class="text-xs text-gray-800 truncate">{{ f.label }}</span>
                  </div>
                  <div *cdkDragPreview class="ptd-drag-chip">
                    <physio-icon name="hash" [size]="13" /> {{ f.label }}
                  </div>
                </button>
              </div>
            </div>

            <div *ngIf="!filteredElements().length && !filteredFields().length" class="text-xs text-gray-500 text-center py-8">
              Nothing matches “{{ paletteFilter() }}”.
            </div>
            <p *ngIf="placeholdersFallback()" class="ptd-hint mt-4">
              The field list could not be loaded from the server; showing the standard fields.
            </p>
          </div>
        </aside>
        <!-- #endregion -->

        <!-- #region Canvas -->
        <main #viewport class="min-h-0 min-w-0 overflow-auto bg-slate-100 relative" (click)="select(null)">
          <div *ngIf="isLoading()" class="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/70">
            <physio-icon name="loader-circle" [size]="24" class="animate-spin text-primary" />
          </div>

          <div class="min-w-max min-h-full flex justify-center px-10 py-8">
            <!-- Design -->
            <div *ngIf="mode() === 'design'" #page class="ptd-page"
              [style.zoom]="zoom()"
              [style.width.mm]="paper().width"
              [style.min-height.mm]="paper().height ?? 120"
              [style.padding]="pagePadding()"
              [style.font-family]="layout().page.fontFamily"
              [style.font-size.pt]="layout().page.fontSize"
              [style.line-height]="layout().page.lineHeight"
              [style.color]="layout().page.color">

              <!-- Page boundary guides. Header and footer print once, at the start and end. -->
              <div *ngFor="let g of pageGuides()" class="ptd-page-guide" [style.top.mm]="g.top">
                <span>Page {{ g.page }}</span>
              </div>

              <div *ngFor="let sec of sections" class="ptd-section" [class.ptd-section-body]="sec === 'body'"
                [class.ptd-section-empty]="!layout()[sec].length">
                <span class="ptd-section-tag">{{ sectionLabels[sec] }}</span>

                <div cdkDropList [id]="'ptd-' + sec" [cdkDropListData]="sec" [cdkDropListConnectedTo]="sectionListIds"
                  (cdkDropListDropped)="onDrop($event)" class="ptd-drop">

                  <div *ngFor="let el of layout()[sec]; trackBy: trackEl"
                    cdkDrag [cdkDragData]="el" (cdkDragStarted)="select(el.id)"
                    class="ptd-el" [class.ptd-el-selected]="selectedId() === el.id"
                    [ngStyle]="canvasStyle(el)"
                    (click)="select(el.id); $event.stopPropagation()">

                    <div *ngIf="el.kind !== 'html'" [innerHTML]="designHtml(el)"></div>
                    <!-- Raw HTML is shown through Angular's sanitiser; it prints exactly as written. -->
                    <div *ngIf="el.kind === 'html'" class="ptd-html" [innerHTML]="el.html || '<em>Empty HTML block</em>'"></div>

                    <ng-container *ngIf="selectedId() === el.id">
                      <div class="ptd-el-bar" (mousedown)="$event.stopPropagation()" (click)="$event.stopPropagation()">
                        <span class="px-1.5 text-[11px] font-medium">{{ kindLabel(el) }}</span>
                        <button type="button" title="Move up" (click)="moveBy(el.id, -1)"><physio-icon name="arrow-up" [size]="12" /></button>
                        <button type="button" title="Move down" (click)="moveBy(el.id, 1)"><physio-icon name="arrow-down" [size]="12" /></button>
                        <button type="button" title="Duplicate (Ctrl+D)" (click)="duplicate(el.id)"><physio-icon name="copy" [size]="12" /></button>
                        <button type="button" title="Delete (Del)" (click)="remove(el.id)"><physio-icon name="trash" [size]="12" /></button>
                      </div>
                      <span class="ptd-handle ptd-handle-x" title="Drag to resize width"
                        (mousedown)="startResize($event, el, 'width')" (touchstart)="$event.stopPropagation()"></span>
                      <span *ngIf="hasHeight(el)" class="ptd-handle ptd-handle-y" title="Drag to resize height"
                        (mousedown)="startResize($event, el, 'height')" (touchstart)="$event.stopPropagation()"></span>
                    </ng-container>

                    <div *cdkDragPlaceholder class="ptd-drop-marker"></div>
                    <div *cdkDragPreview class="ptd-drag-chip">
                      <physio-icon name="grip-vertical" [size]="13" /> {{ kindLabel(el) }}
                    </div>
                  </div>

                  <div *ngIf="!layout()[sec].length && sec !== 'body'" class="ptd-drop-hint">
                    Drop elements here for the {{ sec }} (printed {{ sec === 'header' ? 'first' : 'last' }})
                  </div>
                  <div *ngIf="!layout().body.length && sec === 'body'" class="ptd-drop-hint ptd-drop-hint-lg" (click)="$event.stopPropagation()">
                    <boo-empty-state icon="layout-template" title="Start building your document"
                      description="Drag elements or data fields from the left panel onto the page, or begin with a basic layout.">
                      <button boo-button variant="soft" size="sm" type="button" (click)="useStarter()">
                        <physio-icon name="layout-template" [size]="14" /> Use basic layout
                      </button>
                    </boo-empty-state>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div *ngIf="mode() === 'preview'" class="ptd-page !p-0" [style.zoom]="zoom()" [style.width.mm]="paper().width">
              <iframe #previewFrame class="block w-full border-0 bg-white" title="Template preview"
                sandbox="allow-same-origin" [srcdoc]="previewDoc()"
                [style.height.px]="previewHeight()" (load)="fitPreview(previewFrame)"></iframe>
            </div>
          </div>
        </main>
        <!-- #endregion -->

        <!-- #region Properties -->
        <aside class="min-h-0 overflow-y-auto bg-surface border-l border-gray-200">
          <ng-container *ngIf="selected() as el; else pagePanel">
            <print-element-properties [el]="el" [fieldOptions]="fieldOptions()" (changed)="applyEdit(el.id, $event.fn, $event.coalesce)" />
            <section class="ptd-group">
              <h4 class="ptd-group-title">Placement</h4>
              <label class="ptd-label">Section</label>
              <div class="ptd-seg w-full">
                <button type="button" *ngFor="let s of sections" class="flex-1" [class.on]="sectionOf(el.id) === s" (click)="moveToSection(el.id, s)">
                  {{ sectionLabels[s] }}
                </button>
              </div>
              <div class="flex gap-2 mt-3">
                <button type="button" class="ptd-add !mt-0" (click)="duplicate(el.id)"><physio-icon name="copy" [size]="13" /> Duplicate</button>
                <button type="button" class="ptd-add !mt-0 !text-red-600 !border-red-300 hover:!bg-red-50" (click)="remove(el.id)">
                  <physio-icon name="trash" [size]="13" /> Delete
                </button>
              </div>
            </section>
          </ng-container>

          <ng-template #pagePanel>
            <div class="px-4 py-3 border-b border-gray-200">
              <div class="text-sm font-semibold text-gray-900">Page settings</div>
              <div class="text-[11px] text-gray-500">Select an element on the page to edit it.</div>
            </div>

            <section class="ptd-group" formGroupName="version">
              <h4 class="ptd-group-title">Paper</h4>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="ptd-label">Size</label>
                  <boo-select class="block mt-1" formControlName="paperSize" size="small" [options]="paperOptions" />
                </div>
                <div>
                  <label class="ptd-label">Orientation</label>
                  <boo-select class="block mt-1" formControlName="orientation" size="small" [options]="orientationOptions" />
                </div>
              </div>
              <label class="ptd-label">Margins (mm)</label>
              <div class="grid grid-cols-4 gap-1.5">
                <div *ngFor="let side of marginSides">
                  <input class="ptd-input" type="number" min="0" max="60" [attr.aria-label]="side.label + ' margin'"
                    [ngModelOptions]="{ standalone: true }"
                    [ngModel]="layout().page.margin[side.key]" (ngModelChange)="setMargin(side.key, $event)" />
                  <div class="text-[10px] text-gray-500 text-center mt-0.5">{{ side.label }}</div>
                </div>
              </div>
            </section>

            <section class="ptd-group">
              <h4 class="ptd-group-title">Default text</h4>
              <label class="ptd-label">Font</label>
              <boo-select class="block mt-1" size="small" [options]="fontOptions" [ngModelOptions]="{ standalone: true }"
                [ngModel]="layout().page.fontFamily" (ngModelChange)="setPage('fontFamily', $event)" />
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="ptd-label">Size (pt)</label>
                  <input class="ptd-input" type="number" min="5" max="30" [ngModelOptions]="{ standalone: true }"
                    [ngModel]="layout().page.fontSize" (ngModelChange)="setPage('fontSize', num($event, 11), 'fs')" />
                </div>
                <div>
                  <label class="ptd-label">Line height</label>
                  <input class="ptd-input" type="number" min="1" max="3" step="0.1" [ngModelOptions]="{ standalone: true }"
                    [ngModel]="layout().page.lineHeight" (ngModelChange)="setPage('lineHeight', num($event, 1.4), 'lh')" />
                </div>
                <div>
                  <label class="ptd-label">Colour</label>
                  <input type="color" class="ptd-color mt-1 !w-full" [ngModelOptions]="{ standalone: true }"
                    [ngModel]="layout().page.color" (ngModelChange)="setPage('color', $event, 'color')" />
                </div>
              </div>
            </section>

            <section class="ptd-group">
              <h4 class="ptd-group-title">Advanced</h4>
              <label class="ptd-label">Extra CSS</label>
              <textarea class="ptd-input ptd-textarea font-mono text-[11px]" rows="6" spellcheck="false"
                placeholder="/* Optional CSS applied when printing */"
                [ngModelOptions]="{ standalone: true }" [ngModel]="extraCss()" (ngModelChange)="setExtraCss($event)"></textarea>
              <p class="ptd-hint">The header prints once at the top of the document and the footer once at the end; they do not repeat on every page.</p>
            </section>

            <section class="ptd-group">
              <h4 class="ptd-group-title">Shortcuts</h4>
              <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px] text-gray-600 m-0">
                <dt class="font-mono text-gray-800">Del</dt><dd class="m-0">Delete selected</dd>
                <dt class="font-mono text-gray-800">Ctrl+D</dt><dd class="m-0">Duplicate</dd>
                <dt class="font-mono text-gray-800">Alt+↑/↓</dt><dd class="m-0">Move up / down</dd>
                <dt class="font-mono text-gray-800">Ctrl+Z</dt><dd class="m-0">Undo</dd>
                <dt class="font-mono text-gray-800">Ctrl+Shift+Z</dt><dd class="m-0">Redo</dd>
                <dt class="font-mono text-gray-800">Ctrl+S</dt><dd class="m-0">Save</dd>
                <dt class="font-mono text-gray-800">Esc</dt><dd class="m-0">Deselect</dd>
              </dl>
            </section>
          </ng-template>
        </aside>
        <!-- #endregion -->
      </div>
    </form>
  `,
  styles: [`
    .ptd-missing::placeholder { color: #f87171; }
    .ptd-tool { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; color: #4b5563; }
    .ptd-tool:hover:not(:disabled) { background: #f3f4f6; color: #111827; }
    .ptd-tool:disabled { opacity: .35; cursor: not-allowed; }

    .ptd-tile { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 64px; padding: 8px 4px;
      background: #fff; border: 1px solid #eceef2; border-radius: 8px; cursor: grab; transition: border-color 120ms, box-shadow 120ms, background 120ms; }
    .ptd-tile:hover { border-color: rgb(var(--twc-primary) / .45); background: rgb(var(--twc-primary) / .03); box-shadow: 0 1px 3px rgb(0 0 0 / .06); }
    .ptd-field { display: flex; align-items: center; gap: 8px; width: 100%; padding: 5px 8px; border-radius: 6px; cursor: grab; background: transparent; }
    .ptd-field:hover { background: rgb(var(--twc-primary) / .06); }
    .ptd-drag-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; font-size: 12px; font-weight: 500; color: #fff;
      background: rgb(var(--twc-primary)); border-radius: 6px; box-shadow: 0 8px 20px rgb(0 0 0 / .18); white-space: nowrap; }

    .ptd-page { position: relative; box-sizing: border-box; background: #fff; box-shadow: 0 1px 3px rgb(15 23 42 / .08), 0 10px 30px rgb(15 23 42 / .08);
      display: flex; flex-direction: column; flex: none; }
    .ptd-page-guide { position: absolute; left: 0; right: 0; border-top: 1px dashed #93c5fd; pointer-events: none; z-index: 1; }
    .ptd-page-guide span { position: absolute; right: 4px; top: 2px; font: 500 9px/1 system-ui, sans-serif; color: #3b82f6; background: #eff6ff; padding: 2px 4px; border-radius: 3px; }

    .ptd-section { position: relative; outline: 1px dashed transparent; outline-offset: 2px; transition: outline-color 120ms; }
    .ptd-section-body { flex: 1; display: flex; flex-direction: column; }
    .ptd-section:hover, .ptd-section-empty { outline-color: #e5e7eb; }
    .ptd-section-tag { position: absolute; left: -2px; top: -2px; transform: translateY(-100%); font: 600 9px/1 system-ui, sans-serif;
      letter-spacing: .06em; text-transform: uppercase; color: #9ca3af; padding: 2px 0; opacity: 0; transition: opacity 120ms; pointer-events: none; }
    .ptd-section:hover .ptd-section-tag, .ptd-section-empty .ptd-section-tag { opacity: 1; }
    .ptd-drop { min-height: 10mm; display: flow-root; }
    .ptd-section-body .ptd-drop { flex: 1; min-height: 40mm; }
    .ptd-drop.cdk-drop-list-receiving, .ptd-drop.cdk-drop-list-dragging { background: rgb(var(--twc-primary) / .03); }

    .ptd-el { position: relative; cursor: pointer; outline: 1px solid transparent; outline-offset: 1px; transition: outline-color 100ms; }
    .ptd-el:hover { outline-color: rgb(var(--twc-primary) / .35); }
    .ptd-el-selected, .ptd-el-selected:hover { outline: 2px solid rgb(var(--twc-primary)); z-index: 2; }
    .ptd-el-bar { position: absolute; right: -2px; top: -2px; transform: translateY(-100%); display: flex; align-items: center; gap: 1px; height: 22px;
      padding: 0 2px; color: #fff; background: rgb(var(--twc-primary)); border-radius: 4px 4px 0 0; font-family: system-ui, sans-serif; font-size: 12px; font-weight: 400;
      font-style: normal; line-height: 1; white-space: nowrap; z-index: 3; zoom: calc(1 / var(--ptd-zoom, 1)); }
    .ptd-el-bar button { width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; border-radius: 3px; color: #fff; }
    .ptd-el-bar button:hover { background: rgb(255 255 255 / .2); }
    .ptd-handle { position: absolute; z-index: 3; background: #fff; border: 2px solid rgb(var(--twc-primary)); border-radius: 3px; }
    .ptd-handle-x { right: -6px; top: 50%; width: 9px; height: 22px; margin-top: -11px; cursor: ew-resize; }
    .ptd-handle-y { bottom: -6px; left: 50%; width: 22px; height: 9px; margin-left: -11px; cursor: ns-resize; }
    .ptd-html { min-height: 6mm; }

    .ptd-drop-marker { height: 6px; margin: 2px 0; border-radius: 3px; background: rgb(var(--twc-primary) / .55); }
    .ptd-drop-hint { display: flex; align-items: center; justify-content: center; min-height: 10mm; padding: 2mm; font: 400 11px/1.3 system-ui, sans-serif;
      color: #9ca3af; text-align: center; border: 1px dashed #e5e7eb; border-radius: 4px; }
    .ptd-drop-hint-lg { min-height: 90mm; border: 0; font-size: 13px; }
    .ptd-drop.cdk-drop-list-dragging .ptd-drop-hint, .ptd-drop.cdk-drop-list-receiving .ptd-drop-hint { display: none; }
  `]
})
export class AdminPrintTemplateDesignerComponent implements OnInit, AfterViewInit {
  @ViewChild('viewport') viewportRef?: ElementRef<HTMLElement>;
  @ViewChild('page') set pageRef(ref: ElementRef<HTMLElement> | undefined) {
    this.pageObserver?.disconnect();
    if (!ref) return;
    this.pageObserver = new ResizeObserver(([entry]) => this.zone.run(() => this.pageContentHeight.set(entry.target.scrollHeight)));
    this.pageObserver.observe(ref.nativeElement);
  }

  private fb = inject(FormBuilder);
  private templateSrv = inject(PrintTemplateService);
  private printSrv = inject(PrintService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastSrv = inject(ToastService);
  private dialogSrv = inject(DialogService);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);
  private zone = inject(NgZone);

  // #region Form (what the API persists)
  form = this.fb.nonNullable.group({
    name:         this.fb.nonNullable.control('', Validators.required),
    code:         this.fb.nonNullable.control('', Validators.required),
    module:       this.fb.nonNullable.control('clinical'),
    documentType: this.fb.nonNullable.control('prescription'),
    version: this.fb.nonNullable.group({
      paperSize:   this.fb.nonNullable.control<PaperSize>(PaperSize.A4),
      orientation: this.fb.nonNullable.control<Orientation>(Orientation.Portrait),
      headerHtml:  this.fb.nonNullable.control(''),
      bodyHtml:    this.fb.nonNullable.control(''),
      footerHtml:  this.fb.nonNullable.control(''),
      customCss:   this.fb.nonNullable.control(''),
    })
  });

  paperOptions = convertEnumToSelection(PaperSize);
  orientationOptions = convertEnumToSelection(Orientation);
  moduleOptions = ['clinical', 'billing', 'reception', 'lab', 'pharmacy', 'system'].map(v => ({ label: v, value: v }));
  docTypeOptions = ['prescription', 'lab-report', 'discharge-summary', 'appointment', 'invoice', 'receipt'].map(v => ({ label: v, value: v }));
  fontOptions = FONT_FAMILIES;
  // #endregion

  // #region Designer state
  sections = SECTIONS;
  sectionListIds = SECTIONS.map(s => `ptd-${s}`);
  sectionLabels: Record<LayoutSection, string> = { header: 'Header', body: 'Body', footer: 'Footer' };
  marginSides: { key: 'top' | 'right' | 'bottom' | 'left'; label: string }[] = [
    { key: 'top', label: 'Top' }, { key: 'right', label: 'Right' }, { key: 'bottom', label: 'Bottom' }, { key: 'left', label: 'Left' },
  ];
  zoomSteps = ZOOM_STEPS;

  layout = signal<PrintLayout>(emptyLayout());
  extraCss = signal('');
  selectedId = signal<string | null>(null);
  mode = signal<'design' | 'preview'>('design');
  zoom = signal(1);
  paletteFilter = signal('');
  palette = signal<PlaceholderGroup[]>([]);
  placeholdersFallback = signal(false);
  templateId = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  canUndo = signal(false);
  canRedo = signal(false);
  previewHeight = signal(600);
  private pageContentHeight = signal(0);

  /** Flags the API requires on every metadata update but the designer does not edit. */
  private flags = { isActive: true, isSystemDefault: false };
  /** The save-version endpoint overwrites the current version and requires its number (> 0). */
  private versionNumber = 1;
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private lastCoalesce: { key: string; at: number } | null = null;
  private pageObserver?: ResizeObserver;

  private paperSize = signal<PaperSize>(PaperSize.A4);
  private orientation = signal<Orientation>(Orientation.Portrait);
  // #endregion

  // #region Derived
  paper = computed(() => paperMm(this.paperSize(), this.orientation()));

  pagePadding = computed(() => {
    const m = this.layout().page.margin;
    return `${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm`;
  });

  /** Where printed pages end, measured from the top of the sheet. Approximate: the browser decides the exact break. */
  pageGuides = computed(() => {
    const p = this.paper();
    if (p.height === null) return [];
    const m = this.layout().page.margin;
    const perPage = p.height - m.top - m.bottom;
    if (perPage <= 10) return [];
    const contentMm = this.pageContentHeight() / MM_TO_PX - m.top - m.bottom;
    const guides: { top: number; page: number }[] = [];
    for (let i = 1; i * perPage < contentMm && i < 50; i++) guides.push({ top: m.top + i * perPage, page: i + 1 });
    return guides;
  });

  selected = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    const l = this.layout();
    return [...l.header, ...l.body, ...l.footer].find(e => e.id === id) ?? null;
  });

  private fieldLabels = computed(() => {
    const map = new Map<string, string>();
    for (const g of this.palette()) for (const f of g.fields) map.set(f.key, f.label);
    return map;
  });

  fieldOptions = computed<FieldOption[]>(() =>
    this.palette().flatMap(g => g.fields.map(f => ({ label: `${f.label} (${g.group})`, value: f.key, fieldLabel: f.label }))));

  filteredElements = computed(() => {
    const term = this.paletteFilter().trim().toLowerCase();
    if (!term) return ELEMENT_PALETTE;
    return ELEMENT_PALETTE.filter(p => p.label.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  });

  filteredFields = computed(() => {
    const term = this.paletteFilter().trim().toLowerCase();
    return this.palette()
      .map(g => ({
        group: g.group,
        items: g.fields
          .filter(f => !term || g.group.toLowerCase().includes(term) || f.key.toLowerCase().includes(term) || f.label.toLowerCase().includes(term))
          .map<PaletteItem>(f => ({ kind: 'field', icon: 'hash', label: f.label, description: f.key, field: { key: f.key, label: f.label } })),
      }))
      .filter(g => g.items.length > 0);
  });

  previewDoc = computed<SafeHtml>(() => {
    if (this.mode() !== 'preview') return '';
    const c = compileLayout(this.layout(), this.extraCss());
    const data = this.buildSampleData();
    const html = documentHtml(renderPreview(c.headerHtml, data), renderPreview(c.bodyHtml, data), renderPreview(c.footerHtml, data));
    // The frame is sandboxed without scripts, so trusting the markup cannot run code; without this Angular strips every style.
    return this.sanitizer.bypassSecurityTrustHtml(`<!doctype html><html><head><meta charset="utf-8"><style>
      html, body { margin: 0; padding: 0; background: #fff; }
      body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #111; }
      ${c.customCss}
      @media screen { body { padding: ${this.pagePadding()}; } }
    </style></head><body>${html}</body></html>`);
  });
  // #endregion

  // #region Lifecycle
  ngOnInit(): void {
    const v = this.form.controls.version.controls;
    v.paperSize.valueChanges.subscribe(p => this.paperSize.set(p));
    v.orientation.valueChanges.subscribe(o => this.orientation.set(o));
    this.destroyRef.onDestroy(() => this.pageObserver?.disconnect());

    const id = this.route.snapshot.paramMap.get('id');
    const sourceId = this.route.snapshot.queryParamMap.get('from');
    if (id && id !== 'new') {
      this.templateId.set(id);
      this.loadTemplate(id);
    } else if (sourceId) {
      this.loadTemplate(sourceId, true);
    } else {
      this.resetLayout(emptyLayout(), '');
      this.form.markAsPristine();
    }
    this.loadPlaceholders();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.fitWidth(), 0);
  }
  // #endregion

  // #region IO
  /** `asCopy` fills the form from an existing template as the start of a new one. */
  loadTemplate(id: string, asCopy = false): void {
    this.isLoading.set(true);
    this.templateSrv.getById(id)
      .pipe(catchError(_ => of(null)))
      .subscribe(res => {
        this.isLoading.set(false);
        if (!res?.success || !res.data) {
          this.toastSrv.error('Template not found');
          this.router.navigate(['/admin/system/print-templates'], { replaceUrl: true });
          return;
        }
        this.hydrate(res.data, asCopy);
      });
  }

  loadPlaceholders(): void {
    this.templateSrv.placeholders()
      .pipe(catchError(_ => of(null)))
      .subscribe(res => {
        if (res?.success && res.data?.length) this.palette.set(res.data);
        else {
          this.palette.set(this.fallbackPalette());
          this.placeholdersFallback.set(true);
        }
        // Canvas chips show field labels, which have only just arrived.
        this.designCache = new WeakMap();
      });
  }

  private hydrate(t: PrintTemplateDetail, asCopy: boolean): void {
    const v = t.currentVersion;
    if (!asCopy) {
      this.flags = { isActive: t.isActive, isSystemDefault: t.isSystemDefault };
      this.versionNumber = v?.versionNumber > 0 ? v.versionNumber : 1;
    }
    this.form.patchValue({
      name: asCopy ? `${t.name} (copy)` : t.name,
      code: asCopy ? '' : t.code,
      module: t.module,
      documentType: t.documentType,
      version: v ? {
        paperSize: v.paperSize,
        orientation: v.orientation,
        headerHtml: v.headerHtml || '',
        bodyHtml: v.bodyHtml || '',
        footerHtml: v.footerHtml || '',
        customCss: v.customCss || '',
      } : undefined
    });

    if (v) {
      const receipt = isReceipt(v.paperSize);
      const layout = decodeLayout(v.bodyHtml) ?? importLegacy(v.headerHtml, v.bodyHtml, v.footerHtml, receipt);
      this.resetLayout(layout, userCss(v.customCss));
    }

    // A copy is unsaved by definition, so Save must be available straight away.
    if (asCopy) this.form.markAsDirty();
    else this.form.markAsPristine();
    setTimeout(() => this.fitWidth(), 0);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastSrv.error('Name and code are required');
      return;
    }
    if (this.isSaving() || this.isLoading()) return;

    this.syncForm(false);
    const value = this.form.getRawValue();
    const version: Partial<PrintTemplateVersion> = { ...value.version, versionNumber: this.versionNumber };

    const id = this.templateId();
    if (id) {
      const { name, code, module, documentType } = this.form.controls;
      const calls: Observable<unknown>[] = [];
      if ([name, code, module, documentType].some(c => c.dirty)) {
        calls.push(this.templateSrv.update(id, {
          name: value.name, code: value.code, module: value.module, documentType: value.documentType, ...this.flags
        }));
      }
      if (this.form.controls.version.dirty) calls.push(this.templateSrv.saveVersion(id, version));
      if (!calls.length) return;

      this.isSaving.set(true);
      forkJoin(calls).subscribe({
        next: () => { this.isSaving.set(false); this.form.markAsPristine(); this.toastSrv.success('Template saved'); },
        error: () => { this.isSaving.set(false); this.toastSrv.error('Failed to save'); }
      });
    } else {
      const payload = {
        name: value.name,
        code: value.code,
        module: value.module,
        documentType: value.documentType,
        version
      };
      this.isSaving.set(true);
      this.templateSrv.create(payload)
        .pipe(catchError(_ => { this.toastSrv.error('Failed to create template'); return of(null); }))
        .subscribe(res => {
          this.isSaving.set(false);
          if (res?.success && res.data) {
            this.templateId.set(res.data);
            this.form.markAsPristine();
            this.toastSrv.success('Template created');
            this.router.navigate(['/admin/system/print-templates', res.data], { replaceUrl: true });
          }
        });
    }
  }

  /** Opens the app's print preview with sample data; its Print button sends the page to the printer. */
  onTestPrint(): void {
    const c = compileLayout(this.layout(), this.extraCss());
    const data = this.buildSampleData();
    const html = documentHtml(renderPreview(c.headerHtml, data), renderPreview(c.bodyHtml, data), renderPreview(c.footerHtml, data));
    const v = this.form.getRawValue().version;
    this.printSrv.printRaw(html, c.customCss, v.paperSize, v.orientation, { title: this.form.controls.name.value || 'Template preview' });
  }

  goBack(): void {
    const leave = () => this.router.navigate(['/admin/system/print-templates']);
    if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(leave);
    else leave();
  }
  // #endregion

  // #region Layout mutations
  /**
   * Every change goes through here: it copies the layout, applies `fn`, records an undo step and writes the
   * compiled HTML into the form. Changes sharing a `coalesce` key within a second form one undo step (typing).
   */
  mutate(fn: (draft: PrintLayout) => void, coalesce?: string): void {
    const before = JSON.stringify(this.layout());
    const draft = JSON.parse(before) as PrintLayout;
    fn(draft);
    const after = JSON.stringify(draft);
    if (after === before) return;

    const now = Date.now();
    const merge = !!coalesce && this.lastCoalesce?.key === coalesce && now - this.lastCoalesce.at < 1000;
    if (!merge) {
      this.undoStack.push(before);
      if (this.undoStack.length > HISTORY_LIMIT) this.undoStack.shift();
    }
    this.lastCoalesce = coalesce ? { key: coalesce, at: now } : null;
    this.redoStack = [];
    this.layout.set(this.shareUnchanged(this.layout(), draft));
    this.syncHistory();
    this.syncForm();
  }

  applyEdit(id: string, fn: ElementEdit, coalesce?: string): void {
    this.mutate(d => {
      const el = this.find(d, id)?.el;
      if (el) fn(el);
    }, coalesce && `${id}:${coalesce}`);
  }

  setPage<K extends 'fontFamily' | 'fontSize' | 'lineHeight' | 'color'>(key: K, value: PrintLayout['page'][K], coalesce?: string): void {
    this.mutate(d => d.page[key] = value, coalesce && `page:${coalesce}`);
  }

  setMargin(side: 'top' | 'right' | 'bottom' | 'left', value: unknown): void {
    const n = Math.max(0, Math.min(60, Number(value) || 0));
    this.mutate(d => d.page.margin[side] = n, `margin:${side}`);
  }

  setExtraCss(css: string): void {
    this.extraCss.set(css);
    this.syncForm();
  }

  addFromPalette(item: PaletteItem): void {
    const el = createElement(item);
    this.mutate(d => {
      const at = this.selectedId() ? this.find(d, this.selectedId()!) : null;
      if (at) d[at.section].splice(at.index + 1, 0, el);
      else d.body.push(el);
    });
    this.select(el.id);
  }

  onDrop(event: CdkDragDrop<LayoutSection>): void {
    const to = event.container.data;
    if (event.previousContainer.id === 'ptd-palette') {
      const el = createElement(event.item.data as PaletteItem);
      this.mutate(d => d[to].splice(event.currentIndex, 0, el));
      this.select(el.id);
      return;
    }
    const from = event.previousContainer.data;
    if (from === to && event.previousIndex === event.currentIndex) return;
    this.mutate(d => {
      if (from === to) moveItemInArray(d[to], event.previousIndex, event.currentIndex);
      else transferArrayItem(d[from], d[to], event.previousIndex, event.currentIndex);
    });
  }

  moveBy(id: string, delta: -1 | 1): void {
    this.mutate(d => {
      const at = this.find(d, id);
      if (!at) return;
      const list = d[at.section];
      const target = at.index + delta;
      if (target >= 0 && target < list.length) {
        moveItemInArray(list, at.index, target);
        return;
      }
      // Past the end of a section, the element continues into the neighbouring one.
      const next = SECTIONS[SECTIONS.indexOf(at.section) + delta];
      if (!next) return;
      const [el] = list.splice(at.index, 1);
      if (delta < 0) d[next].push(el);
      else d[next].unshift(el);
    });
  }

  moveToSection(id: string, section: LayoutSection): void {
    this.mutate(d => {
      const at = this.find(d, id);
      if (!at || at.section === section) return;
      const [el] = d[at.section].splice(at.index, 1);
      d[section].push(el);
    });
  }

  duplicate(id: string): void {
    let copyId: string | null = null;
    this.mutate(d => {
      const at = this.find(d, id);
      if (!at) return;
      const copy = cloneElement(at.el);
      copyId = copy.id;
      d[at.section].splice(at.index + 1, 0, copy);
    });
    if (copyId) this.select(copyId);
  }

  remove(id: string): void {
    let nextId: string | null = null;
    this.mutate(d => {
      const at = this.find(d, id);
      if (!at) return;
      const list = d[at.section];
      list.splice(at.index, 1);
      nextId = list[Math.min(at.index, list.length - 1)]?.id ?? null;
    });
    this.select(nextId);
  }

  useStarter(): void {
    const receipt = isReceipt(this.paperSize());
    this.mutate(d => {
      const s = starterLayout(receipt);
      d.page = s.page;
      d.header = s.header;
      d.body = s.body;
      d.footer = s.footer;
    });
  }

  undo(): void {
    const prev = this.undoStack.pop();
    if (prev === undefined) return;
    this.redoStack.push(JSON.stringify(this.layout()));
    this.restore(prev);
  }

  redo(): void {
    const next = this.redoStack.pop();
    if (next === undefined) return;
    this.undoStack.push(JSON.stringify(this.layout()));
    this.restore(next);
  }

  private restore(json: string): void {
    this.lastCoalesce = null;
    this.layout.set(this.shareUnchanged(this.layout(), JSON.parse(json)));
    if (this.selectedId() && !this.selected()) this.selectedId.set(null);
    this.syncHistory();
    this.syncForm();
  }

  private resetLayout(layout: PrintLayout, css: string): void {
    this.layout.set(layout);
    this.extraCss.set(css);
    this.undoStack = [];
    this.redoStack = [];
    this.lastCoalesce = null;
    this.selectedId.set(null);
    this.syncHistory();
    this.syncForm(false);
  }

  private syncHistory(): void {
    this.canUndo.set(this.undoStack.length > 0);
    this.canRedo.set(this.redoStack.length > 0);
  }

  /** Writes the compiled template into the version controls, which is exactly what Save sends. */
  private syncForm(markDirty = true): void {
    const c = compileLayout(this.layout(), this.extraCss());
    const v = this.form.controls.version.controls;
    const changed = v.headerHtml.value !== c.headerHtml || v.bodyHtml.value !== c.bodyHtml
      || v.footerHtml.value !== c.footerHtml || v.customCss.value !== c.customCss;
    if (!changed) return;
    this.form.controls.version.patchValue(c);
    if (markDirty) this.form.controls.version.markAsDirty();
  }

  /** Keeps the previous object for elements that did not change, so the canvas only re-renders what was edited. */
  private shareUnchanged(prev: PrintLayout, next: PrintLayout): PrintLayout {
    const old = new Map<string, [PrintElement, string]>();
    for (const s of SECTIONS) for (const e of prev[s]) old.set(e.id, [e, JSON.stringify(e)]);
    for (const s of SECTIONS) {
      next[s] = next[s].map(e => {
        const o = old.get(e.id);
        return o && o[1] === JSON.stringify(e) ? o[0] : e;
      });
    }
    return next;
  }

  private find(d: PrintLayout, id: string): { section: LayoutSection; index: number; el: PrintElement } | null {
    for (const section of SECTIONS) {
      const index = d[section].findIndex(e => e.id === id);
      if (index >= 0) return { section, index, el: d[section][index] };
    }
    return null;
  }
  // #endregion

  // #region Canvas helpers
  noEnter = (_: CdkDrag) => false;

  num(v: unknown, fallback: number): number {
    const n = Number(v);
    return isFinite(n) && n > 0 ? n : fallback;
  }

  trackEl(_: number, el: PrintElement): string {
    return el.id;
  }

  select(id: string | null): void {
    this.selectedId.set(id);
  }

  sectionOf(id: string): LayoutSection | null {
    return this.find(this.layout(), id)?.section ?? null;
  }

  kindLabel(el: PrintElement): string {
    return ELEMENT_PALETTE.find(p => p.kind === el.kind)?.label ?? el.kind;
  }

  hasHeight(el: PrintElement): boolean {
    return el.kind === 'image' || el.kind === 'spacer' || el.kind === 'signature';
  }

  canvasStyle(el: PrintElement): Record<string, string> {
    return { ...blockStyle(el), '--ptd-zoom': String(this.zoom()) };
  }

  /** Compiled once per element object; the layout is replaced (not mutated) on change, so the cache stays correct. */
  private designCache = new WeakMap<PrintElement, SafeHtml>();
  designHtml(el: PrintElement): SafeHtml {
    let html = this.designCache.get(el);
    if (!html) {
      const labels = this.fieldLabels();
      const ctx: CompileContext = { mode: 'design', labelFor: k => labels.get(k) ?? k };
      // Generated markup escapes all user text, so it is safe to keep its inline styles.
      html = this.sanitizer.bypassSecurityTrustHtml(elementInner(el, ctx));
      this.designCache.set(el, html);
    }
    return html;
  }

  startResize(event: MouseEvent, el: PrintElement, axis: 'width' | 'height'): void {
    event.preventDefault();
    event.stopPropagation();
    const box = (event.target as HTMLElement).parentElement!;
    const container = box.parentElement!;
    const rect = box.getBoundingClientRect();
    const containerWidth = container.getBoundingClientRect().width;
    const startHeight = el.height ?? 10;
    const startY = event.clientY;
    const pxPerMm = MM_TO_PX * this.zoom();
    const id = el.id;
    const key = `resize-${axis}-${Date.now()}`;

    const move = (e: MouseEvent) => {
      if (axis === 'width') {
        let w: number;
        if (el.style.align === 'center') w = Math.abs(e.clientX - (rect.left + rect.width / 2)) * 2;
        else if (el.style.align === 'right') w = rect.right - e.clientX;
        else w = e.clientX - rect.left;
        const pct = Math.round(Math.max(10, Math.min(100, (w / containerWidth) * 100)) / 5) * 5;
        this.applyEdit(id, x => x.style.width = pct, key);
      } else {
        const h = Math.max(2, Math.round((startHeight + (e.clientY - startY) / pxPerMm) * 2) / 2);
        this.applyEdit(id, x => x.height = h, key);
      }
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.body.style.cursor = '';
      this.lastCoalesce = null;
    };
    document.body.style.cursor = axis === 'width' ? 'ew-resize' : 'ns-resize';
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  stepZoom(dir: -1 | 1): void {
    const z = this.zoom();
    const next = dir > 0 ? ZOOM_STEPS.find(s => s > z + 0.001) : [...ZOOM_STEPS].reverse().find(s => s < z - 0.001);
    if (next) this.zoom.set(next);
  }

  fitWidth(): void {
    const vp = this.viewportRef?.nativeElement;
    if (!vp) return;
    const available = vp.clientWidth - 80;
    const pageWidth = this.paper().width * MM_TO_PX;
    this.zoom.set(Math.max(ZOOM_STEPS[0], Math.min(1.25, Math.floor((available / pageWidth) * 100) / 100)));
  }

  fitPreview(frame: HTMLIFrameElement): void {
    const doc = frame.contentDocument;
    if (!doc?.body) return;
    const min = (this.paper().height ?? 120) * MM_TO_PX;
    this.previewHeight.set(Math.max(min, doc.documentElement.scrollHeight));
  }

  onKeydown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    const typing = !!target.closest('input, textarea, select, [contenteditable="true"]');
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (mod && key === 's') {
      e.preventDefault();
      if (this.form.dirty) this.onSave();
      return;
    }
    if (typing) return;
    if (mod && key === 'z') { e.preventDefault(); e.shiftKey ? this.redo() : this.undo(); return; }
    if (mod && key === 'y') { e.preventDefault(); this.redo(); return; }

    const id = this.selectedId();
    if (!id || this.mode() !== 'design') return;
    if (key === 'delete' || key === 'backspace') { e.preventDefault(); this.remove(id); }
    else if (mod && key === 'd') { e.preventDefault(); this.duplicate(id); }
    else if (e.altKey && key === 'arrowup') { e.preventDefault(); this.moveBy(id, -1); }
    else if (e.altKey && key === 'arrowdown') { e.preventDefault(); this.moveBy(id, 1); }
    else if (key === 'escape') this.select(null);
  }
  // #endregion

  // #region Sample data
  private buildSampleData(): Record<string, any> {
    const data: Record<string, any> = { date: new Date().toLocaleDateString(), documentNumber: 'PREVIEW-001' };
    for (const g of this.palette()) {
      for (const f of g.fields) setPath(data, f.key, f.example ?? `[${f.label}]`);
    }
    sampleCollections(this.layout(), data);
    return data;
  }

  private fallbackPalette(): PlaceholderGroup[] {
    return [
      {
        group: 'Patient', fields: [
          { key: 'patient.id',        label: 'Patient ID',  example: 'P-2026-001' },
          { key: 'patient.name',      label: 'Full name',   example: 'John Doe' },
          { key: 'patient.age',       label: 'Age',         example: '45' },
          { key: 'patient.gender',    label: 'Gender',      example: 'Male' },
          { key: 'patient.bloodType', label: 'Blood type',  example: 'O+' },
          { key: 'patient.phone',     label: 'Phone',       example: '+84 123 456 789' },
          { key: 'patient.address',   label: 'Address',     example: '12 Main St, Hanoi' },
        ]
      },
      {
        group: 'Doctor', fields: [
          { key: 'doctor.fullName',      label: 'Doctor name', example: 'Dr. Alice Tran' },
          { key: 'doctor.specialty',     label: 'Specialty',   example: 'Cardiology' },
          { key: 'doctor.licenseNumber', label: 'License #',   example: 'MD-12345' },
        ]
      },
      {
        group: 'Hospital', fields: [
          { key: 'hospital.name',    label: 'Hospital name',    example: 'PhysioBoo General' },
          { key: 'hospital.address', label: 'Hospital address', example: '1 Clinic Way' },
          { key: 'hospital.phone',   label: 'Hospital phone',   example: '+84 24 1234 5678' },
        ]
      },
      {
        group: 'Document', fields: [
          { key: 'date',           label: 'Today\'s date', example: new Date().toLocaleDateString() },
          { key: 'documentNumber', label: 'Doc #',         example: 'INV-001' },
        ]
      },
    ];
  }
  // #endregion
}
