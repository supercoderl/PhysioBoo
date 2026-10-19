import { Component, ElementRef, HostListener, Input, inject } from '@angular/core';
import { CLIENT_NAV, CLIENT_TENANT, ClientNavItem } from '../../../../shared/data/client-site';
import { AuthService } from '../../../../services/auth/auth.service';
import { SharedModule } from '../../../../shared/shared-imports';
import { BooButtonComponent } from '../../../button/boo-button/boo-button.component';

@Component({
  selector: 'layout-header',
  standalone: true,
  imports: [
    SharedModule,
    BooButtonComponent
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  @Input() currentPath: string = "";

  isOpen = false;
  langOpen = false;

  readonly nav = CLIENT_NAV;
  readonly tenant = CLIENT_TENANT;
  readonly isAuthenticated = inject(AuthService).isAuthenticated;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  isActive(item: ClientNavItem): boolean {
    return !!item.key && item.key === (this.currentPath || 'home').toLowerCase();
  }

  onToggle() {
    this.isOpen = !this.isOpen;
    this.langOpen = false;
  }

  closeMenu() {
    this.isOpen = false;
  }

  toggleLang() {
    this.langOpen = !this.langOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menu = this.host.nativeElement.querySelector('[data-lang-menu]');
    if (this.langOpen && menu && !menu.contains(event.target as Node)) {
      this.langOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.langOpen = false;
    this.isOpen = false;
  }
}
