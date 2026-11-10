import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Separator between groups of fields, optionally labelled. */
@Component({
  selector: 'boo-form-divider',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="h-px flex-1 bg-form-border"></span>
    <ng-container *ngIf="label">
      <span class="text-xs font-medium text-form-muted">{{ label }}</span>
      <span class="h-px flex-1 bg-form-border"></span>
    </ng-container>
  `,
  host: { class: 'flex items-center gap-3 my-2', role: 'separator' },
})
export class BooFormDividerComponent {
  @Input() label = '';
}
