import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { SharedModule } from "../../shared/shared-imports";

@Component({
  selector: 'admin-breadcrumb',
  standalone: true,
  imports: [SharedModule],
  template: `
    <nav
      *ngIf="breadcrumbs.length"
      [ngClass]="{
        'flex w-fit rounded-sm border border-solid border-[#EFE3E7] px-2 mb-2 text-[13px] leading-[1.5]': true,
        'text-[#71606A]': theme === 'light',
        'text-white': theme === 'dark'
      }"
      aria-label="breadcrumb"
    >
      <ol class="list-none m-0 p-0 flex items-center flex-wrap">
        <li *ngFor="let crumb of breadcrumbs; let i = index; let last = last"
            class="flex items-center text-secondary">
          <a
            class="block max-w-32 truncate font-medium capitalize m-0 leading-[1.5] text-secondary"
            [routerLink]="crumb.url"
          >
            {{ crumb.label }}
          </a>
          <physio-icon
            *ngIf="!last"
            name="chevron-right"
            [size]="20"
            [class]="'inlineFlex-center-center align-middle mx-1'"
            [style.color]="theme === 'light' ? '#71606A' : 'white'"
          />
        </li>
      </ol>
    </nav>
  `
})
export class AdminBreadcrumbComponent implements OnInit {
  @Input() theme: "light" | "dark" = "light";
  breadcrumbs: Array<{ label: string; url: string }> = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  ngOnInit() {
    this.updateBreadcrumbs();
  }

  private updateBreadcrumbs(): void {
    const root = this.router.routerState.root;
    this.breadcrumbs = this.getBreadcrumbs(root);
  }

  private getBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Array<{ label: string; url: string }> = []
  ): Array<{ label: string; url: string }> {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map(segment => segment.path)
        .join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];

      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.getBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}