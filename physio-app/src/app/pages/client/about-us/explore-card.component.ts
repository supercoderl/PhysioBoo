import { Component, Input } from '@angular/core';
import { BooButtonComponent } from '../../../components/button/boo-button/boo-button.component';
import { SharedModule } from '../../../shared/shared-imports';

/** Entry point card linking to a listing page (design: ExploreCard.dc.html). */
@Component({
  selector: 'explore-card',
  standalone: true,
  imports: [SharedModule, BooButtonComponent],
  host: { class: 'block h-full' },
  template: `
    <article class="h-full bg-surface border border-gray-200 rounded-[20px] p-7 flex flex-col gap-3 text-gray-900 min-w-0 transition-shadow hover:border-[#E3C4CE] hover:shadow-[0_12px_32px_rgba(38,20,26,.06)]">
      <span aria-hidden="true" class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 text-primaryDeep flex items-center justify-center mb-1"><physio-icon [name]="icon" [size]="24" /></span>
      <h3 class="text-xl leading-7 font-semibold m-0">{{ title }}</h3>
      <p class="text-[15px] leading-[23px] text-gray-800 m-0 flex-1 text-pretty">{{ body }}</p>
      <a boo-button variant="outline" size="lg" [block]="true" [routerLink]="href" class="mt-2">{{ cta }}<physio-icon name="arrow-right" [size]="16" /></a>
    </article>
  `,
})
export class ExploreCardComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) body!: string;
  @Input({ required: true }) cta!: string;
  @Input({ required: true }) href!: string;
}
