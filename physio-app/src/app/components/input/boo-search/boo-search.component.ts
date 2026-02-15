import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-search',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <div class="sm:w-64 w-full flex flex-col relative">
      <div
        aria-label="Search"
        class="text-[13px] leading-[1.4375em] text-[#1F232B] inline-flex items-center relative rounded-[8px] min-h-8 h-auto bg-surface border border-solid border-[#0000003b]"
      >
        <input
          aria-invalid="false"
          id="search"
          placeholder="Enter a keyword..."
          class="h-[1.4375em] m-0 block min-w-0 w-full py-1.5 px-3 outline-none"
          type="text"
          value=""
        />
      </div>
    </div>
  `
})
export class BooSearchComponent {

}
