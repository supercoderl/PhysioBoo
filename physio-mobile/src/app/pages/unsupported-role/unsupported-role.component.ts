import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { desktopOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    selector: 'app-unsupported-role',
    standalone: true,
    imports: [IonContent, IonButton, IonIcon, IonText],
    template: `
    <ion-content class="ion-padding ion-text-center">
      <div class="unsupported">
        <ion-icon name="desktop-outline" class="unsupported__icon"></ion-icon>
        <h2>This account isn't supported on mobile yet</h2>
        <ion-text color="medium">
          <p>Staff, Manager, and Super Admin experiences are coming to the HIS Mobile App in a future update. Please continue using the desktop HIS application for now.</p>
        </ion-text>
        <ion-button expand="block" (click)="logout()">Log out</ion-button>
        <ion-button expand="block" fill="outline" (click)="goHome()">Continue as guest</ion-button>
      </div>
    </ion-content>
  `,
    styles: [`
    .unsupported { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; gap: 12px; }
    .unsupported__icon { font-size: 64px; color: var(--ion-color-medium); }
  `]
})
export class UnsupportedRoleComponent {
    private authSrv = inject(AuthService);
    private router = inject(Router);

    constructor() {
        addIcons({ desktopOutline });
    }

    logout() {
        // Navigate away regardless of whether the API call succeeds — the local session is cleared
        // either way, so a failed/slow logout request must never leave the user stuck on this screen
        // with no working button (the auth interceptor doesn't attach error handling to this call,
        // so an unhandled request error here previously did nothing visible at all).
        this.authSrv.logout().subscribe({
            next: () => this.router.navigateByUrl('/'),
            error: () => {
                this.authSrv.clearSession();
                this.router.navigateByUrl('/');
            }
        });
    }

    /** Always-available escape hatch that makes no API call, so it can never get stuck. */
    goHome() {
        this.router.navigateByUrl('/');
    }
}
