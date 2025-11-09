import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-icon',
  standalone: true,
  imports: [SharedModule],
  template: `
    <lucide-icon 
      [name]="name" 
      [class]="['inlineFlex-center-center mx-1 transition-all duration-300 ease-in-out hover:scale-110 hover:opacity-80 active:scale-95', classname].join(' ')"
      [size]="size"
      (click)="onClick($event)"
    ></lucide-icon>
  `
})
export class BooIconComponent {
  @Input() name!: string;
  @Input() classname?: string;
  @Input() size: number = 16;
  @Input() onClick: (e?: Event) => void = () => {};
}
