import { Directive, HostBinding, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AVATAR } from '../data/dummy';

@Directive({
  selector: 'img[appSrc]',
  standalone: true
})
export class ImageFallbackDirective implements OnChanges {
  @Input() appSrc: string | null | undefined = '';
  @HostBinding('src') imageSrc: string = '';

  private readonly defaultAvatar = AVATAR || 'assets/images/default/avatar.png';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appSrc']) {
      if (!this.appSrc) {
        this.imageSrc = this.defaultAvatar;
      } else {
        this.imageSrc = this.appSrc;
      }
    }
  }

  @HostListener('error')
  onError() {
    if (this.imageSrc !== this.defaultAvatar) {
      this.imageSrc = this.defaultAvatar;
    }
  }
}