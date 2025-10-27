import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { FullscreenService } from '../../../../services/common/fullscreen.service';
import { ThemeService } from '../../../../services/common/theme.service';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'admin-main-header',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.scss'
})
export class AdminMainHeaderComponent {


  isSearching: boolean = false;

  @ViewChild('closeBtn', { static: false }) closeBtn!: ElementRef<HTMLButtonElement>;

  constructor(
    protected fs: FullscreenService,
    protected themeSrv: ThemeService,
    private elementRef: ElementRef
  ) {}

  @Output() collapseEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() drawerEvent: EventEmitter<{ type: string | null; data: HTMLElement | null }> = new EventEmitter<{ type: string | null; data: HTMLElement | null }>();
  @Output() popoverEvent: EventEmitter<{ type: string | null; data: HTMLElement | null }> = new EventEmitter<{ type: string | null; data: HTMLElement | null }>();

  openPopover(event: MouseEvent, type: string) {
    this.popoverEvent.emit({
      type,
      data: event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    });
  }

  toggleSearch() {
    this.isSearching = !this.isSearching;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.isSearching && !this.elementRef.nativeElement.contains(target)) {
      if (this.closeBtn) {
        this.closeBtn.nativeElement.click();
      }
    }
  }
}
