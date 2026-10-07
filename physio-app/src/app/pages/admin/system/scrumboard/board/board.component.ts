import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { ScrumboardService } from '../../../../../services/admin/scrumboard.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';
import { ScrumBoard, ScrumCard, ScrumList } from '../../../../../shared/types/scrumboard.types';

/** Editable copy of a card: the card on the board changes only after Save succeeds. */
interface CardDraft {
  id: string;
  title: string;
  description: string;
  dueDate: string;
}

@Component({
  selector: 'app-scrumboard-board',
  standalone: true,
  imports: [
    AdminBreadcrumbComponent,
    SharedModule,
    BooIconComponent,
    EmptyStateComponent
  ],
  templateUrl: './board.component.html'
})
export class BoardScrumboardComponent implements OnInit {
  board = signal<ScrumBoard | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);

  // Board header editing
  isEditingBoard = false;
  boardTitle = '';
  boardDescription = '';

  // Inline inputs
  newListTitle = '';
  addingCardListId: string | null = null;
  newCardTitle = '';
  renamingListId: string | null = null;
  renamingTitle = '';

  cardDraft = signal<CardDraft | null>(null);

  private boardId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scrumSrv: ScrumboardService,
    private toastSrv: ToastService,
    private dialogSrv: DialogService
  ) { }

  // #region Lifecycle
  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadBoard();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.cardDraft()) this.closeCard();
    else this.cancelInline();
  }

  loadBoard(): void {
    this.scrumSrv.getBoard(this.boardId).subscribe({
      next: res => {
        this.board.set(res.success ? res.data : null);
        this.isLoading.set(false);
      },
      error: () => {
        this.board.set(null);
        this.isLoading.set(false);
      }
    });
  }

  /** Ids of every column, so a card can be dropped into any of them. */
  connectedLists(): string[] {
    return this.board()?.lists.map(l => l.id) ?? [];
  }
  // #endregion

  // #region Board
  startEditBoard(): void {
    const board = this.board();
    if (!board) return;

    this.boardTitle = board.title;
    this.boardDescription = board.description ?? '';
    this.isEditingBoard = true;
  }

  saveBoard(): void {
    const board = this.board();
    const title = this.boardTitle.trim();
    if (!board || !title) return;

    const description = this.boardDescription.trim() || null;
    this.scrumSrv.updateBoard(board.id, { title, description }).subscribe(res => {
      if (!res.success) return;

      this.board.set({ ...board, title, description });
      this.isEditingBoard = false;
      this.toastSrv.success('Board updated');
    });
  }

  deleteBoard(): void {
    const board = this.board();
    if (!board) return;

    this.dialogSrv.confirmDelete(() => {
      this.scrumSrv.deleteBoard(board.id).subscribe(res => {
        if (!res.success) return;

        this.toastSrv.success('Board deleted');
        this.router.navigate(['/admin/system/scrumboard/list']);
      });
    }, `the board "${board.title}"`);
  }
  // #endregion

  // #region Lists
  addList(): void {
    const board = this.board();
    const title = this.newListTitle.trim();
    if (!board || !title) return;

    this.scrumSrv.createList(board.id, title).subscribe(res => {
      if (!res.success) return;

      board.lists.push({ ...res.data, cards: [] });
      this.board.set({ ...board });
      this.newListTitle = '';
    });
  }

  startRename(list: ScrumList): void {
    this.renamingListId = list.id;
    this.renamingTitle = list.title;
  }

  saveRename(list: ScrumList): void {
    const title = this.renamingTitle.trim();
    this.renamingListId = null;
    if (!title || title === list.title) return;

    this.scrumSrv.renameList(list.id, title).subscribe(res => {
      if (res.success) list.title = title;
    });
  }

  deleteList(list: ScrumList): void {
    const board = this.board();
    if (!board || list.cards.length) return;

    this.dialogSrv.confirmDelete(() => {
      this.scrumSrv.deleteList(list.id).subscribe(res => {
        if (!res.success) return;

        board.lists = board.lists.filter(l => l.id !== list.id);
        this.board.set({ ...board });
        this.toastSrv.success('List deleted');
      });
    }, `the list "${list.title}"`);
  }
  // #endregion

  // #region Cards
  startAddCard(list: ScrumList): void {
    this.addingCardListId = list.id;
    this.newCardTitle = '';
  }

  addCard(list: ScrumList): void {
    const title = this.newCardTitle.trim();
    if (!title) return;

    this.scrumSrv.createCard(list.id, { title, description: null, dueDate: null }).subscribe(res => {
      if (!res.success) return;

      list.cards.push(res.data);
      this.newCardTitle = '';
    });
  }

  cancelInline(): void {
    this.addingCardListId = null;
    this.renamingListId = null;
    this.isEditingBoard = false;
  }

  openCard(card: ScrumCard): void {
    this.cardDraft.set({
      id: card.id,
      title: card.title,
      description: card.description ?? '',
      dueDate: card.dueDate ? card.dueDate.slice(0, 10) : ''
    });
  }

  closeCard(): void {
    if (!this.isSaving()) this.cardDraft.set(null);
  }

  canSaveCard(): boolean {
    return !!this.cardDraft()?.title.trim() && !this.isSaving();
  }

  saveCard(): void {
    const draft = this.cardDraft();
    if (!draft || !this.canSaveCard()) return;

    this.isSaving.set(true);
    this.scrumSrv.updateCard(draft.id, {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      dueDate: draft.dueDate || null
    }).subscribe({
      next: res => {
        this.isSaving.set(false);
        if (!res.success) return;

        this.replaceCard(res.data);
        this.cardDraft.set(null);
        this.toastSrv.success('Card updated');
      },
      error: () => this.isSaving.set(false)
    });
  }

  deleteCard(): void {
    const draft = this.cardDraft();
    const board = this.board();
    if (!draft || !board) return;

    this.dialogSrv.confirmDelete(() => {
      this.scrumSrv.deleteCard(draft.id).subscribe(res => {
        if (!res.success) return;

        board.lists.forEach(l => l.cards = l.cards.filter(c => c.id !== draft.id));
        this.board.set({ ...board });
        this.cardDraft.set(null);
        this.toastSrv.success('Card deleted');
      });
    }, 'this card');
  }

  isOverdue(card: ScrumCard): boolean {
    return !!card.dueDate && new Date(card.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
  }

  private replaceCard(updated: ScrumCard): void {
    const board = this.board();
    if (!board) return;

    board.lists.forEach(l => l.cards = l.cards.map(c => c.id === updated.id ? updated : c));
    this.board.set({ ...board });
  }
  // #endregion

  // #region Drag and drop
  dropList(event: CdkDragDrop<ScrumList[]>): void {
    const board = this.board();
    if (!board || event.previousIndex === event.currentIndex) return;

    const list = board.lists[event.previousIndex];
    moveItemInArray(board.lists, event.previousIndex, event.currentIndex);
    this.board.set({ ...board });

    this.scrumSrv.moveList(list.id, event.currentIndex).subscribe({
      next: res => { if (!res.success) this.loadBoard(); },
      error: () => this.loadBoard()
    });
  }

  drop(event: CdkDragDrop<ScrumCard[]>, targetList: ScrumList): void {
    const card = event.item.data as ScrumCard;
    if (event.previousContainer === event.container && event.previousIndex === event.currentIndex) return;

    // Move on screen first so the board feels instant; put it back if the server says no.
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      card.listId = targetList.id;
    }

    this.scrumSrv.moveCard(card.id, targetList.id, event.currentIndex).subscribe({
      next: res => { if (!res.success) this.loadBoard(); },
      error: () => this.loadBoard()
    });
  }
  // #endregion

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
