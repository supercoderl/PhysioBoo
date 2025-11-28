import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';
import { interval, Subscription } from 'rxjs';
import { DotSpinnerComponent } from "../../../components/icon/boo-icon/dot-spinner.component";
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'app-verification-status',
  standalone: true,
  imports: [
    SharedModule,
    DotSpinnerComponent
],
  templateUrl: './verification-status.component.html'
})
export class VerificationStatusComponent implements OnInit, OnDestroy, AfterViewInit {
  // #region Inputs, Outputs, Properties
  counter: number = 5;
  showSpinner: boolean = false;
  status: string | null = null;
  message: string = '';
  options: AnimationOptions = {
    path: '/assets/animations/happy.json'
  };
  private countdownSub?: Subscription;
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.status = this.route.snapshot.queryParamMap.get('result');
    this.updateMessage(this.status ?? 'fail');
    if (this.status === 'success') {
      this.startCountdown();
      this.options = {
        ...this.options,
        path: '/assets/animations/happy.json'
      }
    } else {
      this.options = {
        ...this.options,
        path: '/assets/animations/sad.json'
      }
    }
  }

  ngOnDestroy() {
    this.countdownSub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {}, 0);
  }
  // #endregion

  // #region Events
  updateMessage(status: string) {
    if (status === "fail") {
      this.message = "fail";
    } else {
      this.message = "success";
    }
  }

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }

  startCountdown() {
    this.countdownSub = interval(1000).subscribe(() => {
      this.counter--;

      if (this.status === "success") {
        this.updateMessage('success');
      }

      if (this.counter <= 0) {
        this.countdownSub?.unsubscribe();
        this.showSpinner = true;

        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 1500);
      }
    });
  }
  // #endregion
}
