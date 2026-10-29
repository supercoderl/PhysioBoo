import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooIconComponent } from '@physioboo/ui';
import { telHref } from '../../../shared/utils/contact.utils';
import { HomeStep } from './home.data';

/**
 * How an appointment request works, placed right under the hero so the visitor knows what a request is before they
 * meet a doctor card (docs/home-redesign.md, section 8). Contact fields the tenant has not published stay hidden.
 */
@Component({
  selector: 'home-request-strip',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, BooIconComponent],
  template: `
    <section aria-labelledby="request-strip-title" class="bg-surface border-y border-gray-200">
      <div
        class="public-container py-6 lg:py-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] lg:gap-12 lg:items-start"
      >
        <div>
          <h2 id="request-strip-title" class="sr-only">How an appointment request works</h2>
          <ol role="list" class="list-none m-0 p-0 grid gap-4 md:grid-cols-3 md:gap-6">
            <li *ngFor="let s of steps; let i = index; trackBy: trackByTitle" class="flex gap-3 min-w-0">
              <span
                aria-hidden="true"
                class="w-8 h-8 rounded-full bg-gray-100 text-gray-900 text-sm font-semibold flex items-center justify-center flex-none"
                >{{ i + 1 }}</span
              >
              <div class="min-w-0">
                <p class="text-base font-semibold text-gray-900 mb-0.5">{{ s.t }}</p>
                <p class="text-sm leading-5 text-gray-700">{{ s.d }}</p>
              </div>
            </li>
          </ol>
        </div>

        <div class="border-t border-gray-200 pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8 min-w-0">
          <p class="text-sm text-gray-700 mb-1">Prefer to talk?</p>
          <ng-container *ngIf="phone || email; else message">
            <a
              *ngIf="phone"
              [href]="phoneHref"
              class="flex items-center gap-2 min-h-11 text-base font-semibold text-gray-900 hover:text-primaryDeep underline underline-offset-2"
            >
              <physio-icon name="phone" [size]="18" class="flex-none" />
              <span class="min-w-0 break-words">{{ phone }}</span>
            </a>
            <a
              *ngIf="email"
              [href]="'mailto:' + email"
              class="flex items-center gap-2 min-h-11 text-base font-semibold text-gray-900 hover:text-primaryDeep underline underline-offset-2"
            >
              <physio-icon name="mail" [size]="18" class="flex-none" />
              <span class="min-w-0 break-all">{{ email }}</span>
            </a>
          </ng-container>
          <ng-template #message>
            <a
              routerLink="/contact"
              class="flex items-center gap-2 min-h-11 text-base font-semibold text-gray-900 hover:text-primaryDeep underline underline-offset-2"
              >Send us a message</a
            >
          </ng-template>
        </div>
      </div>
    </section>
  `,
})
export class HomeRequestStripComponent {
  @Input({ required: true }) steps: HomeStep[] = [];
  @Input() phone: string | null = null;
  @Input() email: string | null = null;

  get phoneHref(): string {
    return this.phone ? telHref(this.phone) : '';
  }

  trackByTitle(_: number, step: HomeStep): string {
    return step.t;
  }
}
