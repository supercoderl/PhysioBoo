import { Component } from '@angular/core';
import { BreadcrumbComponent } from "../../../components/breadcrumb/breadcrumb.component";
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { BooCheckboxComponent } from "../../../components/checkbox/boo-checkbox/boo-checkbox.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { BooTextareaComponent } from "../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    SharedModule,
    BreadcrumbComponent,
    BooInputComponent,
    BooTextareaComponent,
    BooCheckboxComponent,
    BooButtonComponent
],
  template: `
    <breadcrumb title="Contact Us"></breadcrumb>
    <div
      class="flex flex-col-reverse items-center md:flex-row-reverse"
    >
      <div
        class="bg-[#F3F5F8] flex gap-7.5 flex-col justify-center items-center md:flex-1 w-full"
      >
        <div
          class="w-full relative h-[400px] md:h-[870px]"
        >
          <div class="h-full">
            <google-map 
              [options]="mapOptions"
              [height]="'100%'"
              [width]="'100%'"
            />
          </div>
        </div>
      </div>
      <div
        class="p-2.5 flex items-end justify-center flex-col md:flex-1"
      >
        <div
          class="flex gap-7.5 flex-col justify-center items-center px-2.5 py-10 md:py-25 md:pr-25 md:pl-2.5 flex max-w-[605px]"
        >
          <div
            class="w-full relative"
          >
            <div class="m-0 h-full">
              <div>
                <div
                  class="relative text-left"
                >
                  <h6
                    class="text-[#0D59F2] text-[10px] uppercase bg-[#F0F5FF] py-1.75 px-2 inline-block"
                  >
                    Contact Us
                  </h6>
                  <h2 class="font-semibold mb-3 transition-all duration-300 text-[40px]">
                    We’re <span class="text-[#0D59F2]">here</span> for you
                  </h2>
                  <div class="max-w-[400px] inline-block w-full text-[16px] leading-[24px]">
                    <p class="mb-1.25">
                      Have a question or feedback? Fill out the form below, and
                      we'll get back to you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full">
            <div class="h-full">
              <div>
                <div>
                  <div>
                    <div class="screen-reader-response">
                      <p role="status" aria-live="polite" aria-atomic="true"></p>
                      <ul></ul>
                    </div>
                    <form>
                      <div class="flex gap-5">
                        <div class="w-full">
                          <boo-input
                            [id]="'full-name'"
                            [name]="'full-name'"
                            label="Full name"
                            [required]="true"
                          />
                        </div>
                      </div>
                      <div class="flex gap-5 my-5">
                        <div class="keydesign-label">
                          <boo-input
                            [id]="'phone-number'"
                            [name]="'phone-number'"
                            label="Phone number"
                            [required]="true"
                          />
                        </div>
                        <div class="keydesign-label">
                          <boo-input
                            [id]="'email'"
                            [name]="'email'"
                            label="Email address"
                            [required]="true"
                          />
                        </div>
                      </div>
                      <div class="keydesign-label">
                        <boo-textarea
                          [id]="'message'"
                          [name]="'message'"
                          label="Anything else you would like us to know?"
                          [required]="true"
                        />
                      </div>
                      <boo-checkbox>
                        I understand and agree to the
                        <a href="#" target="_blank" class="font-medium">privacy policy</a>.
                      </boo-checkbox>
                      <boo-button size="large">
                        Submit Request 
                      </boo-button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContactComponent {
  mapOptions: google.maps.MapOptions = {
    fullscreenControl: true,
    zoom: 4,
  }
}
