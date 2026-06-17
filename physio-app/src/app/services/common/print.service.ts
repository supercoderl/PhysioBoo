import { ApplicationRef, ComponentRef, EnvironmentInjector, Injectable, createComponent, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PrintPreviewComponent } from '../../components/print/print-preview/print-preview.component';
import { PrintTemplatePickerComponent } from '../../components/print/print-template-picker/print-template-picker.component';
import { Orientation } from '../../shared/enums/print-orientation';
import { PaperSize } from '../../shared/enums/print-paper-size';
import { PrintRenderResult, PrintTemplate } from '../../shared/types/print-template';
import { PrintTemplateService } from '../admin/print-template.service';
import { ToastService } from './toast.service';

export interface PrintOptions {
  /** Skip the preview modal and print immediately. Default: false (show preview). */
  skipPreview?: boolean;
  /** Title shown in the preview modal header. */
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class PrintService {
  private templateSrv = inject(PrintTemplateService);
  private toastSrv = inject(ToastService);
  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);

  /**
   * Fetch a template by code, interpolate data, then either preview-then-print
   * (default) or print headlessly.
   */
  async print(templateCode: string, data: Record<string, any>, opts: PrintOptions = {}): Promise<void> {
    try {
      const res = await firstValueFrom(this.templateSrv.render({ templateCode, data }));
      if (!res?.success || !res.data) {
        this.toastSrv.error('Failed to render template');
        return;
      }
      if (opts.skipPreview) {
        this.openPrintWindow(res.data);
      } else {
        this.openPreview(res.data, opts.title || templateCode);
      }
    } catch {
      this.toastSrv.error('Failed to render template');
    }
  }

  /** Print raw HTML without going through the template service. */
  printRaw(html: string, css = '', paperSize = PaperSize.A4, orientation = Orientation.Portrait, opts: PrintOptions = {}): void {
    const result: PrintRenderResult = {
      html, customCss: css,
      paperSize: paperSize as PaperSize,
      orientation: orientation as Orientation
    };
    if (opts.skipPreview) this.openPrintWindow(result);
    else this.openPreview(result, opts.title || 'Document');
  }

  /** Open the preview modal directly with an already-rendered result. */
  showPreview(result: PrintRenderResult, title = 'Document'): void {
    this.openPreview(result, title);
  }

  /**
   * Open the template picker, let the user choose, then render + preview + print.
   * Use when more than one template can satisfy the same document type.
   */
  async pickAndPrint(
    filter: { documentType?: string; module?: string },
    data: Record<string, any>,
    opts: PrintOptions = {}
  ): Promise<void> {
    const picked = await this.openPicker(filter);
    if (!picked) return;
    await this.print(picked.code, data, { ...opts, title: opts.title || picked.name });
  }

  /** Pop the chooser and resolve with the selected template, or null on cancel. */
  openPicker(filter: { documentType?: string; module?: string }): Promise<PrintTemplate | null> {
    return new Promise(resolve => {
      this.closePicker();
      const hostEl = document.createElement('div');
      document.body.appendChild(hostEl);

      const ref = createComponent(PrintTemplatePickerComponent, {
        environmentInjector: this.envInjector,
        hostElement: hostEl
      });
      ref.setInput('open', true);
      ref.setInput('documentType', filter.documentType ?? null);
      ref.setInput('module', filter.module ?? null);

      const cleanup = (value: PrintTemplate | null) => {
        this.appRef.detachView(ref.hostView);
        ref.destroy();
        hostEl.remove();
        if (this.pickerRef === ref) this.pickerRef = null;
        resolve(value);
      };

      ref.instance.picked.subscribe(t => cleanup(t));
      ref.instance.closed.subscribe(() => cleanup(null));

      this.appRef.attachView(ref.hostView);
      this.pickerRef = ref;
    });
  }

  /** Render data into a template HTML string client-side. Useful for live preview. */
  static interpolate(html: string, data: Record<string, any>): string {
    return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
      const value = path.split('.').reduce((acc: any, k: string) =>
        acc != null ? acc[k] : undefined, data
      );
      if (value === undefined || value === null) return '';
      return String(value);
    });
  }

  // --- internals ---------------------------------------------------------

  private previewRef: ComponentRef<PrintPreviewComponent> | null = null;
  private pickerRef: ComponentRef<PrintTemplatePickerComponent> | null = null;

  private closePicker(): void {
    if (this.pickerRef) {
      this.appRef.detachView(this.pickerRef.hostView);
      this.pickerRef.destroy();
      this.pickerRef = null;
    }
  }

  private openPreview(result: PrintRenderResult, title: string): void {
    this.closePreview();
    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    const ref = createComponent(PrintPreviewComponent, {
      environmentInjector: this.envInjector,
      hostElement: hostEl
    });
    ref.setInput('open', true);
    ref.setInput('result', result);
    ref.setInput('title', title);

    const cleanup = () => {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
      hostEl.remove();
      if (this.previewRef === ref) this.previewRef = null;
    };

    ref.instance.closed.subscribe(() => cleanup());
    ref.instance.printed.subscribe(() => cleanup());

    this.appRef.attachView(ref.hostView);
    this.previewRef = ref;
  }

  private closePreview(): void {
    if (this.previewRef) {
      this.appRef.detachView(this.previewRef.hostView);
      this.previewRef.destroy();
      this.previewRef = null;
    }
  }

  private openPrintWindow(result: PrintRenderResult): void {
    const win = window.open('', '_blank', 'width=900,height=1100');
    if (!win) {
      this.toastSrv.error('Pop-up blocked. Allow pop-ups to print.');
      return;
    }

    const sizeCss = this.paperSizeCss(result.paperSize, result.orientation);
    win.document.open();
    win.document.write(`<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Print</title>
        <style>
          @page { size: ${sizeCss}; margin: 1cm; }
          html, body { margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #111; }
          ${result.customCss || ''}
        </style>
      </head>
      <body>
      ${result.html}
      <script>
        window.addEventListener('load', () => { setTimeout(() => { window.focus(); window.print(); }, 50); });
        window.addEventListener('afterprint', () => window.close());
      </script>
      </body>
      </html>`);
    win.document.close();
  }

  private paperSizeCss(size: PaperSize, orientation: Orientation): string {
    const dim: Record<string, string> = {
      A4: '210mm 297mm',
      A5: '148mm 210mm',
      Letter: '215.9mm 279.4mm',
      Legal: '215.9mm 355.6mm',
    };
    const base = dim[size] ?? dim['A4'];
    return orientation === Orientation.Landscape
      ? base.split(' ').reverse().join(' ')
      : base;
  }
}
