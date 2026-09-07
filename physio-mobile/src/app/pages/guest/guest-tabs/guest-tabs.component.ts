import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, medicalOutline, businessOutline, newspaperOutline, ellipsisHorizontalOutline } from 'ionicons/icons';

@Component({
    selector: 'app-guest-tabs',
    standalone: true,
    imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
    template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="doctors" href="/doctors">
          <ion-icon name="medical-outline"></ion-icon>
          <ion-label>Doctors</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="hospitals" href="/hospitals">
          <ion-icon name="business-outline"></ion-icon>
          <ion-label>Hospitals</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="news" href="/news">
          <ion-icon name="newspaper-outline"></ion-icon>
          <ion-label>News</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="more" href="/more">
          <ion-icon name="ellipsis-horizontal-outline"></ion-icon>
          <ion-label>More</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `
})
export class GuestTabsComponent {
    constructor() {
        addIcons({ homeOutline, medicalOutline, businessOutline, newspaperOutline, ellipsisHorizontalOutline });
    }
}
