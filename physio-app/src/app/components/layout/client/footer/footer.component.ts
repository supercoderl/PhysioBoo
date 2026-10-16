import { Component } from '@angular/core';
import { CLIENT_FOOTER_COLS, CLIENT_TENANT } from '../../../../shared/data/client-site';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'layout-footer',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  readonly cols = CLIENT_FOOTER_COLS;
  readonly tenant = CLIENT_TENANT;
  readonly year = new Date().getFullYear();
}
