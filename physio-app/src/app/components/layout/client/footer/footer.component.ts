import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared-imports';
import { FOOTER_MENUS } from '../../../../shared/data/dummy';

@Component({
  selector: 'layout-footer',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './footer.component.html',
  styles: `
    button {
      background: linear-gradient(90.08deg,#E11D48 .09%,#06aed4 70.28%);
    }
  `
})
export class FooterComponent {

  readonly menus = FOOTER_MENUS;
}
