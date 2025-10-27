import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { BannerHomeComponent } from "./banner.component";
import { BlogHomeComponent } from './blog.component';
import { CompanyHomeComponent } from "./company.component";
import { DoctorHomeComponent } from "./doctor.component";
import { FaqHomeComponent } from "./faq.component";
import { InfoHomeComponent } from "./info.component";
import { ListHomeComponent } from "./list.component";
import { MobileAppHomeComponent } from './mobile-app.component';
import { ReasonHomeComponent } from "./reason.component";
import { ServicesHomeComponent } from "./services.component";
import { SpecialityHomeComponent } from "./speciality.component";
import { TestimonialHomeComponent } from "./testimonial.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SharedModule,
    BannerHomeComponent,
    ListHomeComponent,
    SpecialityHomeComponent,
    DoctorHomeComponent,
    ServicesHomeComponent,
    ReasonHomeComponent,
    TestimonialHomeComponent,
    CompanyHomeComponent,
    FaqHomeComponent,
    MobileAppHomeComponent,
    BlogHomeComponent,
    InfoHomeComponent
  ],
  template: `
    <banner-home></banner-home>
    <list-home></list-home>
    <speciality-home></speciality-home>
    <doctor-home></doctor-home>
    <services-home></services-home>
    <reason-home></reason-home>
    <div>
      <testimonial-home></testimonial-home>
      <company-home></company-home>
    </div>
    <faq-home></faq-home>
    <mobile-app-home></mobile-app-home>
    <div>
      <blog-home></blog-home>
      <info-home></info-home>
    </div>
  `,
})
export class HomeComponent {
  constructor() { }
}
