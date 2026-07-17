import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, signal } from '@angular/core';
import { Orientation } from '../../../shared/enums/print-orientation';
import { PaperSize } from '../../../shared/enums/print-paper-size';
import { SharedModule } from '../../../shared/shared-imports';
import { PrintRenderResult } from '../../../shared/types/print-template.types';
import { BooIconComponent } from '../../icon/boo-icon/boo-icon.component';

@Component({
  selector: 'print-preview',
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
        class="fixed inset-0 bg-black/50 z-[2000]"
        (click)="onClose()"></div>

      <div @panelAnim
        class="fixed inset-4 md:inset-8 lg:inset-12 z-[2001] bg-surface rounded-lg shadow-2xl flex flex-col overflow-hidden">

        <header class="flex-none flex items-center justify-between gap-3 px-5 h-14 border-b border-gray-200">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <boo-icon name="printer" iconClass="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-gray-900 truncate">{{ title || 'Print preview' }}</div>
              <div class="text-xs text-gray-500" *ngIf="result">
                {{ result.paperSize }} · {{ result.orientation }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button type="button"
              (click)="zoomOut()"
              [disabled]="zoom() <= 0.5"
              class="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 disabled:opacity-30"
              title="Zoom out">
              <boo-icon name="zoom-out" iconClass="w-4 h-4" />
            </button>
            <span class="text-xs font-medium text-gray-600 w-12 text-center">{{ (zoom() * 100) | number:'1.0-0' }}%</span>
            <button type="button"
              (click)="zoomIn()"
              [disabled]="zoom() >= 2"
              class="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 disabled:opacity-30"
              title="Zoom in">
              <boo-icon name="zoom-in" iconClass="w-4 h-4" />
            </button>

            <span class="w-px h-5 bg-gray-200 mx-1"></span>

            <button type="button"
              (click)="onClose()"
              class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="button"
              (click)="onPrint()"
              [disabled]="!result || printing()"
              class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50">
              <boo-icon
                [name]="printing() ? 'loader-circle' : 'printer'"
                color="white"
                [iconClass]="printing() ? 'w-4 h-4 animate-spin' : 'w-4 h-4'" />
              <span>{{ printing() ? 'Sending…' : 'Print' }}</span>
            </button>
            <button type="button"
              (click)="onClose()"
              class="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 ml-1"
              title="Close">
              <boo-icon name="x" iconClass="w-4 h-4" />
            </button>
          </div>
        </header>

        <div class="flex-1 min-h-0 bg-slate-100 overflow-auto flex items-start justify-center p-6">
          <div class="bg-white shadow-lg origin-top"
            [style.transform]="'scale(' + zoom() + ')'"
            [style.width]="pageWidth"
            [style.minHeight]="pageHeight"
            [style.padding]="'24px'">
            <iframe #frame
              class="w-full h-full border-0"
              [srcdoc]="srcdoc"
              [style.minHeight]="pageHeight"></iframe>
          </div>
        </div>
      </div>
    </ng-container>
  `
})
export class PrintPreviewComponent implements OnChanges {
  @ViewChild('frame') frame?: ElementRef<HTMLIFrameElement>;

  @Input() open = false;
  @Input() title = '';
  @Input() result: PrintRenderResult | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() printed = new EventEmitter<void>();

  zoom = signal(0.85);
  printing = signal(false);
  srcdoc = '';

  ngOnChanges(_: SimpleChanges): void {
    if (this.result) {
      this.srcdoc = this.buildSrcDoc(this.result);
    }
  }

  get pageWidth(): string {
    if (!this.result) return '210mm';
    return this.dim(this.result.paperSize, this.result.orientation).width;
  }

  get pageHeight(): string {
    if (!this.result) return '297mm';
    return this.dim(this.result.paperSize, this.result.orientation).height;
  }

  zoomIn(): void { this.zoom.update(z => Math.min(2, +(z + 0.1).toFixed(2))); }
  zoomOut(): void { this.zoom.update(z => Math.max(0.5, +(z - 0.1).toFixed(2))); }

  onClose(): void {
    this.closed.emit();
  }

  onPrint(): void {
    const iframe = this.frame?.nativeElement;
    if (!iframe?.contentWindow) {
      this.printed.emit();
      return;
    }
    this.printing.set(true);
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } finally {
      setTimeout(() => {
        this.printing.set(false);
        this.printed.emit();
      }, 300);
    }
  }

  private buildSrcDoc(r: PrintRenderResult): string {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: ${this.pageSizeCss(r.paperSize, r.orientation)}; margin: 1cm; }
    html, body { margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #111; }
    ${r.customCss || ''}
  </style>
</head>
<body>${r.html}</body>
</html>`;
  }

  private dim(size: PaperSize, orientation: Orientation): { width: string; height: string } {
    const sizes: Record<PaperSize, [string, string]> = {
      [PaperSize.A4]: ['210mm', '297mm'],
      [PaperSize.A5]: ['148mm', '210mm'],
      [PaperSize.Letter]: ['215.9mm', '279.4mm'],
      [PaperSize.ThermalReceipt58mm]: ['', ''],
      [PaperSize.ThermalReceipt80mm]: ['', '']
    };
    const [w, h] = sizes[size] ?? sizes[PaperSize.A4];
    return orientation === Orientation.Landscape ? { width: h, height: w } : { width: w, height: h };
  }

  private pageSizeCss(size: PaperSize, orientation: Orientation): string {
    const d = this.dim(size, orientation);
    return `${d.width} ${d.height}`;
  }
}
