import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Footer row for a form's buttons. `sticky` pins it to the bottom of the scrolling container. */
@Component({
  selector: 'boo-form-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  host: {
    class: 'flex flex-wrap items-center gap-3',
    '[class.justify-start]': "align === 'start'",
    '[class.justify-end]': "align === 'end'",
    '[class.justify-between]': "align === 'between'",
    '[class.sticky]': 'sticky',
    '[class.bottom-0]': 'sticky',
    '[class.z-10]': 'sticky',
    '[class.border-t]': 'sticky',
    '[class.border-form-border]': 'sticky',
    '[class.bg-form-surface]': 'sticky',
    '[class.py-3]': 'sticky',
  },
})
export class BooFormActionsComponent {
  @Input() align: 'start' | 'end' | 'between' = 'end';
  @Input() sticky = false;
}
