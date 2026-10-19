import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

/** Core value card (design: ValueCard.dc.html). */
@Component({
  selector: 'value-card',
  standalone: true,
  imports: [SharedModule],
  host: { class: 'block h-full' },
  template: `
    <article class="h-full bg-surface border border-gray-200 rounded-2xl p-6 flex flex-col gap-2.5 text-gray-900 min-w-0">
      <span aria-hidden="true" class="w-11 h-11 rounded-xl bg-primarySoft text-primaryDeep flex items-center justify-center mb-1.5"><physio-icon [name]="icon" [size]="20" /></span>
      <h3 class="text-lg leading-[26px] font-semibold m-0">{{ title }}</h3>
      <p class="text-[15px] leading-[23px] text-gray-800 m-0 text-pretty">{{ body }}</p>
    </article>
  `,
})
export class ValueCardComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) body!: string;
}
