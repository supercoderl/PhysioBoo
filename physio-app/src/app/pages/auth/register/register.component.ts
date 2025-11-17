import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { RegisterProgressBarComponent } from "./progress-bar.component";
import { RegisterStepOneComponent } from "./step1.component";
import { RegisterStepTwoComponent } from "./step2.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    SharedModule,
    RegisterProgressBarComponent,
    RegisterStepTwoComponent,
    RegisterStepOneComponent
],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  // #region Inputs, Outputs, Properties
  stepCount: number = 3;
  currentStep: number = 1;
  // #endregion

  // #region Events
  nextStep() {
    if (this.currentStep < this.stepCount) {
      this.currentStep++;
    }
  }
  
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  // #endregion
}
