import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { NoteService } from '../../../../../services/admin/note.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { Note, NoteLabel, SaveNotePayload } from '../../../../../shared/types/note.types';
import { SharedModule } from '../../../../../shared/shared-imports';

/** Editable copy of a note: the editor never changes the list until Save succeeds. */
interface NoteDraft {
  id: string | null;
  title: string;
  content: string;
  labels: string[];
  checklist: { text: string; done: boolean }[];
  reminderAt: string;
  isPinned: boolean;
  isArchived: boolean;
}

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-all',
  standalone: true,
  imports: [
    AdminContentHeaderComponent,
    SharedModule,
    BooIconComponent,
    EmptyStateComponent
  ],
  templateUrl: './all.component.html',
  styleUrl: './all.component.scss'
})
export class AllNoteComponent implements OnInit, OnDestroy {
  notes = signal<Note[]>([]);
  labels = signal<NoteLabel[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  search = '';
  activeLabel = '';
  showArchived = false;

  draft = signal<NoteDraft | null>(null);
  newLabel = '';
  newItem = '';

  private readonly search$ = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private noteSrv: NoteService,
    private toastSrv: ToastService,
    private dialogSrv: DialogService
  ) { }

  // #region Lifecycle
  ngOnInit(): void {
    this.searchSub = this.search$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged())
      .subscribe(() => this.loadNotes());

    this.loadNotes();
    this.loadLabels();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.draft()) this.closeEditor();
  }
  // #endregion

  // #region Loading
  loadNotes(): void {
    this.isLoading.set(true);
    this.noteSrv.getNotes({ search: this.search.trim(), label: this.activeLabel, archived: this.showArchived }).subscribe({
      next: res => {
        if (res.success) this.notes.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadLabels(): void {
    this.noteSrv.getLabels().subscribe(res => {
      if (res.success) this.labels.set(res.data);
    });
  }

  onSearchChange(value: string): void {
    this.search$.next(value.trim());
  }

  selectLabel(label: string): void {
    this.activeLabel = this.activeLabel === label ? '' : label;
    this.loadNotes();
  }

  toggleArchived(): void {
    this.showArchived = !this.showArchived;
    this.loadNotes();
  }
  // #endregion

  // #region Editor
  openNew(): void {
    this.draft.set({ id: null, title: '', content: '', labels: [], checklist: [], reminderAt: '', isPinned: false, isArchived: false });
    this.resetEditorInputs();
  }

  openNote(note: Note): void {
    this.draft.set({
      id: note.id,
      title: note.title ?? '',
      content: note.content,
      labels: [...note.labels],
      checklist: note.checklist.map(i => ({ ...i })),
      reminderAt: note.reminderAt ? note.reminderAt.slice(0, 16) : '',
      isPinned: note.isPinned,
      isArchived: note.isArchived
    });
    this.resetEditorInputs();
  }

  closeEditor(): void {
    this.draft.set(null);
  }

  addLabel(): void {
    const draft = this.draft();
    const label = this.newLabel.trim();
    if (!draft || !label) return;

    if (!draft.labels.some(l => l.toLowerCase() === label.toLowerCase())) draft.labels.push(label);
    this.newLabel = '';
  }

  removeLabel(index: number): void {
    this.draft()?.labels.splice(index, 1);
  }

  addItem(): void {
    const draft = this.draft();
    const text = this.newItem.trim();
    if (!draft || !text) return;

    draft.checklist.push({ text, done: false });
    this.newItem = '';
  }

  removeItem(index: number): void {
    this.draft()?.checklist.splice(index, 1);
  }

  /** A note needs a title, some text or a checklist item; the server enforces the same rule. */
  canSave(): boolean {
    const draft = this.draft();
    return !!draft && !this.isSaving()
      && (!!draft.title.trim() || !!draft.content.trim() || draft.checklist.some(i => !!i.text.trim()));
  }

  save(): void {
    const draft = this.draft();
    if (!draft || !this.canSave()) return;

    // Text typed into the label/item boxes but not added yet is not silently dropped.
    this.addLabel();
    this.addItem();

    const payload = this.toPayload(draft);
    this.isSaving.set(true);

    const request = draft.id ? this.noteSrv.updateNote(draft.id, payload) : this.noteSrv.createNote(payload);
    request.subscribe({
      next: res => {
        this.isSaving.set(false);
        if (!res.success) return;

        this.toastSrv.success(draft.id ? 'Note updated' : 'Note added');
        this.closeEditor();
        this.loadNotes();
        this.loadLabels();
      },
      error: () => this.isSaving.set(false)
    });
  }

  deleteFromEditor(): void {
    const draft = this.draft();
    if (draft?.id) this.confirmDelete(draft.id, () => this.closeEditor());
  }
  // #endregion

  // #region Card actions
  togglePin(note: Note, event: Event): void {
    event.stopPropagation();
    this.saveChange(note, { isPinned: !note.isPinned }, note.isPinned ? 'Note unpinned' : 'Note pinned');
  }

  toggleArchive(note: Note, event: Event): void {
    event.stopPropagation();
    this.saveChange(note, { isArchived: !note.isArchived }, note.isArchived ? 'Note restored' : 'Note archived');
  }

  toggleItem(note: Note, index: number, event: Event): void {
    event.stopPropagation();
    const checklist = note.checklist.map((item, i) => i === index ? { ...item, done: !item.done } : item);
    this.saveChange(note, { checklist });
  }

  deleteNote(note: Note, event: Event): void {
    event.stopPropagation();
    this.confirmDelete(note.id);
  }

  private saveChange(note: Note, change: Partial<SaveNotePayload>, message?: string): void {
    const payload: SaveNotePayload = { ...this.noteToPayload(note), ...change };

    this.noteSrv.updateNote(note.id, payload).subscribe(res => {
      if (!res.success) return;

      if (message) this.toastSrv.success(message);
      // Pin and archive move a note between lists, so reload; a tick only changes the card in place.
      if (change.isPinned !== undefined || change.isArchived !== undefined) {
        this.loadNotes();
        this.loadLabels();
      } else {
        this.notes.update(list => list.map(n => n.id === note.id ? res.data : n));
      }
    });
  }

  private confirmDelete(noteId: string, onDone?: () => void): void {
    this.dialogSrv.confirmDelete(() => {
      this.noteSrv.deleteNote(noteId).subscribe(res => {
        if (!res.success) return;

        this.toastSrv.success('Note deleted');
        onDone?.();
        this.loadNotes();
        this.loadLabels();
      });
    }, 'this note');
  }
  // #endregion

  // #region Helpers
  completedCount(note: Note): number {
    return note.checklist.filter(i => i.done).length;
  }

  trackById(_: number, note: Note): string {
    return note.id;
  }

  private resetEditorInputs(): void {
    this.newLabel = '';
    this.newItem = '';
  }

  private toPayload(draft: NoteDraft): SaveNotePayload {
    return {
      title: draft.title.trim() || null,
      content: draft.content.trim(),
      labels: draft.labels,
      checklist: draft.checklist.filter(i => !!i.text.trim()),
      reminderAt: draft.reminderAt || null,
      isPinned: draft.isPinned,
      isArchived: draft.isArchived
    };
  }

  private noteToPayload(note: Note): SaveNotePayload {
    return {
      title: note.title,
      content: note.content,
      labels: note.labels,
      checklist: note.checklist,
      reminderAt: note.reminderAt,
      isPinned: note.isPinned,
      isArchived: note.isArchived
    };
  }
  // #endregion
}
