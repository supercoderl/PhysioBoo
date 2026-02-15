import { Directive, HostBinding, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AVATAR, DEFAULT_IMAGE } from '../data/dummy';

@Directive({
  selector: 'img[appSrc]',
  standalone: true
})
export class ImageFallbackDirective implements OnChanges {
  @Input() appSrc: string | null | undefined = '';
  @HostBinding('src') imageSrc: string = '';

  private readonly defaultImage = DEFAULT_IMAGE || 'assets/images/default/default.png';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appSrc']) {
      if (!this.appSrc) {
        this.imageSrc = this.defaultImage;
      } else {
        this.imageSrc = this.appSrc;
      }
    }
  }

  @HostListener('error')
  onError() {
    if (this.imageSrc !== this.defaultImage) {
      this.imageSrc = this.defaultImage;
    }
  }
}