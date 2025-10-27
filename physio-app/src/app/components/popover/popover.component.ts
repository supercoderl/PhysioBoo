import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared/shared-imports';

@Component({
  selector: 'popover',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './popover.component.html'
})
export class PopoverComponent implements OnChanges, OnInit {
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  @Input() isOpen: boolean = false;
  @Input() trigger: HTMLElement | null = null;

  popoverPosition: any = {};

  @ViewChild('popoverRef', { static: false }) popoverRef!: ElementRef;

  ngOnChanges() {
    if (this.isOpen && this.trigger) {
      setTimeout(() => this.updatePosition());
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        if (this.isOpen && this.trigger) {
          this.updatePosition();
        }
      });
    }
  }

  updatePosition() {
    if (this.trigger && this.popoverRef?.nativeElement) {
      const rect = this.trigger.getBoundingClientRect();
      const popoverEl = this.popoverRef.nativeElement;

      const popoverWidth = popoverEl.offsetWidth || 0;

      this.popoverPosition = {
        top: `${rect.bottom + 8}px`,
        left: `${rect.left + rect.width / 2 - popoverWidth / 2}px`
      };
    }
  }

  get popoverStyles() {
    return {
      ...(this.popoverPosition || {}),
      'transition-property': 'opacity, transform',
      'transition-duration': '252ms, 168ms',
      'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
    };
  }
}
