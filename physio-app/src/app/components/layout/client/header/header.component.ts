import { Component, HostListener, Input } from '@angular/core';
import { MessageSquareText, LucideAngularModule, Phone, Sun, Facebook, Instagram, Linkedin, Twitter, LockKeyhole, UserRoundX, Search } from 'lucide-angular';
import { SharedModule } from '../../../../shared/shared-imports';
import { HEADERS } from '../../../../shared/data/dummy';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'layout-header',
  standalone: true,
  imports: [
    LucideAngularModule,
    SharedModule,
    RouterLink
],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  readonly MessageSquareText = MessageSquareText;
  readonly Phone = Phone;
  readonly Sun = Sun;
  readonly Facebook = Facebook;
  readonly Twitter = Twitter;
  readonly Instagram = Instagram;
  readonly LinkedIn = Linkedin;
  readonly LockKeyhole = LockKeyhole;
  readonly UserRoundX = UserRoundX;
  readonly Search = Search;
  isSticky = false;

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
}
