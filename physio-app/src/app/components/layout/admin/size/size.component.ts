import { Component } from '@angular/core';
import { ALargeSmall } from 'lucide-angular';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'admin-size',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './size.component.html'
})
export class AdminSizeComponent {
  aLargeSmall = ALargeSmall;
}
