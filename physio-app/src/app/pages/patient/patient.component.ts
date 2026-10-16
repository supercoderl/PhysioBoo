import { Component } from "@angular/core";
import { PatientLayoutComponent } from "../../components/layout/patient/patient-layout.component";

@Component({
    selector: 'app-patient',
    standalone: true,
    imports: [PatientLayoutComponent],
    template: `<patient-layout />`
})
export class PatientComponent { }
