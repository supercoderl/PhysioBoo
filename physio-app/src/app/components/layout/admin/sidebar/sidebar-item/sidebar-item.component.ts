import { Component, Input } from '@angular/core';
import { ChevronDown, ChevronRight } from 'lucide-angular';
import { SharedModule } from '../../../../../shared/shared-imports';
import { MenuItem } from '../../../../../shared/types/menu';

@Component({
  selector: 'sidebar-item',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <a
      class="mb-1 flex w-full items-center justify-start gap-2 rounded-md px-2 py-1 relative cursor-pointer text-[13px] text-[#1F232B] transition-all duration-300 hover:bg-[rgba(0,_0,_0,_0.07)] hover:text-inherit"
      [routerLink]="item.children ? null : (['/admin'].concat(item.route.split('/') || []))"
    >
      <lucide-icon
        *ngIf="item.icon"
        [name]="item.icon"
        class="w-4 h-4"
      ></lucide-icon>
      <div class="flex min-w-0 flex-auto flex-col items-start gap-1">
        <p class="truncate max-w-full m-0 text-[#1F232B] text-[13px]">
          {{ item.label }}
        </p>
      </div>
      <lucide-icon
        *ngIf="item.children"
        [name]="expanded ? ChevronDown : ChevronRight"
        class="w-4 h-4 transition-all duration-300"
        (click)="toggle()"
      ></lucide-icon>
    </a>

    <div 
        *ngIf="item.children" 
        [ngClass]="{
            'ml-4 flex flex-col transition-all duration-500': true,
            'max-h-0 opacity-0 invisible': !expanded,
            'max-h-[500px] opacity-100 visible': expanded
        }"
    >
      <sidebar-item
        *ngFor="let child of item.children"
        [item]="child"
      ></sidebar-item>
    </div>
  `
})
export class SidebarItemComponent {
  ChevronDown = ChevronDown;
  ChevronRight = ChevronRight;

  @Input() item!: MenuItem;

  expanded: boolean = false;

  toggle() {
    if(this.item.children) {
      this.expanded = !this.expanded;
    }
  }
}
