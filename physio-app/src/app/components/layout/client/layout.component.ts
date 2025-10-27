import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <div class="layout">
      <layout-header [currentPath]="currentPath"></layout-header>

      <div class="layout__body">
        <main class="layout__content">
          <ng-content></ng-content>
        </main>
      </div>

      <layout-footer *ngIf="hasFooter"></layout-footer>
    </div>
  `,
})
export class LayoutComponent {
  @Input() hasFooter: boolean = false;
  @Input() currentPath: string = "";
}
