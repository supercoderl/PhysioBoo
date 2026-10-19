import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BooButtonComponent } from '../../../components/button/boo-button/boo-button.component';
import { SharedModule } from '../../../shared/shared-imports';
import {
  PRIVACY_CONTACT_ROWS,
  PRIVACY_IS_DRAFT,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
  PrivacyTextSegment,
  splitPlaceholders,
} from './privacy-content';

interface PrivacyListView {
  segs: PrivacyTextSegment[];
  sub: string[];
}

interface PrivacyBlockView {
  type: 'p' | 'ul' | 'contact';
  segs: PrivacyTextSegment[];
  items: PrivacyListView[];
}

interface PrivacySectionView {
  id: string;
  number: string;
  /** Unpadded number shown in the contents list. */
  n: number;
  title: string;
  review: boolean;
  blocks: PrivacyBlockView[];
}

/** Distance kept above a section when it is scrolled into view. */
const SCROLL_OFFSET = 24;

/**
 * Public privacy policy (design: Privacy Page / Privacy Policy).
 * The copy is static and lives in privacy-content.ts; sections have stable ids (#s1 to #s13) so forms and emails can
 * link to them. The contents list marks the section being read and the page has its own print layout.
 */
@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [BooButtonComponent, SharedModule],
  templateUrl: './privacy.component.html',
})
export class PrivacyComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly year = new Date().getFullYear();
  readonly pageAddress = this.isBrowser ? `${window.location.origin}/privacy` : '/privacy';
  readonly isDraft = PRIVACY_IS_DRAFT;
  readonly lastUpdated = PRIVACY_LAST_UPDATED;
  readonly contactRows = PRIVACY_CONTACT_ROWS.map(r => ({ label: r.label, segs: splitPlaceholders(r.value) }));
  readonly sections: PrivacySectionView[] = PRIVACY_SECTIONS.map((s, i) => ({
    id: s.id,
    number: String(i + 1).padStart(2, '0'),
    n: i + 1,
    title: s.title,
    review: !!s.review,
    blocks: s.blocks.map(b => ({
      type: b.type,
      segs: b.type === 'p' ? splitPlaceholders(b.text) : [],
      items: b.type === 'ul'
        ? b.items.map(it => {
          const item = typeof it === 'string' ? { text: it } : it;
          return { segs: splitPlaceholders(item.text), sub: item.sub ?? [] };
        })
        : [],
    })),
  }));

  activeId = this.sections[0].id;
  tocOpen = false;

  private observer?: IntersectionObserver;
  private visible = new Set<string>();

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.observeSections();
    const fragment = this.route.snapshot.fragment;
    if (fragment && this.sections.some(s => s.id === fragment)) {
      // Wait a frame so the layout (and web fonts) settle before measuring the target.
      requestAnimationFrame(() => this.scrollToSection(fragment, false));
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  toggleToc(): void {
    this.tocOpen = !this.tocOpen;
  }

  goTo(id: string, event: Event): void {
    event.preventDefault();
    this.tocOpen = false;
    this.activeId = id;
    this.router.navigate([], { fragment: id, replaceUrl: true });
    this.scrollToSection(id, true);
  }

  goToTop(event: Event): void {
    event.preventDefault();
    this.activeId = this.sections[0].id;
    this.router.navigate([], { fragment: undefined, replaceUrl: true });
    this.scrollTo(this.host.nativeElement.querySelector('#top'), true);
  }

  print(): void {
    if (this.isBrowser) window.print();
  }

  private scrollToSection(id: string, focus: boolean): void {
    const section = this.document.getElementById(id);
    this.scrollTo(section, true);
    if (focus) {
      // Move keyboard and screen reader focus to the heading so the jump is announced.
      this.document.getElementById(id + '-h')?.focus({ preventScroll: true });
    }
  }

  private scrollTo(target: Element | null, smooth: boolean): void {
    if (!this.isBrowser || !target) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }

  /** Marks the topmost section inside the reading band as the current one in the contents list. */
  private observeSections(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) this.visible.add(e.target.id);
        else this.visible.delete(e.target.id);
      }
      const current = this.sections.find(s => this.visible.has(s.id));
      if (current) this.activeId = current.id;
    }, { rootMargin: '0px 0px -65% 0px' });
    for (const s of this.sections) {
      const el = this.document.getElementById(s.id);
      if (el) this.observer.observe(el);
    }
  }
}
