import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../../../../shared/shared-imports';
import { MenuItem } from '../../../../../shared/types/menu.types';

@Component({
  selector: 'sidebar-item',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <a
      class="group mb-0.5 flex w-full items-center justify-start gap-2.5 rounded-1.5 px-2.5 py-2 relative cursor-pointer text-[13px] transition-all duration-200"
      [class.bg-sidebarActive]="isActive && !item.children"
      [class.text-primaryHover]="isActive"
      [class.font-semibold]="isActive"
      [class.text-brandDark]="!isActive"
      [class.hover:bg-sidebarHover]="!isActive"
      [routerLink]="item.children ? null : linkFor(item.route)"
      routerLinkActive
      #rla="routerLinkActive"
      (isActiveChange)="onActiveChange($event)"
      [routerLinkActiveOptions]="{ exact: false }"
    >
      <span
        *ngIf="isActive && !item.children"
        class="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary"
      ></span>
      <physio-icon
        *ngIf="item.icon"
        [name]="item.icon"
        [class.text-primaryHover]="isActive"
        [class.text-brandDark]="!isActive"
        class="shrink-0"
      />
      <div class="flex min-w-0 flex-auto flex-col items-start gap-1">
        <p class="truncate max-w-full m-0 text-[13px]">
          {{ item.label }}
        </p>
      </div>
      <physio-icon
        *ngIf="item.children"
        [name]="expanded ? 'chevron-down' : 'chevron-right'"
        class="w-3.5 h-3.5 text-secondary transition-transform duration-200 shrink-0"
        (click)="toggle($event)"
      ></physio-icon>
    </a>

    <div
        *ngIf="item.children"
        [ngClass]="{
            'ml-3.5 pl-2 border-l border-sidebarDivider flex flex-col transition-all duration-300 overflow-hidden': true,
            'max-h-0 opacity-0': !expanded,
            'max-h-[1000px] opacity-100 mt-0.5': expanded
        }"
    >
      <sidebar-item
        *ngFor="let child of item.children"
        [item]="child"
      ></sidebar-item>
    </div>
  `
})
export class SidebarItemComponent implements OnInit {
  @Input() item!: MenuItem;

  expanded: boolean = false;
  isActive: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (this.item.children) {
      this.expanded = this.hasActiveDescendant(this.item.children);
    }
  }

  /** Superadmin routes are absolute; admin routes are stored relative to `/admin`. */
  linkFor(route: string): string | string[] {
    return route.startsWith('/superadmin') ? route : ['/admin'].concat(route.split('/') || []);
  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (this.item.children) {
      this.expanded = !this.expanded;
    }
  }

  onActiveChange(active: boolean): void {
    this.isActive = active;
  }

  private hasActiveDescendant(children: MenuItem[]): boolean {
    const url = this.router.url;
    return children.some(c =>
      (c.route && url.includes(c.route)) || (c.children && this.hasActiveDescendant(c.children))
    );
  }
}
