import { Component } from '@angular/core';
import { ButtonIconComponent } from "../../../../components/button/button-icon/button-icon.component";
import { ProfileTimelineComponent } from "./timeline.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ProfileTimelineComponent, ButtonIconComponent],
  template: `
    <div class="z-10 flex h-full flex-auto flex-col">
      <div class="flex flex-1 z-[2] min-w-0 h-full bg-[#F6F7F8]">
        <div class="flex flex-col w-full overflow-hidden z-[9999]">
          <div class="bg-white border-b border-solid border-[#E5E7EB] flex flex-0 bg-cover">
            <div class="container">
              <div class="flex w-full flex-col">
                <img
                  class="h-40 w-full object-cover lg:h-80"
                  alt="Profile Cover"
                  src="https://fuse-react-vitejs-demo.fusetheme.com/assets/images/pages/profile/cover.jpg"
                />
                <div
                  class="mx-auto flex w-full max-w-7xl shrink-0 flex-col items-center px-8 lg:h-18 lg:flex-row"
                >
                  <div class="-mt-24 rounded-full lg:-mt-22">
                    <div style="transform: none">
                      <div
                        class="border-4 border-solid w-32 h-32 relative flex-center-center leading-none rounded-full overflow-hidden text-[13px] border-white"
                      >
                        <img
                          alt="User avatar"
                          class="w-full h-full text-center object-cover"
                          src="https://fuse-react-vitejs-demo.fusetheme.com/assets/images/avatars/male-04.jpg"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    class="mt-4 flex flex-col items-center lg:mt-0 lg:ml-8 lg:items-start"
                  >
                    <p
                      class="font-bold leading-none text-[14px] m-0"
                    >
                      Brian Hughes
                    </p>
                    <p
                      class="m-0 text-[13px] leading-[1.5] text-[#4B5563]"
                    >
                      London, UK
                    </p>
                  </div>
                  <div class="mx-8 hidden h-8 border-l-2 lg:flex"></div>
                  <div class="mt-3 flex items-center gap-6 lg:mt-0">
                    <div class="flex flex-col items-center">
                      <p
                        class="font-bold m-0 leading-[1.5] text-[13px]"
                      >
                        200k
                      </p>
                      <p
                        class="font-medium m-0 text-[11px] text-[#4B5563]"
                      >
                        FOLLOWERS
                      </p>
                    </div>
                    <div class="flex flex-col items-center">
                      <p
                        class="font-bold m-0 leading-[1.5] text-[13px]"
                      >
                        1.2k
                      </p>
                      <p
                        class="font-medium m-0 text-[11px] text-[#4B5563]"
                      >
                        FOLLOWING
                      </p>
                    </div>
                  </div>
                  <div class="my-4 flex flex-1 justify-end lg:my-0">
                    <div class="overflow-hidden flex p-1 rounded-[8px] bg-[#0000000f] w-fit">
                      <div
                        class="overflow-hidden mb-0 relative inline-block flex-1 whitespace-nowrap w-full"
                      >
                        <div
                          role="tablist"
                          class="flex"
                        >
                          <button-icon
                            class="z-[1]"
                            buttonClass="text-[13px] !border-0"
                          >
                            Timeline
                          </button-icon>
                          <button-icon
                            class="z-[1]"
                            buttonClass="text-[13px] !border-0"
                          >
                            About
                          </button-icon>
                          <button-icon
                            class="z-[1]"
                            buttonClass="text-[13px] !border-0"
                          >
                            Photos &amp; Videos
                          </button-icon>
                        </div>
                        <span
                          class="absolute h-0.5 min-h-full bottom-0 top-0 bg-white rounded-[6px] border border-solid border-[#E5E7EB] z-0"
                          style="left: 0px; width: 76.2625px"
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="up_content" class="flex flex-col flex-1 min-h-0">
            <div class="container">
                <div class="mx-auto flex w-full max-w-7xl flex-auto justify-center p-4 sm:p-8">
                    <div class="w-full">
                        <profile-timeline></profile-timeline>
                    </div>
                </div>
            </div>
          </div>
      </div>
    </div>
  `
})
export class ProfileComponent {

}
