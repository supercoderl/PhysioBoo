import { Component, Input } from '@angular/core';
import { ChevronDown, ChevronRight } from 'lucide-angular';
import { SharedModule } from '../../../../../shared/shared-imports';

@Component({
  selector: 'sidebar-item',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './sidebar-item.component.html',
})
export class SidebarItemComponent {
  ChevronDown = ChevronDown;
  ChevronRight = ChevronRight;

  @Input() item: any;

  expanded: boolean = false;

  toggle() {
    if(this.item.children) {
      this.expanded = !this.expanded;
    }
  }
}
