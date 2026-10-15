import { isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, ElementRef, inject, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, exhaustMap, filter, map, Observable, of, Subject, switchMap, tap, timer } from 'rxjs';
import { ConversationService } from '../../../../services/admin/conversation.service';
import { FormatDatePipe } from '../../../../shared/pipes/date.pipe';
import { SharedModule } from '../../../../shared/shared-imports';
import { ChatContact, ChatThreadMessage } from '../../../../shared/types/conversation.types';
import { DATE_FORMATS } from '../../../../shared/types/date.types';
import { EmptyStateComponent } from '../../../ui/empty-state.component';
import { ErrorStateComponent } from '../../../ui/error-state.component';

type LoadState = 'loading' | 'ready' | 'error';

/** The conversation currently shown in the panel. `version` changes on every switch so late responses are ignored. */
interface ChatThread {
  version: number;
  userId: string;
  conversationId: string | null;
  messages: ChatThreadMessage[];
  hasMore: boolean;
  state: LoadState;
  loadingOlder: boolean;
}

@Component({
  selector: 'admin-connection',
  standalone: true,
  imports: [
    SharedModule,
    FormatDatePipe,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './connection.component.html',
  styleUrl: './connection.component.css'
})
export class AdminConnectionComponent implements OnInit {
  // #region Properties
  // Polling instead of a socket: the app has no real-time channel, and every message is persisted anyway.
  private readonly CONTACTS_POLL_MS = 15000;
  private readonly THREAD_POLL_MS = 4000;
  private readonly PAGE_SIZE = 30;
  readonly MAX_LENGTH = 2000;
  readonly DATE_FORMATS = DATE_FORMATS;

  @ViewChild('scroller') private scroller?: ElementRef<HTMLElement>;

  isOpen = signal(false);
  view = signal<'list' | 'thread'>('list');
  search = signal('');
  draft = signal('');

  contacts = signal<ChatContact[]>([]);
  contactsState = signal<LoadState>('loading');
  thread = signal<ChatThread | null>(null);

  selectedContact = computed(() => {
    const userId = this.thread()?.userId;
    return userId ? this.contacts().find(c => c.userId === userId) ?? null : null;
  });

  filteredContacts = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.contacts();
    return this.contacts().filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.roleName ?? '').toLowerCase().includes(term)
    );
  });

  totalUnread = computed(() => this.contacts().reduce((sum, c) => sum + c.unreadCount, 0));

  canSend = computed(() => {
    const text = this.draft().trim();
    return text.length > 0 && text.length <= this.MAX_LENGTH && this.thread()?.state === 'ready';
  });

  private threadVersion = 0;
  private readonly threadChanged$ = new Subject<void>();
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  // #endregion

  // #region Inject Services
  private readonly conversationSrv = inject(ConversationService);
  private readonly destroyRef = inject(DestroyRef);
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngOnInit(): void {
    // Server-side rendering must not start timers, or the page never finishes rendering.
    if (!this.isBrowser) return;

    timer(0, this.CONTACTS_POLL_MS).pipe(
      filter((tick) => tick === 0 || this.isPageVisible()),
      exhaustMap(() => this.fetchContacts()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    // One poll for the open conversation; switchMap drops the previous conversation's poll (and its in-flight request).
    this.threadChanged$.pipe(
      switchMap(() => timer(this.THREAD_POLL_MS, this.THREAD_POLL_MS).pipe(
        filter(() => this.isOpen() && this.view() === 'thread' && this.isPageVisible()),
        exhaustMap(() => this.pollNewMessages())
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
  // #endregion

  // #region Panel
  openPanel(): void {
    this.isOpen.set(true);
    if (this.contactsState() === 'error') this.reloadContacts();
  }

  /** The header button: shows the conversation list, or closes the panel when the list is already showing. */
  toggleList(): void {
    if (this.isOpen() && this.view() === 'list') return this.closePanel();
    if (this.view() === 'thread') this.backToList();
    this.openPanel();
  }

  closePanel(): void {
    this.isOpen.set(false);
  }

  backToList(): void {
    this.view.set('list');
    this.thread.set(null);
    this.draft.set('');
    this.threadChanged$.next();
  }
  // #endregion

  // #region Contacts
  reloadContacts(): void {
    this.contactsState.set('loading');
    this.fetchContacts().subscribe();
  }

  private fetchContacts(): Observable<unknown> {
    return this.conversationSrv.getContacts().pipe(
      tap(res => {
        if (!res.success) throw new Error('contacts');
        this.contacts.set(this.withOpenThreadRead(res.data ?? []));
        this.contactsState.set('ready');
      }),
      // Keep showing the last good list when a background refresh fails.
      catchError(() => {
        if (this.contactsState() !== 'ready') this.contactsState.set('error');
        return EMPTY;
      })
    );
  }

  /** The open conversation is being read right now, so a poll racing the read receipt must not bring its badge back. */
  private withOpenThreadRead(contacts: ChatContact[]): ChatContact[] {
    const thread = this.thread();
    if (!thread || !this.isOpen() || this.view() !== 'thread') return contacts;
    return contacts.map(c => c.userId === thread.userId ? { ...c, unreadCount: 0 } : c);
  }

  private patchContact(userId: string, patch: Partial<ChatContact>): void {
    this.contacts.update(list => list.map(c => c.userId === userId ? { ...c, ...patch } : c));
  }

  initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('') || '?';
  }
  // #endregion

  // #region Thread
  openContact(contact: ChatContact): void {
    this.isOpen.set(true);
    this.view.set('thread');
    this.draft.set('');

    const version = ++this.threadVersion;
    this.thread.set({
      version,
      userId: contact.userId,
      conversationId: contact.conversationId,
      messages: [],
      hasMore: false,
      // A colleague without a conversation yet has nothing to load; it is created with the first message.
      state: contact.conversationId ? 'loading' : 'ready',
      loadingOlder: false
    });
    this.threadChanged$.next();

    if (!contact.conversationId) return;

    this.conversationSrv.getMessages(contact.conversationId, { limit: this.PAGE_SIZE }).subscribe({
      next: res => {
        if (!this.isCurrent(version, res.data?.conversationId)) return;
        if (!res.success || !res.data) return this.patchThread(version, { state: 'error' });

        this.patchThread(version, {
          messages: res.data.items.map(m => ({ ...m, status: 'sent' as const })),
          hasMore: res.data.hasMore,
          state: 'ready'
        });
        this.scrollToBottom();
        this.markReadIfNeeded(version);
      },
      error: () => this.patchThread(version, { state: 'error' })
    });
  }

  retryThread(): void {
    const contact = this.selectedContact();
    if (contact) this.openContact(contact);
  }

  loadOlder(): void {
    const thread = this.thread();
    const oldest = thread?.messages.find(m => m.status === 'sent');
    if (!thread?.conversationId || !thread.hasMore || thread.loadingOlder || !oldest) return;

    const version = thread.version;
    const scroller = this.scroller?.nativeElement;
    const distanceFromBottom = scroller ? scroller.scrollHeight - scroller.scrollTop : 0;
    this.patchThread(version, { loadingOlder: true });

    this.conversationSrv.getMessages(thread.conversationId, { before: oldest.id, limit: this.PAGE_SIZE }).subscribe({
      next: res => {
        if (!this.isCurrent(version, res.data?.conversationId)) return;
        if (!res.success || !res.data) return this.patchThread(version, { loadingOlder: false });

        const older = res.data.items.map(m => ({ ...m, status: 'sent' as const }));
        this.patchThread(version, {
          messages: this.merge(older, this.thread()!.messages),
          hasMore: res.data.hasMore,
          loadingOlder: false
        });
        // Keep the message the user was looking at in place instead of jumping.
        setTimeout(() => {
          if (scroller) scroller.scrollTop = scroller.scrollHeight - distanceFromBottom;
        });
      },
      error: () => this.patchThread(version, { loadingOlder: false })
    });
  }

  private pollNewMessages(): Observable<unknown> {
    const thread = this.thread();
    const newest = thread?.messages.filter(m => m.status === 'sent').at(-1);
    if (!thread?.conversationId || thread.state !== 'ready') {
      // A colleague may have started the conversation from their side meanwhile.
      return thread && !thread.conversationId ? this.adoptConversationFromContacts(thread) : of(null);
    }

    const version = thread.version;
    const request$ = newest
      ? this.conversationSrv.getMessages(thread.conversationId, { after: newest.id })
      : this.conversationSrv.getMessages(thread.conversationId, { limit: this.PAGE_SIZE });

    return request$.pipe(
      map(res => {
        if (!res.success || !res.data || !this.isCurrent(version, res.data.conversationId)) return;
        const current = this.thread()!;
        const known = new Set(current.messages.map(m => m.id));
        const fresh = res.data.items.filter(m => !known.has(m.id));
        if (!fresh.length) return;

        const nearBottom = this.isNearBottom();
        this.patchThread(version, { messages: this.merge(current.messages, fresh.map(m => ({ ...m, status: 'sent' as const }))) });
        this.refreshPreview(current.userId);
        if (nearBottom) this.scrollToBottom();
        if (fresh.some(m => !m.isMine)) this.markReadIfNeeded(version, true);
      }),
      catchError(() => of(null))
    );
  }

  private adoptConversationFromContacts(thread: ChatThread): Observable<unknown> {
    const conversationId = this.contacts().find(c => c.userId === thread.userId)?.conversationId;
    if (conversationId) {
      this.patchThread(thread.version, { conversationId });
    }
    return of(null);
  }

  private markReadIfNeeded(version: number, force = false): void {
    const thread = this.thread();
    const contact = this.selectedContact();
    const lastIncoming = thread?.messages.filter(m => m.status === 'sent' && !m.isMine).at(-1);
    if (!thread || thread.version !== version || !thread.conversationId || !lastIncoming) return;
    if (!force && !contact?.unreadCount) return;

    this.patchContact(thread.userId, { unreadCount: 0 });
    this.conversationSrv.markRead(thread.conversationId, lastIncoming.id).subscribe({ error: () => { } });
  }
  // #endregion

  // #region Sending
  onComposerKeydown(event: KeyboardEvent): void {
    // Enter sends, Shift+Enter adds a line; ignore Enter while an IME is composing.
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.send();
    }
  }

  send(): void {
    const thread = this.thread();
    if (!thread || !this.canSend()) return;

    const content = this.draft().trim();
    // Cleared before the request, so a double click or a held Enter cannot send the text twice.
    this.draft.set('');

    const pending: ChatThreadMessage = {
      id: this.newId(),
      conversationId: thread.conversationId ?? '',
      senderUserId: '',
      content,
      createdAt: new Date().toISOString(),
      isMine: true,
      status: 'sending'
    };
    this.patchThread(thread.version, { messages: [...thread.messages, pending] });
    this.scrollToBottom();
    this.deliver(thread.version, pending);
  }

  retrySend(message: ChatThreadMessage): void {
    const thread = this.thread();
    if (!thread || message.status !== 'failed') return;
    this.replaceMessage(thread.version, message.id, { ...message, status: 'sending' });
    // Same id as the failed attempt: if it actually reached the server, it is not stored twice.
    this.deliver(thread.version, message);
  }

  private deliver(version: number, message: ChatThreadMessage): void {
    const thread = this.thread()!;
    const conversationId$ = thread.conversationId
      ? of(thread.conversationId)
      : this.conversationSrv.openDirect(thread.userId).pipe(map(res => {
        if (!res.success || !res.data) throw new Error('open');
        this.patchThread(version, { conversationId: res.data });
        this.patchContact(thread.userId, { conversationId: res.data });
        return res.data;
      }));

    conversationId$.pipe(
      switchMap(conversationId => this.conversationSrv.sendMessage(conversationId, message.id, message.content))
    ).subscribe({
      next: res => {
        if (!res.success || !res.data) return this.replaceMessage(version, message.id, { ...message, status: 'failed' });
        this.replaceMessage(version, message.id, { ...res.data, status: 'sent' });
        this.patchContact(thread.userId, {
          conversationId: res.data.conversationId,
          lastMessagePreview: res.data.content.replace(/\s+/g, ' '),
          lastMessageAt: res.data.createdAt,
          lastMessageIsMine: true
        });
        this.sortContacts();
      },
      error: () => this.replaceMessage(version, message.id, { ...message, status: 'failed' })
    });
  }
  // #endregion

  // #region Helpers
  private isCurrent(version: number, conversationId?: string): boolean {
    const thread = this.thread();
    return !!thread && thread.version === version && (!conversationId || thread.conversationId === conversationId);
  }

  private patchThread(version: number, patch: Partial<ChatThread>): void {
    this.thread.update(t => t && t.version === version ? { ...t, ...patch } : t);
  }

  private replaceMessage(version: number, id: string, next: ChatThreadMessage): void {
    const thread = this.thread();
    if (!thread || thread.version !== version) return;
    const others = thread.messages.filter(m => m.id !== id);
    this.patchThread(version, { messages: next.status === 'sent' ? this.merge(others, [next]) : [...others, next] });
  }

  /** Stored messages in server order, then the user's own unsent ones; never two copies of one id. */
  private merge(a: ChatThreadMessage[], b: ChatThreadMessage[]): ChatThreadMessage[] {
    const byId = new Map<string, ChatThreadMessage>();
    for (const m of [...a, ...b]) byId.set(m.id, m);
    const all = [...byId.values()];
    const sent = all.filter(m => m.status === 'sent')
      .sort((x, y) => x.createdAt.localeCompare(y.createdAt) || x.id.localeCompare(y.id));
    return [...sent, ...all.filter(m => m.status !== 'sent')];
  }

  private refreshPreview(userId: string): void {
    const last = this.thread()?.messages.filter(m => m.status === 'sent').at(-1);
    if (!last) return;
    this.patchContact(userId, {
      lastMessagePreview: last.content.replace(/\s+/g, ' '),
      lastMessageAt: last.createdAt,
      lastMessageIsMine: last.isMine
    });
    this.sortContacts();
  }

  private sortContacts(): void {
    this.contacts.update(list => [...list].sort((x, y) =>
      (y.lastMessageAt ?? '').localeCompare(x.lastMessageAt ?? '') || x.name.localeCompare(y.name)));
  }

  private isPageVisible(): boolean {
    return typeof document === 'undefined' || document.visibilityState !== 'hidden';
  }

  private isNearBottom(): boolean {
    const el = this.scroller?.nativeElement;
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scroller?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  private newId(): string {
    const webCrypto: Crypto | undefined = typeof crypto !== 'undefined' ? crypto : undefined;
    if (typeof webCrypto?.randomUUID === 'function') return webCrypto.randomUUID();

    const bytes = new Uint8Array(16);
    if (typeof webCrypto?.getRandomValues === 'function') {
      webCrypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  trackByUser(_: number, item: ChatContact): string {
    return item.userId;
  }

  isToday(value: string): boolean {
    return new Date(value).toDateString() === new Date().toDateString();
  }
  // #endregion
}
