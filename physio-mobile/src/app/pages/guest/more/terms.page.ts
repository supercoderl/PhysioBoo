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
    selector: 'app-terms',
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton],
    template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/more"></ion-back-button>
        </ion-buttons>
        <ion-title>Terms of service</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h1>Terms of service</h1>
      <p>Last updated: January 2026</p>
      <h2>1. Acceptance of terms</h2>
      <p>By creating an account or using the PhysioBoo mobile app, you agree to be bound by these terms and our Privacy Policy.</p>
      <h2>2. Using the platform</h2>
      <p>PhysioBoo lets you browse doctors and hospitals, book appointments, and manage your own health records. You agree to provide accurate information and to use the app only for lawful purposes.</p>
      <h2>3. Medical disclaimer</h2>
      <p>Information shown in the app (doctor profiles, articles, hospital details) is for general information only and does not replace professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.</p>
      <h2>4. Account responsibility</h2>
      <p>You are responsible for keeping your login credentials secure and for all activity under your account.</p>
      <h2>5. Changes to these terms</h2>
      <p>We may update these terms from time to time. Continued use of the app after changes take effect constitutes acceptance of the revised terms.</p>
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
export class TermsPage {}
