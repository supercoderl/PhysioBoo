import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Title and description for a form area that is not an outlined card, with a slot for trailing actions. */
@Component({
  selector: 'boo-form-section-header',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-w-0">
      <h3 class="m-0 text-base font-medium leading-6 text-form-text">{{ heading }}</h3>
      <p *ngIf="description" class="m-0 mt-0.5 text-xs leading-[18px] text-form-muted">{{ description }}</p>
    </div>
    <div class="flex flex-none items-center gap-2"><ng-content select="[actions]"></ng-content></div>
  `,
  host: { class: 'flex items-start justify-between gap-3 min-w-0' },
})
export class BooFormSectionHeaderComponent {
  @Input() heading = '';
  @Input() description = '';
}
