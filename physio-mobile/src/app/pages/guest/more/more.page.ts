import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonListHeader,
    IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    informationCircleOutline,
    callOutline,
    documentTextOutline,
    shieldCheckmarkOutline,
    logInOutline,
    personAddOutline,
    logOutOutline,
    homeOutline,
    chevronForwardOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/common/toast.service';

@Component({
    selector: 'app-more',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonList,
        IonItem,
        IonLabel,
        IonIcon,
        IonListHeader,
        IonButton,
    ],
    templateUrl: './more.page.html',
    styleUrl: './more.page.scss',
})
export class MorePage implements OnInit {
    private authSrv = inject(AuthService);
    private router = inject(Router);
    private toastSrv = inject(ToastService);

    isAuthenticated$: Observable<boolean> = this.authSrv.isAuthenticated$;

    constructor() {
        addIcons({
            informationCircleOutline,
            callOutline,
            documentTextOutline,
            shieldCheckmarkOutline,
            logInOutline,
            personAddOutline,
            logOutOutline,
            homeOutline,
            chevronForwardOutline,
        });
    }

    ngOnInit(): void {
        this.authSrv.checkSession();
    }

    logout(): void {
        this.authSrv.logout().subscribe({
            next: () => {
                this.toastSrv.success('Logged out successfully.');
                this.router.navigateByUrl('/');
            },
            error: () => {
                this.router.navigateByUrl('/');
            },
        });
    }
}
