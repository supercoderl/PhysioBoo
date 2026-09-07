import { Component } from '@angular/core';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
} from '@ionic/angular/standalone';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton],
    template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/more"></ion-back-button>
        </ion-buttons>
        <ion-title>About us</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h1>About PhysioBoo</h1>
      <p>
        PhysioBoo is a Hospital Information System dedicated to making quality healthcare easier to
        reach. We connect patients with trusted doctors and hospitals, streamline appointment booking,
        and give clinical teams the tools they need to deliver coordinated, patient-centered care.
      </p>
      <h2>Our mission</h2>
      <p>
        We believe healthcare should be simple, transparent, and accessible from anywhere. Our platform
        brings together scheduling, medical records, and communication between patients and providers
        into one connected experience.
      </p>
      <h2>Why choose PhysioBoo</h2>
      <ul>
        <li>A verified network of doctors and hospitals across multiple specialties.</li>
        <li>Appointment booking that fits your schedule, from your phone.</li>
        <li>Your medical history and prescriptions, organized and always within reach.</li>
        <li>A dedicated support team ready to help whenever you need it.</li>
      </ul>
    </ion-content>
  `,
    styles: [
        `
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; }
    h2 { font-size: 16px; font-weight: 700; margin: 20px 0 8px; }
    p, li { font-size: 14px; line-height: 1.6; color: var(--ion-color-step-700, #666); }
    ul { padding-left: 18px; margin: 0; }
  `,
    ],
})
export class AboutPage {}
