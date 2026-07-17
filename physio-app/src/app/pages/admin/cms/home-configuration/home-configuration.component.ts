import { Component } from "@angular/core";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { HomeConfigBannerSectionComponent } from "./sections/banner-section.component";
import { HomeConfigFeatureSectionComponent } from "./sections/feature-section.component";
import { HomeConfigSettingsSectionComponent } from "./sections/settings-section.component";
import { HomeConfigTestimonialSectionComponent } from "./sections/testimonial-section.component";

type HomeConfigTab = 'banners' | 'features' | 'testimonials' | 'settings';

@Component({
    selector: 'admin-home-configuration',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        HomeConfigBannerSectionComponent,
        HomeConfigFeatureSectionComponent,
        HomeConfigTestimonialSectionComponent,
        HomeConfigSettingsSectionComponent
    ],
    template: `
    <admin-content-header>
      <div class="flex items-center md:flex-column gap-2 pb-3 mb-2 border-1 border-bottom">
        <div class="flex-1">
          <h4 class="text-[22px] text-primary font-semibold mb-0">Home Page Configuration</h4>
          <p class="text-sm text-secondary mb-0">Manage banners, features, testimonials, and general settings displayed on the home page</p>
        </div>
      </div>

      <div class="bg-surface rounded-[6px] border border-gray-200 mb-4" role="tablist">
        <nav class="flex -mb-px px-2">
          <button
            *ngFor="let tab of tabs"
            role="tab"
            type="button"
            [attr.aria-selected]="activeTab === tab.id"
            (click)="activeTab = tab.id"
            [ngClass]="activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="px-5 py-3 border-b-2 font-medium text-sm transition-colors cursor-pointer"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <div class="flex-1 min-h-0">
        <home-config-banner-section *ngIf="activeTab === 'banners'" />
        <home-config-feature-section *ngIf="activeTab === 'features'" />
        <home-config-testimonial-section *ngIf="activeTab === 'testimonials'" />
        <home-config-settings-section *ngIf="activeTab === 'settings'" />
      </div>
    </admin-content-header>
    `,
    host: { class: 'block h-full min-h-0' }
})
export class AdminHomeConfigurationComponent {
    // #region Inputs, Outputs, Properties
    activeTab: HomeConfigTab = 'banners';

    tabs: { id: HomeConfigTab; name: string }[] = [
        { id: 'banners', name: 'Hero Banners' },
        { id: 'features', name: 'Features' },
        { id: 'testimonials', name: 'Testimonials' },
        { id: 'settings', name: 'General Settings' }
    ];
    // #endregion
}
