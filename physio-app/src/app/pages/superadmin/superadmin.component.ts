import { Component } from "@angular/core";
import { SuperadminLayoutComponent } from "../../components/layout/superadmin/superadmin-layout.component";

@Component({
    selector: 'app-superadmin',
    standalone: true,
    imports: [SuperadminLayoutComponent],
    template: `<superadmin-layout />`
})
export class SuperadminComponent { }
