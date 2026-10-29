import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PublicSiteHero } from '../../../shared/types/public-site.types';

/**
 * The tenant's own hero photo (docs/home-redesign.md, section 8). Rendered only when the tenant published one; the host
 * page decides that, so a tenant without a photo gets a search-first hero and no placeholder art. If the photo fails
 * to load it hides itself instead of leaving a broken image.
 */
@Component({
  selector: 'home-hero-media',
  standalone: true,
  imports: [NgIf],
  template: `
    <img
      *ngIf="hero && !imageFailed"
      [src]="hero.imageUrl"
      [alt]="hero.alt ?? ''"
      [attr.width]="hero.width"
      [attr.height]="hero.height"
      [style.object-position]="focalPosition"
      fetchpriority="high"
      decoding="async"
      (error)="imageFailed = true"
      class="block w-full aspect-[4/3] object-cover rounded-2xl border border-gray-200"
    />
  `,
})
export class HomeHeroMediaComponent {
  @Input() hero: PublicSiteHero | null = null;

  imageFailed = false;

  get focalPosition(): string {
    return this.hero ? `${this.hero.focalX * 100}% ${this.hero.focalY * 100}%` : '50% 50%';
  }
}
