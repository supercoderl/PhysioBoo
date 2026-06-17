import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { PrintService } from '../../../services/common/print.service';
import { SharedModule } from '../../../shared/shared-imports';
import { BooIconComponent } from '../../icon/boo-icon/boo-icon.component';

@Component({
  selector: 'boo-print-button',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <button type="button"
      (click)="onClick()"
      [disabled]="disabled || loading()"
      [class]="resolvedClass()"
      [title]="title || 'Print'">
      <boo-icon
        [name]="loading() ? 'loader-circle' : icon"
        [iconClass]="loading() ? 'w-4 h-4 animate-spin' : 'w-4 h-4'" />
      <span *ngIf="label">{{ loading() ? 'Loading…' : label }}</span>
    </button>
  `
})
export class BooPrintButtonComponent {
  /** Template code on the server (e.g. 'billing.receipt'). */
  @Input() templateCode = '';
  /** Data dictionary used to interpolate placeholders. */
  @Input() data: Record<string, any> = {};
  /** Visible label next to the icon. Pass empty string for icon-only. */
  @Input() label = 'Print';
  /** Icon name (lucide). */
  @Input() icon = 'printer';
  /** Tooltip. */
  @Input() title = '';
  /** Style variant. */
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'icon' = 'secondary';
  /** Disable the button. */
  @Input() disabled = false;
  /** Skip the preview modal and print immediately. */
  @Input() skipPreview = false;

  @Output() done = new EventEmitter<void>();

  private printSrv = inject(PrintService);
  loading = signal(false);

  async onClick(): Promise<void> {
    if (!this.templateCode || this.loading() || this.disabled) return;
    this.loading.set(true);
    try {
      await this.printSrv.print(this.templateCode, this.data, {
        skipPreview: this.skipPreview,
        title: this.title || this.label
      });
      this.done.emit();
    } finally {
      this.loading.set(false);
    }
  }

  resolvedClass(): string {
    const base = 'inline-flex items-center justify-center gap-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    switch (this.variant) {
      case 'primary':   return `${base} px-3 py-2 bg-primary text-white hover:bg-primary/90`;
      case 'ghost':     return `${base} px-3 py-2 text-gray-600 hover:bg-gray-100`;
      case 'icon':      return `${base} w-9 h-9 text-gray-500 hover:text-primary hover:bg-primary/5`;
      default:          return `${base} px-3 py-2 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50`;
    }
  }
}
