import { AfterViewInit, Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { BannerHomeComponent } from "./banner.component";
import { ListHomeComponent } from "./list.component";
import { SpecialityHomeComponent } from "./speciality.component";
import { DoctorHomeComponent } from "./doctor.component";
import { ServicesHomeComponent } from "./services.component";
import { ReasonHomeComponent } from "./reason.component";
import { TestimonialHomeComponent } from "./testimonial.component";
import { CompanyHomeComponent } from "./company.component";
import { FaqHomeComponent } from "./faq.component";
import { MobileAppHomeComponent } from './mobile-app.component';
import { BlogHomeComponent } from './blog.component';
import { InfoHomeComponent } from "./info.component";
import { AOSService } from '../../../services/aos/aos.service';

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
export class HomeComponent implements AfterViewInit {
  constructor(private aosService: AOSService) { }

  ngAfterViewInit(): void {
    // Ensure AOS is initialized for this component
    this.aosService.initialize().then(() => {
      // Small delay to ensure DOM is stable
      setTimeout(() => this.aosService.refresh(), 50);
    });
  }
}
