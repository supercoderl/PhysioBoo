import { NgIf } from "@angular/common";
import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { BooButtonComponent, BooIconComponent } from '@physioboo/ui';

let nextId = 0;

/**
 * Header, scrolling body and sticky footer shared by the laboratory form drawers. Render it with `*ngIf` while the
 * drawer is open; Escape and the close button emit `close`. Footer buttons go in the `[footer]` slot.
 */
@Component({
  selector: 'laboratory-drawer-shell',
  standalone: true,
  imports: [NgIf, BooButtonComponent, BooIconComponent],
  template: `
    <div class="flex flex-col h-full bg-surface" role="dialog" aria-modal="true" [attr.aria-labelledby]="headingId">
      <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 [id]="headingId" class="text-xl font-bold text-primary leading-tight mb-1">{{ title }}</h2>
          <p *ngIf="subtitle" class="text-sm text-secondary m-0 break-words">{{ subtitle }}</p>
        </div>
        <button boo-button variant="subtle" size="sm" [iconOnly]="true" aria-label="Close" (click)="close.emit()">
          <physio-icon name="x" [size]="20" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <ng-content></ng-content>
      </div>

      <div class="flex-none px-6 py-4 border-t border-gray-100 bg-surface flex flex-wrap justify-end gap-2">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
})
export class LaboratoryDrawerShellComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle: string | null = null;
  @Output() close = new EventEmitter<void>();

  readonly headingId = `laboratory-drawer-${++nextId}-title`;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }
}
