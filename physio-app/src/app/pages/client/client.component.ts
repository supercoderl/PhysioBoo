import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith, Subject, takeUntil } from 'rxjs';
import { LayoutComponent } from "../../components/layout/client/layout.component";
import { SharedModule } from '../../shared/shared-imports';

@Component({
    selector: 'app-client',
    standalone: true,
    imports: [
        SharedModule,
        LayoutComponent
    ],
    template: `
        <app-layout class="public-motion" [hasFooter]="true" [currentPath]="pathname">
            <div #page><router-outlet (activate)="onActivate()"></router-outlet></div>
        </app-layout>
  `,
})
export class ClientComponent implements OnDestroy, OnInit {
    private destroy$ = new Subject<void>();
    pathname: string = "";

    @ViewChild('page', { static: true }) private page!: ElementRef<HTMLElement>;
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private firstActivation = true;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnInit() {
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            startWith(null),
            map(() => {
                let route = this.activatedRoute;
                while (route.firstChild) route = route.firstChild;
                return route.snapshot.data['breadcrumbs'] as string[] | undefined;
            }),
            takeUntil(this.destroy$)
        ).subscribe(bc => {
            this.pathname = bc ? bc[0] : "";
        });
    }

    /**
     * Opacity-only fade of the new page (180 ms, see styles.scss). Navigation is never delayed: the router has already
     * swapped the content, and the first page of a visit is skipped so SSR/hydration output never flashes.
     */
    onActivate() {
        if (!this.isBrowser) return;
        if (this.firstActivation) {
            this.firstActivation = false;
            return;
        }
        this.resetScroll();
        const el = this.page.nativeElement;
        el.classList.remove('motion-route');
        void el.offsetWidth;
        el.classList.add('motion-route');
    }

    /**
     * The router keeps the window scroll when the page component changes, so opening a page from a scrolled one left the
     * new page's heading above the viewport. Start every new page at the top, except for links to a fragment (the page
     * scrolls to its own section) and back/forward navigation (the browser restores its position).
     */
    private resetScroll() {
        const nav = this.router.getCurrentNavigation();
        if (nav?.trigger === 'popstate' || nav?.extractedUrl.fragment) return;
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
}
