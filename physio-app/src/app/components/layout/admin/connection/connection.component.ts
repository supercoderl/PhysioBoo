import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'admin-connection',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './connection.component.html',
  styleUrl: './connection.component.css'
})
export class AdminConnectionComponent {
  users = new Array(20);
  isOpen: boolean = false;

  openDrawer() {
    this.isOpen = true;
  }

  closeDrawer() {
    this.isOpen = false;
  }
}
