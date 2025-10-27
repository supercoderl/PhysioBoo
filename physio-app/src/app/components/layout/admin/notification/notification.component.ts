import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'admin-notification',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class AdminNotificationComponent {

}
