import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { PrintTemplateService } from '../../../services/admin/print-template.service';
import { SharedModule } from '../../../shared/shared-imports';
import { PrintTemplate } from '../../../shared/types/print-template.types';
import { BooIconComponent } from '../../icon/boo-icon/boo-icon.component';

@Component({
  selector: 'print-template-picker',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  animations: [
    trigger('overlayAnim', [
      transition(':enter', [style({ opacity: 0 }), animate('120ms', style({ opacity: 1 }))]),
      transition(':leave', [animate('100ms', style({ opacity: 0 }))])
    ]),
    trigger('panelAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.98) translateY(8px)' }),
        animate('160ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ])
  ],
  template: `
    <ng-container *ngIf="open">
      <div @overlayAnim
        class="fixed inset-0 bg-black/40 z-[1000]"
        (click)="onClose()"></div>

      <div @panelAnim
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[92vw] z-[1001] bg-surface rounded-lg shadow-2xl flex flex-col overflow-hidden">

        <header class="flex items-center justify-between px-5 h-14 border-b border-gray-200">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <boo-icon name="file-text" iconClass="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-gray-900">Choose template</div>
              <div class="text-xs text-gray-500 truncate" *ngIf="documentType">{{ documentType }}</div>
            </div>
          </div>
          <button type="button" (click)="onClose()"
            class="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900">
            <boo-icon name="x" iconClass="w-4 h-4" />
          </button>
        </header>

        <div class="flex-1 max-h-[60vh] overflow-y-auto">
          <div *ngIf="loading()" class="p-8 flex items-center justify-center text-sm text-gray-400">
            <boo-icon name="loader-circle" iconClass="w-5 h-5 mr-2 animate-spin" />
            Loading templates…
          </div>

          <div *ngIf="!loading() && !templates().length"
            class="p-10 flex flex-col items-center text-center">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <boo-icon name="file-x" iconClass="w-6 h-6 text-gray-400" />
            </div>
            <p class="text-sm font-medium text-gray-700 mb-1">No templates configured</p>
            <p class="text-xs text-gray-500">Create one in System → Print Templates.</p>
          </div>

          <div class="divide-y divide-gray-100">
            <button *ngFor="let t of templates()" type="button"
              (click)="onPick(t)"
              class="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-left transition-colors">
              <div class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <boo-icon name="file-text" iconClass="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900 truncate">{{ t.name }}</span>
                  <span *ngIf="t.isSystemDefault"
                    class="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    Default
                  </span>
                </div>
                <div class="text-xs text-gray-500 truncate">{{ t.code }}</div>
              </div>
              <boo-icon name="chevron-right" iconClass="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-2 px-5 h-14 border-t border-gray-100">
          <button type="button" (click)="onClose()"
            class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
            Cancel
          </button>
        </footer>
      </div>
    </ng-container>
  `
})
export class PrintTemplatePickerComponent implements OnChanges {
  @Input() open = false;
  @Input() documentType: string | null = null;
  @Input() module: string | null = null;
  @Output() picked = new EventEmitter<PrintTemplate>();
  @Output() closed = new EventEmitter<void>();

  private templateSrv = inject(PrintTemplateService);
  templates = signal<PrintTemplate[]>([]);
  loading = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.templateSrv.search({
      pageNumber: 1, pageSize: 50, search: '', sort: '-isSystemDefault,+name',
      filter: { start: '', end: '', module: this.module, documentType: this.documentType, isActive: true }
    })
      .pipe(catchError(_ => of(null)))
      .subscribe(res => {
        this.loading.set(false);
        this.templates.set(res?.success ? (res.data?.items ?? []) : []);
      });
  }

  onPick(t: PrintTemplate): void { this.picked.emit(t); }
  onClose(): void { this.closed.emit(); }
}
