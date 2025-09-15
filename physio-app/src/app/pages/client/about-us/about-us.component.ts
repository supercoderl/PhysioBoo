import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { BreadcrumbComponent } from "../../../components/breadcrumb/breadcrumb.component";
import { AboutAboutUsComponent } from "./about.component";
import { WhyChooseAboutUsComponent } from "./why-choose.component";
import { WayAboutUsComponent } from "./way.component";
import { DoctorAboutUsComponent } from "./doctor.component";
import { TestimonialAboutUsComponent } from "./testimonial.component";
import { FaqAboutUsComponent } from "./faq.component";

@Component({
    selector: 'app-about-us',
    standalone: true,
    imports: [
    SharedModule,
    BreadcrumbComponent,
    AboutAboutUsComponent,
    WhyChooseAboutUsComponent,
    WayAboutUsComponent,
    DoctorAboutUsComponent,
    TestimonialAboutUsComponent,
    FaqAboutUsComponent
],
    template: `
        <breadcrumb title="About Us"></breadcrumb>
        <about-about-us></about-about-us>
        <why-choose-about-us></why-choose-about-us>
        <way-about-us></way-about-us>
        <doctor-about-us></doctor-about-us>
        <testimonial-about-us></testimonial-about-us>
        <faq-about-us></faq-about-us>
    `
})

export class AboutUsComponent {}