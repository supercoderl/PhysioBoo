import { Component } from '@angular/core';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { callOutline, mailOutline, locationOutline, timeOutline } from 'ionicons/icons';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon, IonItem, IonLabel, IonList],
    template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/more"></ion-back-button>
        </ion-buttons>
        <ion-title>Contact us</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h1>We're here to help</h1>
      <p>Reach out with questions about appointments, billing, or your account, and our support team will get back to you.</p>
      <ion-list inset="true">
        <ion-item lines="full">
          <ion-icon slot="start" name="call-outline" color="primary"></ion-icon>
          <ion-label>
            <p>Hotline</p>
            <h3>1900 1234</h3>
          </ion-label>
        </ion-item>
        <ion-item lines="full">
          <ion-icon slot="start" name="mail-outline" color="primary"></ion-icon>
          <ion-label>
            <p>Email</p>
            <h3>support&#64;physioboo.com</h3>
          </ion-label>
        </ion-item>
        <ion-item lines="full">
          <ion-icon slot="start" name="location-outline" color="primary"></ion-icon>
          <ion-label>
            <p>Head office</p>
            <h3>123 Nguyen Van Linh, District 7, Ho Chi Minh City</h3>
          </ion-label>
        </ion-item>
        <ion-item lines="none">
          <ion-icon slot="start" name="time-outline" color="primary"></ion-icon>
          <ion-label>
            <p>Support hours</p>
            <h3>Mon–Sat, 8:00–20:00</h3>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
    styles: [
        `
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; }
    p { font-size: 14px; line-height: 1.6; color: var(--ion-color-step-700, #666); margin: 0 0 16px; }
  `,
    ],
})
export class ContactPage {
    constructor() {
        addIcons({ callOutline, mailOutline, locationOutline, timeOutline });
    }
}
