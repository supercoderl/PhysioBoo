import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared-imports';
import { LayoutComponent } from "../../components/layout/layout.component";
import { delay, filter, map, startWith, Subject, takeUntil } from 'rxjs';
import { AOSService } from '../../services/aos/aos.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
    selector: 'app-client',
    standalone: true,
    imports: [
        SharedModule,
        LayoutComponent
    ],
    template: `
        <app-layout [hasFooter]="true" [currentPath]="pathname">
            <router-outlet></router-outlet>
        </app-layout>
  `,
})
export class ClientComponent implements AfterViewInit, OnDestroy, OnInit {
    private destroy$ = new Subject<void>();
    pathname: string = "";

    constructor(
        private aosService: AOSService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    ngAfterViewInit(): void {
        // Initialize AOS when this lazy-loaded component loads
        this.aosService.initialize();

        // Refresh AOS on route changes within lazy module
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            delay(200), // Increased delay for lazy-loaded content
            takeUntil(this.destroy$)
        ).subscribe(() => {
            // Use forceRefresh for route changes in lazy modules
            this.aosService.forceRefresh();

            // Additional refresh after a longer delay
            setTimeout(() => {
                this.aosService.refresh();
            }, 300);
        });
    }

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
}
