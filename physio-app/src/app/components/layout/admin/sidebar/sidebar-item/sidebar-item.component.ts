import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChevronDown, ChevronRight } from 'lucide-angular';
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
      [class.bg-primary]="isActive && !item.children"
      [class.bg-opacity-10]="isActive && !item.children"
      [class.text-primary]="isActive"
      [class.font-medium]="isActive"
      [class.text-regular]="!isActive"
      [class.hover:bg-gray-100]="!isActive"
      [routerLink]="item.children ? null : (['/admin'].concat(item.route.split('/') || []))"
      routerLinkActive
      #rla="routerLinkActive"
      (isActiveChange)="onActiveChange($event)"
      [routerLinkActiveOptions]="{ exact: false }"
    >
      <span
        *ngIf="isActive && !item.children"
        class="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary"
      ></span>
      <lucide-icon
        *ngIf="item.icon"
        [name]="item.icon"
        [class.stroke-primary]="isActive"
        [class.stroke-regular]="!isActive"
        class="w-4 h-4 shrink-0"
      ></lucide-icon>
      <div class="flex min-w-0 flex-auto flex-col items-start gap-1">
        <p class="truncate max-w-full m-0 text-[13px]">
          {{ item.label }}
        </p>
      </div>
      <lucide-icon
        *ngIf="item.children"
        [name]="expanded ? ChevronDown : ChevronRight"
        class="w-3.5 h-3.5 text-secondary transition-transform duration-200 shrink-0"
        (click)="toggle($event)"
      ></lucide-icon>
    </a>

    <div
        *ngIf="item.children"
        [ngClass]="{
            'ml-3.5 pl-2 border-l border-borderGray/60 flex flex-col transition-all duration-300 overflow-hidden': true,
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
  ChevronDown = ChevronDown;
  ChevronRight = ChevronRight;

  @Input() item!: MenuItem;

  expanded: boolean = false;
  isActive: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (this.item.children) {
      this.expanded = this.hasActiveDescendant(this.item.children);
    }
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
