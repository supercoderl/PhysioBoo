import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Vertical stack of form sections with the standard gap; `maxWidth` (e.g. "960px") centres a narrower form. */
@Component({
  selector: 'boo-form-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  host: {
    class: 'flex w-full min-w-0 flex-col gap-6',
    '[style.max-width]': 'maxWidth || null',
    '[class.mx-auto]': '!!maxWidth',
  },
})
export class BooFormContainerComponent {
  @Input() maxWidth = '';
}
