import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared/shared-imports';

/** Keeps the popover this far from the viewport edges. */
const VIEWPORT_MARGIN = 8;

@Component({
  selector: 'popover',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './popover.component.html'
})
export class PopoverComponent implements OnChanges {
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  @Input() isOpen: boolean = false;
  @Input() trigger: HTMLElement | null = null;

  popoverPosition: any = {};
  /** The element that opened the popover, so focus can return to it on close. */
  private lastTrigger: HTMLElement | null = null;

  @ViewChild('popoverRef', { static: false }) popoverRef!: ElementRef;

  ngOnChanges(changes: SimpleChanges) {
    if (this.isOpen && this.trigger) {
      this.lastTrigger = this.trigger;
      setTimeout(() => {
        this.updatePosition();
        this.popoverRef?.nativeElement.focus({ preventScroll: true });
      });
    } else if (changes['isOpen'] && !this.isOpen && this.lastTrigger) {
      const trigger = this.lastTrigger;
      this.lastTrigger = null;
      if (trigger.isConnected) trigger.focus();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isOpen && this.trigger) {
      this.updatePosition();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) this.onClose.emit();
  }

  updatePosition() {
    if (this.trigger && this.popoverRef?.nativeElement) {
      const rect = this.trigger.getBoundingClientRect();
      const popoverEl = this.popoverRef.nativeElement;

      const popoverWidth = popoverEl.offsetWidth || 0;
      const centered = rect.left + rect.width / 2 - popoverWidth / 2;
      const maxLeft = window.innerWidth - popoverWidth - VIEWPORT_MARGIN;

      this.popoverPosition = {
        top: `${rect.bottom + 8}px`,
        left: `${Math.max(VIEWPORT_MARGIN, Math.min(centered, maxLeft))}px`
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
