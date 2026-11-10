import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Cell of a `boo-form-row` that spans several columns from 640px. Plain fields do not need a column. */
@Component({
  selector: 'boo-form-column',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host { display: block; min-width: 0; }
    @media (min-width: 640px) { :host { grid-column: span var(--boo-span, 1); } }
  `],
  host: { '[style.--boo-span]': 'span' },
})
export class BooFormColumnComponent {
  @Input() span: 1 | 2 | 3 | 4 = 1;
}
