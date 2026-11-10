import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BooIconComponent } from '../icon/icon.component';

export type BooAlertTone = 'error' | 'warning' | 'info' | 'success';

const TONE: Record<BooAlertTone, { box: string; icon: string }> = {
  error: { box: 'border-dangerBorder bg-dangerSoft text-danger', icon: 'circle-alert' },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-800', icon: 'triangle-alert' },
  info: { box: 'border-primary/30 bg-primarySoft text-primaryDeep', icon: 'info' },
  success: { box: 'border-green-200 bg-green-50 text-green-800', icon: 'circle-check' },
};

/**
 * Inline message box for the outcome of an action or a standing condition (a failed save, an allergy warning, a hint).
 * Not for a section that failed to load (use `boo-inline-error`) and not for field validation (use `boo-field-error`).
 *
 * `role` decides how it is announced: `alert` for something that just went wrong, `status` for a result, `note` for
 * standing information. The message is the projected content; `heading` adds a bold first line.
 */
@Component({
  selector: 'boo-alert',
  standalone: true,
  imports: [NgIf, BooIconComponent],
  template: `
    <physio-icon [name]="icon || toneIcon" [size]="16" class="flex-none mt-0.5" aria-hidden="true" />
    <div class="min-w-0 flex-1">
      <p *ngIf="heading" class="m-0 font-semibold">{{ heading }}</p>
      <div><ng-content></ng-content></div>
    </div>
  `,
  host: {
    '[attr.role]': 'role',
    '[class]': "'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ' + toneBox",
  },
})
export class BooAlertComponent {
  @Input() tone: BooAlertTone = 'error';
  @Input() role: 'alert' | 'status' | 'note' = 'alert';
  @Input() heading = '';
  /** Overrides the tone's default icon. */
  @Input() icon = '';

  get toneBox(): string { return TONE[this.tone].box; }
  get toneIcon(): string { return TONE[this.tone].icon; }
}
