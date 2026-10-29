import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { BooCheckboxComponent } from '@physioboo/ui';
import { BooSelectComponent } from '../../../../../components/select/boo-select/boo-select.component';
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';
import { Align, BoundField, ELEMENT_PALETTE, ElementStyle, FORMAT_OPTIONS, LineStyle, PrintElement, TableColumn, isValidKey } from './print-layout';

/** Mutates the selected element in the parent's working copy; the parent records history and dirty state. */
export type ElementEdit = (el: PrintElement) => void;

/** A data field offered in pickers; `fieldLabel` is the bare field name used to prefill labels. */
export interface FieldOption {
  label: string;
  value: string;
  fieldLabel: string;
}

/** Largest image accepted for embedding; it is stored twice (layout + HTML) in the template body. */
const MAX_IMAGE_BYTES = 300 * 1024;

@Component({
  selector: 'print-element-properties',
  standalone: true,
  imports: [SharedModule, BooSelectComponent, BooCheckboxComponent],
  styleUrls: ['./designer.styles.css'],
  template: `
    <div class="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
      <div class="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-none">
        <physio-icon [name]="meta.icon" [size]="14" />
      </div>
      <div class="min-w-0">
        <div class="text-sm font-semibold text-gray-900 truncate">{{ meta.label }}</div>
        <div class="text-[11px] text-gray-500 truncate">{{ meta.description }}</div>
      </div>
    </div>

    <!-- #region Content -->
    <section class="ptd-group" *ngIf="el.kind !== 'pageBreak'">
      <h4 class="ptd-group-title">Content</h4>

      <ng-container *ngIf="el.kind === 'heading' || el.kind === 'text'">
        <label class="ptd-label">Text</label>
        <textarea #textRef class="ptd-input ptd-textarea" rows="4" [ngModel]="el.text"
          (ngModelChange)="set('text', $event, 'text')"></textarea>
        <ng-container *ngTemplateOutlet="insertField; context: { $implicit: textRef }"></ng-container>
      </ng-container>

      <ng-container *ngIf="el.kind === 'field' && el.field as f">
        <label class="ptd-label">Data field</label>
        <boo-select size="small" [options]="fieldOptions" [searchable]="true" [ngModel]="f.key"
          (ngModelChange)="bindField($event)" />
        <label class="ptd-label">Label</label>
        <input class="ptd-input" [ngModel]="f.label" (ngModelChange)="setField('label', $event, 'label')" />
        <label class="ptd-label">Format</label>
        <boo-select size="small" [options]="formatOptions" [ngModel]="f.format" (ngModelChange)="setField('format', $event)" />
        <div class="flex items-center justify-between mt-3">
          <boo-checkbox size="small" [ngModel]="el.showLabel !== false" (ngModelChange)="set('showLabel', $event)">Show label</boo-checkbox>
          <div class="ptd-seg" *ngIf="el.showLabel !== false">
            <button type="button" [class.on]="el.fieldLayout !== 'stacked'" (click)="set('fieldLayout', 'inline')">Inline</button>
            <button type="button" [class.on]="el.fieldLayout === 'stacked'" (click)="set('fieldLayout', 'stacked')">Stacked</button>
          </div>
        </div>
        <ng-container *ngIf="el.showLabel !== false && el.fieldLayout !== 'stacked'">
          <label class="ptd-label">Label width (mm)</label>
          <input class="ptd-input" type="number" min="0" max="150" [ngModel]="el.labelWidth"
            (ngModelChange)="set('labelWidth', n($event), 'labelWidth')" />
        </ng-container>
      </ng-container>

      <ng-container *ngIf="el.kind === 'fieldGrid'">
        <label class="ptd-label">Columns</label>
        <div class="ptd-seg w-full">
          <button type="button" *ngFor="let c of [1,2,3,4]" class="flex-1" [class.on]="el.columns === c" (click)="set('columns', c)">{{ c }}</button>
        </div>
        <label class="ptd-label">Fields</label>
        <div cdkDropList (cdkDropListDropped)="reorder($event, 'fields')" class="flex flex-col gap-2">
          <div *ngFor="let f of el.fields; let i = index; trackBy: trackIndex" cdkDrag class="ptd-row">
            <div class="flex items-center gap-1">
              <physio-icon cdkDragHandle name="grip-vertical" [size]="14" class="text-gray-400 cursor-grab flex-none" />
              <input class="ptd-input !mt-0 flex-1" placeholder="Label" [ngModel]="f.label"
                (ngModelChange)="setGridField(i, 'label', $event, 'grid-label-' + i)" />
              <button type="button" class="ptd-icon-btn" title="Remove field" (click)="removeGridField(i)">
                <physio-icon name="x" [size]="14" />
              </button>
            </div>
            <div class="grid grid-cols-[1fr_96px] gap-1 mt-1">
              <boo-select size="small" [options]="fieldOptions" [searchable]="true" [ngModel]="f.key"
                (ngModelChange)="bindGridField(i, $event)" />
              <boo-select size="small" [options]="formatOptions" [ngModel]="f.format" (ngModelChange)="setGridField(i, 'format', $event)" />
            </div>
          </div>
        </div>
        <button type="button" class="ptd-add" (click)="addGridField()">
          <physio-icon name="plus" [size]="13" /> Add field
        </button>
      </ng-container>

      <ng-container *ngIf="el.kind === 'table' || el.kind === 'repeatTable'">
        <ng-container *ngIf="el.kind === 'repeatTable'">
          <label class="ptd-label">List in the print data</label>
          <input class="ptd-input font-mono" placeholder="items" [ngModel]="el.collection"
            (ngModelChange)="set('collection', $event.trim(), 'collection')"
            [class.ptd-invalid]="!validKey(el.collection)" />
          <p class="ptd-hint">The name of the list the printing screen sends, e.g. <code>items</code> or <code>prescription.lines</code>. One table row prints per item.</p>
          <boo-checkbox size="small" class="mt-2" [ngModel]="el.showIndex" (ngModelChange)="set('showIndex', $event)">Number the rows (#)</boo-checkbox>
        </ng-container>

        <label class="ptd-label">Columns</label>
        <div cdkDropList (cdkDropListDropped)="reorder($event, 'tableColumns')" class="flex flex-col gap-2">
          <div *ngFor="let c of el.tableColumns; let i = index; trackBy: trackIndex" cdkDrag class="ptd-row">
            <div class="flex items-center gap-1">
              <physio-icon cdkDragHandle name="grip-vertical" [size]="14" class="text-gray-400 cursor-grab flex-none" />
              <input class="ptd-input !mt-0 flex-1" placeholder="Header" [ngModel]="c.label"
                (ngModelChange)="setColumn(i, 'label', $event, 'col-label-' + i)" />
              <button type="button" class="ptd-icon-btn" title="Remove column" [disabled]="(el.tableColumns?.length ?? 0) <= 1" (click)="removeColumn(i)">
                <physio-icon name="x" [size]="14" />
              </button>
            </div>
            <div *ngIf="el.kind === 'repeatTable'" class="grid grid-cols-[1fr_96px] gap-1 mt-1">
              <input class="ptd-input !mt-0 font-mono" placeholder="item property, e.g. name" [ngModel]="c.key"
                [class.ptd-invalid]="!validKey(c.key)"
                (ngModelChange)="setColumn(i, 'key', $event.trim(), 'col-key-' + i)" />
              <boo-select size="small" [options]="formatOptions" [ngModel]="c.format" (ngModelChange)="setColumn(i, 'format', $event)" />
            </div>
            <div class="flex items-center gap-1 mt-1">
              <ng-container *ngTemplateOutlet="alignSeg; context: { value: c.align, set: setColumnAlign(i) }"></ng-container>
              <input class="ptd-input !mt-0 w-20 ml-auto" type="number" min="1" max="100" placeholder="auto" title="Width (%)"
                [ngModel]="c.width" (ngModelChange)="setColumn(i, 'width', $event === null || $event === '' ? null : n($event), 'col-w-' + i)" />
              <span class="text-[11px] text-gray-500">%</span>
            </div>
          </div>
        </div>
        <button type="button" class="ptd-add" (click)="addColumn()">
          <physio-icon name="plus" [size]="13" /> Add column
        </button>

        <ng-container *ngIf="el.kind === 'table'">
          <label class="ptd-label">Cells <span class="font-normal text-gray-400" ngNonBindable>(text or {{ field.key }})</span></label>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <tr *ngFor="let r of el.rows; let ri = index; trackBy: trackIndex">
                <td *ngFor="let _ of el.tableColumns; let ci = index; trackBy: trackIndex" class="p-0.5">
                  <input class="ptd-input !mt-0 min-w-[64px]" [ngModel]="r[ci]"
                    (ngModelChange)="setCell(ri, ci, $event)" />
                </td>
                <td class="w-6">
                  <button type="button" class="ptd-icon-btn" title="Remove row" (click)="removeRow(ri)">
                    <physio-icon name="x" [size]="13" />
                  </button>
                </td>
              </tr>
            </table>
          </div>
          <button type="button" class="ptd-add" (click)="addRow()">
            <physio-icon name="plus" [size]="13" /> Add row
          </button>
        </ng-container>

        <div class="grid grid-cols-2 gap-2 mt-3 items-end">
          <boo-checkbox size="small" [ngModel]="el.bordered" (ngModelChange)="set('bordered', $event)">Grid lines</boo-checkbox>
          <div>
            <label class="ptd-label !mt-0">Header colour</label>
            <ng-container *ngTemplateOutlet="colorInput; context: { value: el.headerBackground, set: setHeaderBg }"></ng-container>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="el.kind === 'image'">
        <div class="ptd-seg w-full">
          <button type="button" class="flex-1" [class.on]="el.imageSource !== 'field'" (click)="set('imageSource', 'url')">Link or file</button>
          <button type="button" class="flex-1" [class.on]="el.imageSource === 'field'" (click)="set('imageSource', 'field')">Data field</button>
        </div>
        <ng-container *ngIf="el.imageSource !== 'field'">
          <label class="ptd-label">Image address</label>
          <input class="ptd-input" [ngModel]="isDataUri(el.src) ? '' : el.src"
            [attr.placeholder]="isDataUri(el.src) ? 'Uploaded file in use' : 'https://…'"
            (ngModelChange)="set('src', $event, 'src')" />
          <div class="flex items-center gap-2 mt-2">
            <button type="button" class="ptd-add !mt-0" (click)="fileRef.click()">
              <physio-icon name="upload" [size]="13" /> Upload file
            </button>
            <button *ngIf="el.src" type="button" class="ptd-add !mt-0" (click)="set('src', '')">Remove</button>
          </div>
          <input #fileRef type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" class="hidden" (change)="onFile($event)" />
          <p class="ptd-hint">Uploaded files are saved inside the template (max {{ maxImageKb }} KB).</p>
        </ng-container>
        <ng-container *ngIf="el.imageSource === 'field'">
          <label class="ptd-label">Field holding the image address</label>
          <boo-select size="small" [options]="fieldOptions" [searchable]="true" [ngModel]="el.imageKey" (ngModelChange)="set('imageKey', $event)" />
        </ng-container>
        <label class="ptd-label">Height (mm)</label>
        <input class="ptd-input" type="number" min="2" max="250" [ngModel]="el.height" (ngModelChange)="set('height', n($event), 'height')" />
      </ng-container>

      <ng-container *ngIf="el.kind === 'divider'">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="ptd-label">Thickness (px)</label>
            <input class="ptd-input" type="number" min="1" max="10" [ngModel]="el.style.borderWidth"
              (ngModelChange)="style({ borderWidth: n($event) }, 'borderWidth')" />
          </div>
          <div>
            <label class="ptd-label">Colour</label>
            <ng-container *ngTemplateOutlet="colorInput; context: { value: el.style.borderColor, set: setBorderColor }"></ng-container>
          </div>
        </div>
        <label class="ptd-label">Line style</label>
        <ng-container *ngTemplateOutlet="lineSeg"></ng-container>
      </ng-container>

      <ng-container *ngIf="el.kind === 'spacer'">
        <label class="ptd-label">Height (mm)</label>
        <input class="ptd-input" type="number" min="1" max="250" [ngModel]="el.height" (ngModelChange)="set('height', n($event), 'height')" />
      </ng-container>

      <ng-container *ngIf="el.kind === 'signature'">
        <label class="ptd-label">Caption under the line</label>
        <input class="ptd-input" [ngModel]="el.text" (ngModelChange)="set('text', $event, 'text')" />
        <label class="ptd-label">Printed name (optional)</label>
        <boo-select size="small" [options]="fieldOptionsWithNone" [searchable]="true" [ngModel]="el.field?.key ?? ''"
          (ngModelChange)="setField('key', $event ?? '')" />
        <label class="ptd-label">Space for signing (mm)</label>
        <input class="ptd-input" type="number" min="0" max="100" [ngModel]="el.height" (ngModelChange)="set('height', n($event), 'height')" />
      </ng-container>

      <ng-container *ngIf="el.kind === 'html'">
        <label class="ptd-label">HTML</label>
        <textarea #htmlRef class="ptd-input ptd-textarea font-mono text-[11px]" rows="12" spellcheck="false" [ngModel]="el.html"
          (ngModelChange)="set('html', $event, 'html')"></textarea>
        <ng-container *ngTemplateOutlet="insertField; context: { $implicit: htmlRef }"></ng-container>
        <p class="ptd-hint">Printed exactly as written. Placeholders use the <code ngNonBindable>{{ key }}</code> syntax of the print engine.</p>
      </ng-container>
    </section>

    <section class="ptd-group" *ngIf="el.kind === 'pageBreak'">
      <p class="text-xs text-gray-600 leading-relaxed m-0">Everything after this point starts on a new printed page. Page breaks only apply in the body.</p>
    </section>
    <!-- #endregion -->

    <!-- #region Layout -->
    <section class="ptd-group" *ngIf="el.kind !== 'pageBreak'">
      <h4 class="ptd-group-title">Size &amp; position</h4>
      <label class="ptd-label">Width <span class="font-normal text-gray-400">{{ el.style.width }}%</span></label>
      <div class="flex items-center gap-2">
        <input type="range" min="10" max="100" step="5" class="flex-1 accent-[rgb(var(--twc-primary))]"
          [ngModel]="el.style.width" (ngModelChange)="style({ width: n($event) }, 'width')" />
        <input class="ptd-input !mt-0 w-16" type="number" min="5" max="100" [ngModel]="el.style.width" (ngModelChange)="style({ width: n($event) }, 'width')" />
      </div>
      <label class="ptd-label">Alignment</label>
      <ng-container *ngTemplateOutlet="alignSeg; context: { value: el.style.align, set: setAlign }"></ng-container>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="ptd-label">Space above</label>
          <input class="ptd-input" type="number" min="0" max="100" step="0.5" [ngModel]="el.style.marginTop" (ngModelChange)="style({ marginTop: n($event) }, 'mt')" />
        </div>
        <div>
          <label class="ptd-label">Space below</label>
          <input class="ptd-input" type="number" min="0" max="100" step="0.5" [ngModel]="el.style.marginBottom" (ngModelChange)="style({ marginBottom: n($event) }, 'mb')" />
        </div>
        <div *ngIf="hasBox">
          <label class="ptd-label">Padding</label>
          <input class="ptd-input" type="number" min="0" max="50" step="0.5" [ngModel]="el.style.padding" (ngModelChange)="style({ padding: n($event) }, 'pad')" />
        </div>
      </div>
      <p class="ptd-hint">Spacing is in millimetres.</p>
    </section>
    <!-- #endregion -->

    <!-- #region Typography -->
    <section class="ptd-group" *ngIf="hasText">
      <h4 class="ptd-group-title">Text style</h4>
      <div class="grid grid-cols-[1fr_auto] gap-2 items-end">
        <div>
          <label class="ptd-label">Font size (pt)</label>
          <input class="ptd-input" type="number" min="5" max="72" placeholder="Page default" [ngModel]="el.style.fontSize"
            (ngModelChange)="style({ fontSize: $event === null || $event === '' ? null : n($event) }, 'fs')" />
        </div>
        <div class="ptd-seg">
          <button type="button" title="Bold" class="font-bold" [class.on]="el.style.bold" (click)="style({ bold: !el.style.bold })">B</button>
          <button type="button" title="Italic" class="italic font-serif" [class.on]="el.style.italic" (click)="style({ italic: !el.style.italic })">I</button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="ptd-label">Text colour</label>
          <ng-container *ngTemplateOutlet="colorInput; context: { value: el.style.color, set: setColor, clearable: true }"></ng-container>
        </div>
        <div>
          <label class="ptd-label">Background</label>
          <ng-container *ngTemplateOutlet="colorInput; context: { value: el.style.background, set: setBackground, clearable: true }"></ng-container>
        </div>
      </div>
    </section>
    <!-- #endregion -->

    <!-- #region Border -->
    <section class="ptd-group" *ngIf="hasBox">
      <h4 class="ptd-group-title">Border</h4>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="ptd-label">Width (px)</label>
          <input class="ptd-input" type="number" min="0" max="10" [ngModel]="el.style.borderWidth" (ngModelChange)="style({ borderWidth: n($event) }, 'bw')" />
        </div>
        <div>
          <label class="ptd-label">Colour</label>
          <ng-container *ngTemplateOutlet="colorInput; context: { value: el.style.borderColor, set: setBorderColor }"></ng-container>
        </div>
      </div>
      <ng-container *ngIf="el.style.borderWidth > 0">
        <label class="ptd-label">Style</label>
        <ng-container *ngTemplateOutlet="lineSeg"></ng-container>
      </ng-container>
    </section>
    <!-- #endregion -->

    <!-- #region Shared templates -->
    <ng-template #insertField let-target>
      <label class="ptd-label">Insert data field at cursor</label>
      <boo-select size="small" [options]="fieldOptions" [searchable]="true" [ngModel]="insertReset"
        (ngModelChange)="insertToken(target, $event)" />
    </ng-template>

    <ng-template #alignSeg let-value="value" let-set="set">
      <div class="ptd-seg">
        <button type="button" *ngFor="let a of aligns" [class.on]="value === a.value" [title]="a.label" (click)="set(a.value)">{{ a.short }}</button>
      </div>
    </ng-template>

    <ng-template #lineSeg>
      <div class="ptd-seg w-full">
        <button type="button" *ngFor="let s of lineStyles" class="flex-1" [class.on]="el.style.borderStyle === s" (click)="style({ borderStyle: s })">
          <span class="inline-block w-6 align-middle" [style.border-top]="'2px ' + s + ' currentColor'"></span>
        </button>
      </div>
    </ng-template>

    <ng-template #colorInput let-value="value" let-set="set" let-clearable="clearable">
      <div class="flex items-center gap-1 mt-1">
        <input type="color" class="ptd-color" [ngModel]="value || '#ffffff'" (ngModelChange)="set($event)" />
        <span class="text-[11px] font-mono text-gray-600 truncate flex-1">{{ value || 'none' }}</span>
        <button *ngIf="clearable && value" type="button" class="ptd-icon-btn" title="Clear" (click)="set('')">
          <physio-icon name="x" [size]="12" />
        </button>
      </div>
    </ng-template>
    <!-- #endregion -->
  `
})
export class PrintElementPropertiesComponent {
  private toastSrv = inject(ToastService);

  @Input({ required: true }) el!: PrintElement;
  @Input() fieldOptions: FieldOption[] = [];
  /** Emits a mutation plus an optional key; consecutive edits with the same key collapse into one undo step. */
  @Output() changed = new EventEmitter<{ fn: ElementEdit; coalesce?: string }>();

  formatOptions = FORMAT_OPTIONS;
  /** Flips between two empty values so the insert picker clears itself after each use. */
  insertReset: null | undefined = null;
  maxImageKb = MAX_IMAGE_BYTES / 1024;
  lineStyles: LineStyle[] = ['solid', 'dashed', 'dotted'];
  aligns: { value: Align; label: string; short: string }[] = [
    { value: 'left', label: 'Left', short: 'Left' },
    { value: 'center', label: 'Centre', short: 'Centre' },
    { value: 'right', label: 'Right', short: 'Right' },
  ];

  get meta() {
    return ELEMENT_PALETTE.find(p => p.kind === this.el.kind)!;
  }

  get fieldOptionsWithNone() {
    return [{ label: '— None —', value: '', fieldLabel: '' }, ...this.fieldOptions];
  }

  get hasText(): boolean {
    return !['divider', 'spacer', 'pageBreak', 'image'].includes(this.el.kind);
  }

  get hasBox(): boolean {
    return !['divider', 'spacer', 'pageBreak'].includes(this.el.kind);
  }

  // Bound once so the shared templates can call them with a single argument.
  setAlign = (v: Align) => this.style({ align: v });
  setColor = (v: string) => this.style({ color: v }, 'color');
  setBackground = (v: string) => this.style({ background: v }, 'bg');
  setBorderColor = (v: string) => this.style({ borderColor: v }, 'bc');
  setHeaderBg = (v: string) => this.edit(e => e.headerBackground = v, 'hbg');
  setColumnAlign = (i: number) => (v: Align) => this.edit(e => e.tableColumns![i].align = v);

  edit(fn: ElementEdit, coalesce?: string): void {
    this.changed.emit({ fn, coalesce });
  }

  set<K extends keyof PrintElement>(prop: K, value: PrintElement[K], coalesce?: string): void {
    this.edit(e => e[prop] = value, coalesce);
  }

  setField<K extends keyof BoundField>(prop: K, value: BoundField[K], coalesce?: string): void {
    this.edit(e => {
      e.field ??= { label: '', key: '', format: 'none' };
      e.field[prop] = value;
    }, coalesce && `field-${coalesce}`);
  }

  setGridField<K extends keyof BoundField>(i: number, prop: K, value: BoundField[K], coalesce?: string): void {
    this.edit(e => e.fields![i][prop] = value, coalesce);
  }

  addGridField(): void {
    this.edit(e => e.fields = [...(e.fields ?? []), { label: 'Field', key: '', format: 'none' }]);
  }

  removeGridField(i: number): void {
    this.edit(e => e.fields!.splice(i, 1));
  }

  setColumn<K extends keyof TableColumn>(i: number, prop: K, value: TableColumn[K], coalesce?: string): void {
    this.edit(e => e.tableColumns![i][prop] = value, coalesce);
  }

  setCell(ri: number, ci: number, value: string): void {
    this.edit(e => e.rows![ri][ci] = value, `cell-${ri}-${ci}`);
  }

  removeRow(ri: number): void {
    this.edit(e => e.rows!.splice(ri, 1));
  }

  style(patch: Partial<ElementStyle>, coalesce?: string): void {
    this.edit(e => Object.assign(e.style, patch), coalesce && `style-${coalesce}`);
  }

  n(v: unknown): number {
    const x = Number(v);
    return isFinite(x) ? x : 0;
  }

  validKey(k: string | undefined): boolean {
    return isValidKey(k ?? '');
  }

  isDataUri(s: string | undefined): boolean {
    return !!s?.startsWith('data:');
  }

  trackIndex(i: number): number {
    return i;
  }

  /** Picking a field also fills an untouched label with the field's own name. */
  bindField(key: string): void {
    const label = this.labelOf(key);
    this.edit(e => {
      const wasDefault = !e.field!.label || e.field!.label === 'Label' || e.field!.label === this.labelOf(e.field!.key);
      e.field!.key = key;
      if (wasDefault && label) e.field!.label = label;
    });
  }

  bindGridField(i: number, key: string): void {
    const label = this.labelOf(key);
    this.edit(e => {
      const f = e.fields![i];
      const wasDefault = !f.label || /^Field( \d+)?$/.test(f.label) || f.label === this.labelOf(f.key);
      f.key = key;
      if (wasDefault && label) f.label = label;
    });
  }

  addColumn(): void {
    this.edit(e => {
      const col: TableColumn = { label: `Column ${(e.tableColumns?.length ?? 0) + 1}`, key: '', format: 'none', width: null, align: 'left' };
      e.tableColumns = [...(e.tableColumns ?? []), col];
      e.rows = (e.rows ?? []).map(r => [...r, '']);
    });
  }

  removeColumn(i: number): void {
    this.edit(e => {
      e.tableColumns!.splice(i, 1);
      e.rows = (e.rows ?? []).map(r => r.filter((_, ci) => ci !== i));
    });
  }

  addRow(): void {
    this.edit(e => e.rows = [...(e.rows ?? []), (e.tableColumns ?? []).map(() => '')]);
  }

  reorder(event: CdkDragDrop<unknown>, list: 'fields' | 'tableColumns'): void {
    if (event.previousIndex === event.currentIndex) return;
    this.edit(e => {
      moveItemInArray(e[list] as unknown[], event.previousIndex, event.currentIndex);
      if (list === 'tableColumns' && e.rows) e.rows.forEach(r => moveItemInArray(r, event.previousIndex, event.currentIndex));
    });
  }

  insertToken(target: HTMLTextAreaElement, key: string | null): void {
    if (!key) return;
    const token = `{{ ${key} }}`;
    const prop = this.el.kind === 'html' ? 'html' : 'text';
    const current = this.el[prop] ?? '';
    const start = target?.selectionStart ?? current.length;
    const end = target?.selectionEnd ?? current.length;
    this.edit(e => e[prop] = current.slice(0, start) + token + current.slice(end));
    setTimeout(() => {
      this.insertReset = this.insertReset === null ? undefined : null;
      target?.focus();
      if (target) target.selectionStart = target.selectionEnd = start + token.length;
    });
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      this.toastSrv.error(`Image is too large (max ${this.maxImageKb} KB). Use a smaller file or an image link.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.edit(e => { e.src = String(reader.result); e.imageSource = 'url'; });
    reader.readAsDataURL(file);
  }

  private labelOf(key: string): string {
    return this.fieldOptions.find(o => o.value === key)?.fieldLabel ?? '';
  }
}
