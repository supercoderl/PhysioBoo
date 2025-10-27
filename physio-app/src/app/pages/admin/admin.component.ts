import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, startWith, Subject, takeUntil } from "rxjs";
import { AdminLayoutComponent } from "../../components/layout/admin/admin-layout.component";
import { SharedModule } from "../../shared/shared-imports";

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [
        SharedModule,
        AdminLayoutComponent
    ],
    template: `
        <app-admin-layout [currentPath]="pathname">
            <router-outlet></router-outlet>
        </app-admin-layout>
    `
})

export class AdminComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    pathname: string = "";

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
}