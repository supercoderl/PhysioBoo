import { Component, HostListener, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { HEADERS } from '../../../../shared/data/dummy';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'layout-header',
  standalone: true,
  imports: [
    SharedModule,
    RouterLink
],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  isSticky = false;
  isOpen = false;

  readonly headers = HEADERS;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = window.scrollY > 50;
  }
  @Input() currentPath: string = "";

  getHeaderByCurrentPath() {
    return this.headers.find(
      (x: { title: string }) => x.title.toLowerCase() === this.currentPath.toLowerCase()
    )?.id ?? 0;
  }

  onToggle() {
    this.isOpen = !this.isOpen;
  }
}
