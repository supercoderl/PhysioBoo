import { Component } from '@angular/core';
import { Bell, Cloud, LucideAngularModule, Sun } from 'lucide-angular';
import { ClockComponent } from "../../../clock/clock.component";
import { DividerComponent } from "../../../divider/divider.component";
import { SwitchComponent } from "../../../switch/switch.component";

@Component({
  selector: 'admin-cloud',
  standalone: true,
  imports: [DividerComponent, LucideAngularModule, SwitchComponent, ClockComponent],
  templateUrl: './cloud.component.html',
  styleUrl: './cloud.component.scss'
})
export class AdminCloudComponent {
  bell = Bell;
  cloud = Cloud;
  sun = Sun;
}
