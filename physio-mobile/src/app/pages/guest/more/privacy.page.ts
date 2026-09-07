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
    selector: 'app-privacy',
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton],
    template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/more"></ion-back-button>
        </ion-buttons>
        <ion-title>Privacy policy</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h1>Privacy policy</h1>
      <p>Last updated: January 2026</p>
      <h2>1. Information we collect</h2>
      <p>We collect information you provide when registering (name, email, phone) and, once you're a patient, the medical records, appointments, and prescriptions your care team adds on your behalf.</p>
      <h2>2. How we use your information</h2>
      <p>Your information is used to provide the service — booking appointments, showing your records, and communicating with you about your care. We do not sell your personal data.</p>
      <h2>3. Data security</h2>
      <p>We use industry-standard safeguards, including encrypted connections and access controls, to protect your health information.</p>
      <h2>4. Your rights</h2>
      <p>You can request access to, correction of, or deletion of your personal data by contacting our support team.</p>
      <h2>5. Contact</h2>
      <p>Questions about this policy can be sent to privacy&#64;physioboo.com.</p>
    </ion-content>
  `,
    styles: [
        `
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
    h2 { font-size: 15px; font-weight: 700; margin: 18px 0 6px; }
    p { font-size: 14px; line-height: 1.6; color: var(--ion-color-step-700, #666); margin: 0 0 8px; }
  `,
    ],
})
export class PrivacyPage {}
