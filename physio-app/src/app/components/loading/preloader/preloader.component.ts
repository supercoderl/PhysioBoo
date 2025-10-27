import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'preloader',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './preloader.component.html'
})
export class PreloaderComponent {
  @Input() isLoading: boolean | null = true;
}
