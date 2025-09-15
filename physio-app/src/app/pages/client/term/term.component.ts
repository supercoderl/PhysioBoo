import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { BreadcrumbComponent } from "../../../components/breadcrumb/breadcrumb.component";

@Component({
    selector: 'app-term',
    standalone: true,
    imports: [
    SharedModule,
    BreadcrumbComponent
],
    template: `
        <breadcrumb title="Term & Condition"></breadcrumb>
        <div class="py-15">
            <div class="container mx-auto">
                <div class="flex">
                    <div class="px-3">
                        <div class="mb-4">
                            <h6 class="mb-4 text-lg font-semibold leading-[1.2] text-primary">Introduction</h6>
                            <p class="m-0 text-xs15 text-brandDark">
                                Welcome to Doccure, a platform that allows you to book appointments
                                with healthcare professionals. By using our services, you agree to
                                these Terms &amp; Conditions. Please read them carefully before
                                proceeding.
                            </p>
                        </div>
                        <div class="mb-4">
                            <h6 class="mb-4 text-lg font-semibold leading-[1.2] text-primary">Introduction</h6>
                            <ul class="p-0 m-0">
                                <li class="mb-2 relative pl-4.5 text-xs15">
                                    <div class="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-secondary"></div>
                                    You must be at least 18 years old to use this website or have
                                    parental/guardian consent.
                                </li>
                                <li class="mb-2 relative pl-4.5 text-xs15">
                                    <div class="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-secondary"></div>
                                    Ensure that all information provided is accurate and up-to-date.
                                </li>
                                <li class="mb-2 relative pl-4.5 text-xs15">
                                    <div class="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-secondary"></div>
                                    You are responsible for maintaining the confidentiality of your
                                    account and password.
                                </li>
                            </ul>
                        </div>
                        <div class="mb-4">
                            <h6 class="mb-4 text-lg font-semibold leading-[1.2] text-primary">Booking Appointments</h6>
                            <ul class="p-0 m-0">
                                <li class="mb-2 relative pl-4.5 text-xs15">
                                    <div class="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-secondary"></div>
                                    Appointments are booked in real-time, subject to availability.
                                </li>
                                <li class="mb-2 relative pl-4.5 text-xs15">
                                    <div class="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-secondary"></div>
                                    Users are responsible for attending the scheduled appointments or
                                    canceling in a timely manner.
                                </li>
                                <li class="mb-2 relative pl-4.5 text-xs15">
                                    <div class="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-secondary"></div>
                                    Cancellations should be made before the appointment to avoid any
                                    penalties.
                                </li>
                            </ul>
                        </div>
                        <div class="mb-4">
                            <h6 class="mb-4 text-lg font-semibold leading-[1.2] text-primary">Medical Disclaimer</h6>
                            <ul class="p-0 m-0">
                                <li class="mb-2 relative pl-4.5 text-xs15">
                                    <div class="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-secondary"></div>
                                    Doccure provides a platform for scheduling appointments and is not
                                    responsible for the medical services provided.
                                </li>
                                <li class="mb-2 relative pl-4.5 text-xs15">
                                    <div class="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-secondary"></div>
                                    Healthcare providers listed on the platform are independent
                                    practitioners, and [Website Name] does not guarantee the quality
                                    or accuracy of medical advice provided.
                                </li>
                            </ul>
                        </div>
                        <div class="mb-4">
                            <h6 class="mb-4 text-lg font-semibold leading-[1.2] text-primary">Payment &amp; Fees</h6>
                            <ul class="p-0 m-0">
                                <li class="mb-2 relative pl-4.5 text-xs15">
                                    <div class="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-secondary"></div>
                                    Payment for appointments may be made through [Payment Method] and
                                    is subject to [Insert Payment Terms].
                                </li>
                                <li class="mb-2 relative pl-4.5 text-xs15">
                                    <div class="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-secondary"></div>
                                    Any additional fees, such as cancellation or no-show fees, will be
                                    disclosed at the time of booking.
                                </li>
                            </ul>
                        </div>
                        <div class="mb-4">
                            <h6 class="mb-4 text-lg font-semibold leading-[1.2] text-primary">Changes to Privacy Policy</h6>
                            <p class="m-0 text-xs15 text-brandDark">
                                Doccure may update these Privacy Policy periodically. Any changes
                                will be communicated through the website or via email.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class TermComponent {}