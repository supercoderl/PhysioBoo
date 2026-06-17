import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-icon',
  standalone: true,
  imports: [SharedModule],
  styles: [`
    :host {
      display: inline-flex; 
      align-items: center;     
      justify-content: center;   
      line-height: 0;  
    }
  `],
  template: `
    <lucide-icon 
      [name]="name" 
      [size]="size"
      [color]="color"
      [strokeWidth]="strokeWidth"
      [ngClass]="iconClass"
    ></lucide-icon>
  `,
  host: {
    'class': 'align-middle transition-all duration-300 ease-in-out',
    '[class.hover:scale-110]': 'interactive',
    '[class.hover:opacity-80]': 'interactive',
    '[class.active:scale-95]': 'interactive',
    '[class.cursor-pointer]': 'interactive',
  }
})
export class BooIconComponent {
  // #region Inputs, Outputs, Properties
  @Input({ required: true }) name!: string;
  @Input() size: number = 16;
  @Input() strokeWidth: number = 2;
  @Input() color: string = "black";
  @Input() interactive: boolean = false;
  @Input() iconClass: string | string[] | Record<string, boolean> = '';
  // #endregion
}
