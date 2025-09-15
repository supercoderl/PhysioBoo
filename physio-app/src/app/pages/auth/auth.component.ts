import { Component } from "@angular/core";
import { SharedModule } from "../../shared/shared-imports";

@Component({
    selector: 'app-auth',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <router-outlet></router-outlet>
    `
})

export class AuthComponent { }