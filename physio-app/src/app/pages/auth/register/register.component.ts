import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { RegisterProgressBarComponent } from "./progress-bar.component";
import { RegisterStepOneComponent } from "./step1.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    SharedModule,
    RegisterStepOneComponent,
    RegisterProgressBarComponent
],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  // #region Inputs, Outputs, Properties
  stepCount: number = 3;
  currentStep: number = 1;
  // #endregion
}
