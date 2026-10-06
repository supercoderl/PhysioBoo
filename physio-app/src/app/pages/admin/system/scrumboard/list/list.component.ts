import { Component, HostListener, OnInit, signal } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { ScrumboardService } from '../../../../../services/admin/scrumboard.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';
import { ScrumBoardSummary } from '../../../../../shared/types/scrumboard.types';

@Component({
  selector: 'app-scrumboard-list',
  standalone: true,
  imports: [
    AdminBreadcrumbComponent,
    SharedModule,
    BooIconComponent,
    EmptyStateComponent
  ],
  templateUrl: './list.component.html'
})
export class ListScrumboardComponent implements OnInit {
  boards = signal<ScrumBoardSummary[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  // New-board dialog; null while it is closed.
  draft = signal<{ title: string; description: string } | null>(null);

  constructor(private scrumSrv: ScrumboardService, private toastSrv: ToastService) { }

  ngOnInit(): void {
    this.loadBoards();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDialog();
  }

  loadBoards(): void {
    this.isLoading.set(true);
    this.scrumSrv.getBoards().subscribe({
      next: res => {
        if (res.success) this.boards.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openDialog(): void {
    this.draft.set({ title: '', description: '' });
  }

  closeDialog(): void {
    if (!this.isSaving()) this.draft.set(null);
  }

  canCreate(): boolean {
    return !!this.draft()?.title.trim() && !this.isSaving();
  }

  createBoard(): void {
    const draft = this.draft();
    if (!draft || !this.canCreate()) return;

    this.isSaving.set(true);
    this.scrumSrv.createBoard({ title: draft.title.trim(), description: draft.description.trim() || null }).subscribe({
      next: res => {
        this.isSaving.set(false);
        if (!res.success) return;

        this.toastSrv.success('Board created');
        this.draft.set(null);
        this.loadBoards();
      },
      error: () => this.isSaving.set(false)
    });
  }

  trackById(_: number, board: ScrumBoardSummary): string {
    return board.id;
  }
}
