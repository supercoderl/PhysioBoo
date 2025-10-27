import { Component } from '@angular/core';
import { MessageSquareText, X } from 'lucide-angular';
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
  messageSquareText = MessageSquareText;
  x = X;
  users = new Array(20);
  isOpen: boolean = false;

  openDrawer() {
    this.isOpen = true;
  }

  closeDrawer() {
    this.isOpen = false;
  }
}
