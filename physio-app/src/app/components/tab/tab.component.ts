import { Component, Input, signal, computed, ContentChildren, QueryList, AfterContentInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-tab',
    standalone: true,
    template: `<ng-template><ng-content></ng-content></ng-template>`
})
export class TabComponent {
    @Input({ required: true }) label!: string;
    @Input() id?: string;
    @ViewChild(TemplateRef, { static: true }) template!: TemplateRef<any>;
}

@Component({
    selector: 'app-tabs',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="w-full">
      <div class="flex gap-1 border-b border-gray-200 mb-4">
        @for (tab of tabComponents; track tab.label; let i = $index) {
          <button
            (click)="selectTab(i)"
            class="px-6 py-3 font-medium text-sm transition-colors duration-300 relative overflow-hidden"
            [class.text-blue-600]="activeIndex() === i"
            [class.text-gray-600]="activeIndex() !== i"
          >
            {{ tab.label }}
            @if (activeIndex() === i) {
              <div 
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                [class.animate-slide-left]="slideDirection() === 'left'"
                [class.animate-slide-right]="slideDirection() === 'right'"
              ></div>
            }
          </button>
        }
      </div>

      <div class="relative overflow-hidden px-0.5">
        @for (tab of tabComponents; track tab.label; let i = $index) {
          @if (activeIndex() === i) {
            <div
              [@fadeUpAnimation]
              class="py-4"
            >
              <ng-container *ngTemplateOutlet="tab.template"></ng-container>
            </div>
          }
        }
      </div>
    </div>

    <style>
      @keyframes slideFromLeft {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(0);
        }
      }

      @keyframes slideFromRight {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }

      .animate-slide-left {
        animation: slideFromLeft 0.3s ease-out;
      }

      .animate-slide-right {
        animation: slideFromRight 0.3s ease-out;
      }
    </style>
  `,
    animations: [
        trigger('fadeUpAnimation', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateY(20px)'
                }),
                animate('400ms ease-out', style({
                    opacity: 1,
                    transform: 'translateY(0)'
                }))
            ])
        ])
    ]
})
export class TabsComponent implements AfterContentInit {
    @ContentChildren(TabComponent, { read: TabComponent }) tabList!: QueryList<TabComponent>;

    tabComponents: Array<{ label: string; template: TemplateRef<any> }> = [];
    activeIndex = signal(0);
    previousIndex = signal(0);

    slideDirection = computed(() => {
        return this.activeIndex() > this.previousIndex() ? 'left' : 'right';
    });

    ngAfterContentInit() {
        this.tabComponents = this.tabList.map(tab => ({
            label: tab.label,
            template: tab.template
        }));
    }

    selectTab(index: number) {
        this.previousIndex.set(this.activeIndex());
        this.activeIndex.set(index);
    }

    get template() {
        return this.tabComponents[this.activeIndex()]?.template;
    }
}