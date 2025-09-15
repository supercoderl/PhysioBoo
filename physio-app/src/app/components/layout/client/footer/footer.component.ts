import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared-imports';
import { Facebook, Instagram, Linkedin, Send, Twitter } from 'lucide-angular';
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
      background: linear-gradient(90.08deg,#0e82fd .09%,#06aed4 70.28%);
    }
  `
})
export class FooterComponent {
  readonly Send = Send;
  readonly Facebook = Facebook;
  readonly Twitter = Twitter;
  readonly Instagram = Instagram;
  readonly Linkedin = Linkedin;

  readonly menus = FOOTER_MENUS;
}
