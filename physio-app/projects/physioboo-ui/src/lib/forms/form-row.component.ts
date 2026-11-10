import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

const track = (t: string) => (/^[\d.]+fr$/.test(t) ? `minmax(0, ${t})` : t);

/**
 * Responsive grid of form fields: one column on mobile, two from 640px, `columns` from 1024px.
 * `ratio` ("2fr 1fr") replaces equal columns from 640px; its length should match `columns`.
 */
@Component({
  selector: 'boo-form-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host { display: grid; grid-template-columns: minmax(0, 1fr); column-gap: 1rem; row-gap: 0.5rem; min-width: 0; }
    @media (min-width: 640px) { :host { grid-template-columns: var(--boo-cols-md); } }
    @media (min-width: 1024px) { :host { grid-template-columns: var(--boo-cols-lg); } }
  `],
  host: {
    '[style.--boo-cols-md]': 'tracksMd',
    '[style.--boo-cols-lg]': 'tracksLg',
  },
})
export class BooFormRowComponent {
  @Input() columns: 1 | 2 | 3 | 4 = 2;
  @Input() ratio = '';

  get tracksMd(): string {
    return this.ratio ? this.ratioTracks : `repeat(${Math.min(this.columns, 2)}, minmax(0, 1fr))`;
  }

  get tracksLg(): string {
    return this.ratio ? this.ratioTracks : `repeat(${this.columns}, minmax(0, 1fr))`;
  }

  private get ratioTracks(): string {
    return this.ratio.trim().split(/\s+/).map(track).join(' ');
  }
}
