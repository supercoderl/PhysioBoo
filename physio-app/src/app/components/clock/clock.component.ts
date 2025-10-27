import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';

@Component({
  selector: 'clock',
  standalone: true,
  imports: [],
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.scss'
})
export class ClockComponent implements AfterViewInit, OnDestroy {
  private intervalId: any;

  constructor(private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.rotateClock();
      this.intervalId = setInterval(() => this.rotateClock(), 50);
    });
  }

  private rotateClock(): void {
    if (typeof window !== 'undefined') {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const ms = now.getMilliseconds();

      const secondDeg = ((seconds + ms / 1000) / 60) * 360;
      const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
      const hourDeg = ((hours % 12 + minutes / 60) / 12) * 360;

      // Query selector thay vì ViewChild
      const hourHand = window.document.querySelector('.needle.hours') as HTMLElement;
      const minuteHand = window.document.querySelector('.needle.minute') as HTMLElement;
      const secondHand = window.document.querySelector('.needle.second') as HTMLElement;

      if (hourHand) hourHand.style.transform = `translate(-50%, -100%) rotate(${hourDeg}deg)`;
      if (minuteHand) minuteHand.style.transform = `translate(-50%, -100%) rotate(${minuteDeg}deg)`;
      if (secondHand) secondHand.style.transform = `translate(-50%, -100%) rotate(${secondDeg}deg)`;
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}