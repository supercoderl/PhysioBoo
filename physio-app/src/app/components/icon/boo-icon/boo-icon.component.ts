import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-icon',
  standalone: true,
  imports: [SharedModule],
  template: `
    <lucide-icon 
      [name]="name" 
      [class]="['inlineFlex-center-center mx-1', classname].join(' ')"
      [size]="size"
    ></lucide-icon>
  `
})
export class BooIconComponent {
  @Input() name!: string;
  @Input() classname?: string;
  @Input() size: number = 16;
}
