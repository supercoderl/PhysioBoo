import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, calendarOutline, documentTextOutline, personOutline } from 'ionicons/icons';

@Component({
    selector: 'app-patient-tabs',
    standalone: true,
    imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
    template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/patient/home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="appointments" href="/patient/appointments">
          <ion-icon name="calendar-outline"></ion-icon>
          <ion-label>Appointments</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="records" href="/patient/records">
          <ion-icon name="document-text-outline"></ion-icon>
          <ion-label>Records</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/patient/profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `
})
export class PatientTabsComponent {
    constructor() {
        addIcons({ homeOutline, calendarOutline, documentTextOutline, personOutline });
    }
}
