import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Outlined card for one group of fields. The title sits in the top border: the native `legend` interrupts the border
 * with a transparent gap, so it blends with whatever surface the card is on, and assistive tech announces the card as
 * a named group.
 *
 * `<fieldset boo-form-section heading="Patient" description="Who is being registered">...</fieldset>`
 */
@Component({
  selector: 'fieldset[boo-form-section]',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <legend *ngIf="heading" class="max-w-full px-2 text-[13px] font-medium leading-[18px] text-form-muted">{{ heading }}</legend>
    <p *ngIf="description" class="m-0 mb-4 pt-2 text-xs leading-[18px] text-form-muted">{{ description }}</p>
    <div class="min-w-0"><ng-content></ng-content></div>
  `,
  host: {
    class: 'm-0 block min-w-0 rounded-xl border border-form-border bg-form-surface px-5 pb-4 pt-1 sm:px-6',
  },
})
export class BooFormSectionComponent {
  @Input() heading = '';
  @Input() description = '';
}
