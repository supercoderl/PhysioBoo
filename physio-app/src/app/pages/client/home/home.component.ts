import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CLIENT_TENANT } from '../../../shared/data/client-site';
import { SharedModule } from '../../../shared/shared-imports';
import {
  HOME_ARTICLES,
  HOME_DOCTORS,
  HOME_FAQS,
  HOME_GUIDANCE,
  HOME_HOSPITALS,
  HOME_POPULAR,
  HOME_REASONS,
  HOME_SPECIALTIES,
  HOME_STEPS,
  HOME_TESTIMONIALS,
} from './home.data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './home.component.html',
  styles: `
    .ph-stripes { background: repeating-linear-gradient(135deg, #F3EAED 0 10px, #F9F4F6 10px 20px); }
    .ph-stripes-sm { background: repeating-linear-gradient(135deg, #F3EAED 0 6px, #F9F4F6 6px 12px); }
    .no-scrollbar { scrollbar-width: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly tenant = CLIENT_TENANT;
  readonly popular = HOME_POPULAR;
  readonly specialties = HOME_SPECIALTIES;
  readonly doctors = HOME_DOCTORS;
  readonly hospitals = HOME_HOSPITALS;
  readonly steps = HOME_STEPS;
  readonly guidance = HOME_GUIDANCE;
  readonly reasons = HOME_REASONS;
  readonly faqs = HOME_FAQS;
  readonly articles = HOME_ARTICLES;
  readonly testimonials = HOME_TESTIMONIALS;

  search = { q: '', location: '', date: '' };
  openFaq = 0;

  ngOnInit(): void {
    // The router has no anchor scrolling, so links like /#specialties are handled here.
    this.route.fragment
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(fragment => {
        if (!this.isBrowser || !fragment) return;
        setTimeout(() => document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      });
  }

  pickPopular(name: string) {
    this.search.q = name;
  }

  submitSearch(event: Event) {
    event.preventDefault();
    const { q, location, date } = this.search;
    this.router.navigate(['/doctor'], {
      queryParams: { q: q.trim() || null, location: location.trim() || null, date: date.trim() || null },
    });
  }

  toggleFaq(index: number) {
    this.openFaq = this.openFaq === index ? -1 : index;
  }
}
