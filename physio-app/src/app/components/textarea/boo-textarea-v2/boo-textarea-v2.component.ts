import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-textarea-v2',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <div class="w-full inline-flex flex-col relative min-w-0 p-0 m-0 border-0">
      <label
        *ngIf="label"
        class="z-[99] text-[#4B5563] relative p-0 text-[12px] font-medium leading-[2]"
        [for]="label.htmlFor || ''"
      >
        {{label.text}}
      </label>
      <div
        class="inline-flex flex-col relative min-w-0 p-0 m-0 border-0 w-full"
      >
        <div
          class="text-[13px] leading-[1.43] text-[#1F232B] inline-flex items-start w-full relative rounded-[8px] min-h-8 p-2 h-auto bg-white border border-solid border-[#0000003b]"
        >
          <ng-content select="[prefix]"></ng-content>
          <textarea
            id="name"
            class="block min-w-0 m-0 w-full"
            type="text"
            value="Brian Hughes"
            [rows]="4"
          ></textarea>
          <ng-content select="[endfix]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class BooTextareaV2Component {
  @Input() label?: { text: string, htmlFor?: string }
}
