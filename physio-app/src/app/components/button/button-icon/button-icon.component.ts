import { Component, Input } from '@angular/core';
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: 'button-icon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <button
      class="border border-solid inlineFlex-center-center relative bg-transparent cursor-pointer align-middle text-center text-[22px] text-[#4B5563] w-8 h-8 max-h-8 outline-none p-2 rounded-[8px] transition-background duration-150 ease-in-out"
      tabindex="0"
      type="button"
    >
      <lucide-icon 
        [name]="icon.name" 
        [size]="icon.size || 16"
        [class]="icon.class"
      ></lucide-icon>
    </button>
  `
})
export class ButtonIconComponent {
  // #region Input, Output, Properties
  @Input() icon!: { name: string, size?: number, class?: string };
  // #endregion
}
