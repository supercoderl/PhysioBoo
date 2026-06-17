import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { BooIconComponent } from '../../../../components/icon/boo-icon/boo-icon.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { PrintTemplateService } from '../../../../services/admin/print-template.service';
import { PrintService } from '../../../../services/common/print.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Orientation } from '../../../../shared/enums/print-orientation';
import { PaperSize } from '../../../../shared/enums/print-paper-size';
import { SharedModule } from '../../../../shared/shared-imports';
import {
  PlaceholderGroup,
  PrintTemplateDetail,
  PrintTemplateVersion
} from '../../../../shared/types/print-template';
import { convertEnumToSelection } from '../../../../shared/utils/common';

type EditField = 'header' | 'body' | 'footer' | 'css';

@Component({
  selector: 'admin-print-template-designer',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, BooIconComponent, BooSelectComponent],
  host: { class: 'block h-full min-h-0' },
  template: `
    <form [formGroup]="form" (ngSubmit)="onSave()" class="flex flex-col h-full bg-slate-50">

      <!-- Top bar -->
      <header class="flex-none flex items-center justify-between gap-3 px-4 h-14 bg-surface border-b border-gray-200">
        <div class="flex items-center gap-3 min-w-0">
          <button type="button" (click)="goBack()"
            class="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900">
            <boo-icon name="arrow-left" iconClass="w-4 h-4" />
          </button>
          <div class="min-w-0">
            <input type="text" formControlName="name" placeholder="Untitled template"
              class="text-base font-semibold text-gray-900 bg-transparent outline-none border-0 w-full truncate" />
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <input type="text" formControlName="code" placeholder="template-code"
                class="bg-transparent outline-none border-0 w-32 truncate" />
              <span>·</span>
              <select formControlName="module" class="bg-transparent outline-none border-0 text-xs">
                <option *ngFor="let m of modules" [value]="m">{{ m }}</option>
              </select>
              <span>·</span>
              <select formControlName="documentType" class="bg-transparent outline-none border-0 text-xs">
                <option *ngFor="let d of docTypes" [value]="d">{{ d }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0" formGroupName="version">
          <boo-select formControlName="paperSize" size="small" [options]="paperOptions" />
          <boo-select formControlName="orientation" size="small" [options]="orientationOptions" />

          <span class="w-px h-5 bg-gray-200 mx-1"></span>

          <button type="button" (click)="onTestPrint()"
            class="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 whitespace-nowrap shrink-0">
            <boo-icon name="printer" iconClass="w-3.5 h-3.5" />
            Test print
          </button>
          <button type="submit" [disabled]="!form.dirty || form.invalid"
            class="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded disabled:opacity-50 whitespace-nowrap shrink-0">
            <span>Save</span>
          </button>
        </div>
      </header>

      <!-- Body: 3 columns (palette | editor | preview) -->
      <div class="flex-1 min-h-0 grid grid-cols-[260px_1fr_1fr] gap-px bg-gray-200">

        <!-- Palette -->
        <aside class="bg-surface overflow-y-auto p-4">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Available fields</h3>
          <p class="text-xs text-gray-500 mb-3">Click a field to insert at cursor.</p>

          <input type="text" placeholder="Filter fields…"
            class="w-full h-8 px-2 text-xs border border-gray-200 rounded mb-3 outline-none focus:border-primary"
            [ngModelOptions]="{ standalone: true }"
            [ngModel]="paletteFilter()" (ngModelChange)="paletteFilter.set($event)" />

          <div *ngFor="let g of filteredPalette()" class="mb-4">
            <div class="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{{ g.group }}</div>
            <div class="flex flex-col gap-1">
              <button *ngFor="let f of g.fields" type="button"
                (click)="insertPlaceholder(f.key)"
                class="text-left px-2 py-1.5 text-xs rounded hover:bg-primary/5 hover:text-primary transition-colors">
                <span class="font-mono text-primary">{{ f.key }}</span>
                <div class="text-[11px] text-gray-500 truncate">{{ f.label }}</div>
              </button>
            </div>
          </div>

          <div *ngIf="!palette().length" class="text-xs text-gray-400">No placeholders configured.</div>
        </aside>

        <!-- Editor -->
        <section class="bg-surface flex flex-col overflow-hidden">
          <div class="flex border-b border-gray-200 bg-gray-50">
            <button *ngFor="let tab of editTabs" type="button"
              (click)="activeEditTab.set(tab.id)"
              [class.bg-surface]="activeEditTab() === tab.id"
              [class.border-b-2]="activeEditTab() === tab.id"
              [class.border-primary]="activeEditTab() === tab.id"
              [class.text-primary]="activeEditTab() === tab.id"
              [class.text-gray-600]="activeEditTab() !== tab.id"
              class="px-4 py-2 text-xs font-medium hover:text-gray-900 transition-colors">
              {{ tab.label }}
            </button>
          </div>
          <textarea #editorRef
            class="flex-1 p-4 font-mono text-sm bg-surface outline-none resize-none border-0 leading-relaxed"
            [placeholder]="placeholderFor(activeEditTab())"
            [formControl]="activeControl"
            spellcheck="false"></textarea>
        </section>

        <!-- Preview -->
        <section class="bg-surface flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
            <span class="text-xs font-medium text-gray-600">Live preview</span>
            <label class="inline-flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox"
                [ngModelOptions]="{ standalone: true }"
                [ngModel]="useSampleData()"
                (ngModelChange)="useSampleData.set($event)"
                class="w-3 h-3 accent-primary" />
              Sample data
            </label>
          </div>
          <iframe #previewRef class="flex-1 bg-white border-0" [srcdoc]="previewHtml()"></iframe>
        </section>
      </div>
    </form>
  `
})
export class AdminPrintTemplateDesignerComponent implements OnInit {
  @ViewChild('editorRef') editorRef?: ElementRef<HTMLTextAreaElement>;

  private fb = inject(FormBuilder);
  private templateSrv = inject(PrintTemplateService);
  private printSrv = inject(PrintService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastSrv = inject(ToastService);

  paperOptions = convertEnumToSelection(PaperSize);
  orientationOptions = convertEnumToSelection(Orientation);

  // #region Form
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

  /** Snapshot of form value as a signal — recomputes on any control change. Drives the live preview. */
  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  // #endregion

  // #region UI state (not part of the form)
  templateId = signal<string | null>(null);
  activeEditTab = signal<EditField>('body');
  paletteFilter = signal('');
  useSampleData = signal(true);
  palette = signal<PlaceholderGroup[]>([]);

  modules = ['clinical', 'billing', 'reception', 'lab', 'pharmacy', 'system'];
  docTypes = ['prescription', 'lab-report', 'discharge-summary', 'appointment', 'invoice', 'receipt'];
  editTabs: { id: EditField; label: string }[] = [
    { id: 'header', label: 'Header' },
    { id: 'body',   label: 'Body' },
    { id: 'footer', label: 'Footer' },
    { id: 'css',    label: 'CSS' },
  ];
  // #endregion

  // #region Derived
  filteredPalette = computed(() => {
    const term = this.paletteFilter().toLowerCase().trim();
    if (!term) return this.palette();
    return this.palette()
      .map(g => ({
        ...g, fields: g.fields.filter(f =>
          f.key.toLowerCase().includes(term) || f.label.toLowerCase().includes(term)
        )
      }))
      .filter(g => g.fields.length > 0);
  });

  previewHtml = computed(() => {
    const v = this.formValue();
    const ver = v.version!;
    const data = this.useSampleData() ? this.buildSampleData() : {};
    const headerHtml = PrintService.interpolate(ver.headerHtml ?? '', data);
    const bodyHtml   = PrintService.interpolate(ver.bodyHtml   ?? '', data);
    const footerHtml = PrintService.interpolate(ver.footerHtml ?? '', data);
    return `<!doctype html><html><head><meta charset="utf-8"/><style>
      html,body { margin:0; padding:24px; font-family: system-ui,-apple-system,Roboto,sans-serif; color:#111; }
      ${ver.customCss ?? ''}
    </style></head><body>
      <div class="print-header">${headerHtml}</div>
      <div class="print-body">${bodyHtml}</div>
      <div class="print-footer">${footerHtml}</div>
    </body></html>`;
  });
  // #endregion

  // #region Active control (for the editor textarea)
  get header() { return this.form.controls.version.controls.headerHtml; }
  get body()   { return this.form.controls.version.controls.bodyHtml; }
  get footer() { return this.form.controls.version.controls.footerHtml; }
  get css()    { return this.form.controls.version.controls.customCss; }

  get activeControl(): FormControl<string> {
    switch (this.activeEditTab()) {
      case 'header': return this.header;
      case 'body':   return this.body;
      case 'footer': return this.footer;
      default:       return this.css;
    }
  }
  // #endregion

  // #region Lifecycle
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.templateId.set(id);
      this.loadTemplate(id);
    }
    this.loadPlaceholders();
  }
  // #endregion

  // #region IO
  loadTemplate(id: string): void {
    this.templateSrv.getById(id)
      .pipe(catchError(_ => { this.toastSrv.error('Failed to load template'); return of(null); }))
      .subscribe(res => {
        if (res?.success && res.data) this.hydrate(res.data);
      });
  }

  loadPlaceholders(): void {
    this.templateSrv.placeholders()
      .pipe(catchError(_ => of(null)))
      .subscribe(res => {
        if (res?.success && res.data) this.palette.set(res.data);
        else this.palette.set(this.fallbackPalette());
      });
  }

  private hydrate(t: PrintTemplateDetail): void {
    const v = t.currentVersion;
    this.form.patchValue({
      name: t.name,
      code: t.code,
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
    this.form.markAsPristine();
  }
  // #endregion

  // #region Actions
  placeholderFor(f: EditField): string {
    return {
      header: '<!-- Header HTML — appears on every page -->',
      body:   '<!-- Main document content. Use {{placeholders}} for dynamic data. -->',
      footer: '<!-- Footer HTML — appears on every page -->',
      css:    '/* Custom CSS for this template */'
    }[f];
  }

  insertPlaceholder(key: string): void {
    const token = `{{${key}}}`;
    const ctrl = this.activeControl;
    const el = this.editorRef?.nativeElement;
    if (!el) {
      ctrl.setValue((ctrl.value ?? '') + token);
      ctrl.markAsDirty();
      return;
    }
    const start = el.selectionStart, end = el.selectionEnd;
    const current = ctrl.value ?? '';
    const next = current.slice(0, start) + token + current.slice(end);
    ctrl.setValue(next);
    ctrl.markAsDirty();
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + token.length;
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastSrv.error('Name and code are required');
      return;
    }
    const value = this.form.getRawValue();
    const version: Partial<PrintTemplateVersion> = value.version;

    const id = this.templateId();
    if (id) {
      this.templateSrv.saveVersion(id, version)
        .pipe(catchError(_ => { this.toastSrv.error('Failed to save'); return of(null); }))
        .subscribe(res => {
          if (res?.success) { this.form.markAsPristine(); this.toastSrv.success('Template saved'); }
        });
    } else {
      const payload = {
        name: value.name,
        code: value.code,
        module: value.module,
        documentType: value.documentType,
        version
      };
      this.templateSrv.create(payload)
        .pipe(catchError(_ => { this.toastSrv.error('Failed to create template'); return of(null); }))
        .subscribe(res => {
          if (res?.success && res.data) {
            this.templateId.set(res.data);
            this.form.markAsPristine();
            this.toastSrv.success('Template created');
            this.router.navigate(['/admin/system/print-templates', res.data], { replaceUrl: true });
          }
        });
    }
  }

  onTestPrint(): void {
    const v = this.form.getRawValue().version;
    const data = this.buildSampleData();
    const html = `
      <div>${PrintService.interpolate(v.headerHtml, data)}</div>
      <div>${PrintService.interpolate(v.bodyHtml,   data)}</div>
      <div>${PrintService.interpolate(v.footerHtml, data)}</div>
    `;
    this.printSrv.printRaw(html, v.customCss, v.paperSize, v.orientation);
  }

  goBack(): void {
    if (this.form.dirty && !confirm('Discard unsaved changes?')) return;
    this.router.navigate(['/admin/system/print-templates']);
  }
  // #endregion

  // #region Helpers
  private buildSampleData(): Record<string, any> {
    const data: Record<string, any> = {};
    for (const g of this.palette()) {
      for (const f of g.fields) {
        const path = f.key.split('.');
        let cursor = data;
        for (let i = 0; i < path.length - 1; i++) {
          cursor[path[i]] = cursor[path[i]] || {};
          cursor = cursor[path[i]];
        }
        cursor[path[path.length - 1]] = f.example ?? `[${f.key}]`;
      }
    }
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
