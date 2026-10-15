import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { BASE_API } from '../../../../shared/api/base';
import { ChatContact, ConversationMessage } from '../../../../shared/types/conversation.types';
import { AdminConnectionComponent } from './connection.component';

describe('AdminConnectionComponent', () => {
  let component: AdminConnectionComponent;
  let fixture: ComponentFixture<AdminConnectionComponent>;
  let http: HttpTestingController;

  const contact = (userId: string, conversationId: string | null, unreadCount = 0): ChatContact => ({
    userId,
    name: `User ${userId}`,
    email: `${userId}@clinic.test`,
    avatar: null,
    roleName: 'Doctor',
    conversationId,
    lastMessagePreview: null,
    lastMessageAt: null,
    lastMessageIsMine: false,
    unreadCount
  });

  const message = (id: string, conversationId: string, content: string, isMine = false): ConversationMessage => ({
    id,
    conversationId,
    senderUserId: isMine ? 'me' : 'them',
    content,
    createdAt: `2026-10-15T10:00:0${id.length % 10}`,
    isMine
  });

  const flushContacts = (contacts: ChatContact[]) =>
    http.expectOne(BASE_API.CONVERSATION.CONTACTS).flush({ success: true, data: contacts });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminConnectionComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminConnectionComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  it('loads colleagues and sums their unread messages', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    flushContacts([contact('a', 'c-a', 2), contact('b', null)]);

    expect(component.contacts().length).toBe(2);
    expect(component.totalUnread()).toBe(2);
    expect(component.contactsState()).toBe('ready');
    flush();
    discardPeriodicTasks();
  }));

  it('never shows the previous conversation after switching', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    flushContacts([contact('a', 'c-a'), contact('b', 'c-b')]);

    component.openContact(component.contacts()[0]);
    const slowA = http.expectOne(r => r.url === BASE_API.CONVERSATION.MESSAGES('c-a'));
    component.openContact(component.contacts()[1]);
    const fastB = http.expectOne(r => r.url === BASE_API.CONVERSATION.MESSAGES('c-b'));

    fastB.flush({ success: true, data: { conversationId: 'c-b', items: [message('b1', 'c-b', 'from B')], hasMore: false } });
    slowA.flush({ success: true, data: { conversationId: 'c-a', items: [message('a1', 'c-a', 'from A')], hasMore: false } });
    tick();

    expect(component.thread()!.messages.map(m => m.content)).toEqual(['from B']);
    flush();
    discardPeriodicTasks();
  }));

  it('sends a message once even when send is triggered twice, and retries with the same id', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    flushContacts([contact('a', 'c-a')]);
    component.openContact(component.contacts()[0]);
    http.expectOne(r => r.url === BASE_API.CONVERSATION.MESSAGES('c-a'))
      .flush({ success: true, data: { conversationId: 'c-a', items: [], hasMore: false } });

    component.draft.set('  hello  ');
    component.send();
    component.send();

    const first = http.expectOne(r => r.method === 'POST' && r.url === BASE_API.CONVERSATION.MESSAGES('c-a'));
    expect(first.request.body.content).toBe('hello');
    expect(component.draft()).toBe('');
    first.flush({ success: false }, { status: 500, statusText: 'Server Error' });

    const failed = component.thread()!.messages[0];
    expect(failed.status).toBe('failed');

    component.retrySend(failed);
    const retry = http.expectOne(r => r.method === 'POST' && r.url === BASE_API.CONVERSATION.MESSAGES('c-a'));
    expect(retry.request.body.id).toBe(first.request.body.id);
    retry.flush({ success: true, data: { ...message('srv', 'c-a', 'hello', true), id: first.request.body.id } });

    expect(component.thread()!.messages.map(m => m.status)).toEqual(['sent']);
    expect(component.contacts()[0].lastMessagePreview).toBe('hello');
    flush();
    discardPeriodicTasks();
  }));

  it('starts the conversation on the first message to a new colleague', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    flushContacts([contact('b', null)]);

    component.openContact(component.contacts()[0]);
    http.expectNone(r => r.url.includes('/messages'));

    component.draft.set('hi');
    component.send();
    const open = http.expectOne(BASE_API.CONVERSATION.DIRECT);
    expect(open.request.body).toEqual({ userId: 'b' });
    open.flush({ success: true, data: 'c-new' });

    http.expectOne(r => r.method === 'POST' && r.url === BASE_API.CONVERSATION.MESSAGES('c-new'))
      .flush({ success: true, data: message('m1', 'c-new', 'hi', true) });

    expect(component.thread()!.conversationId).toBe('c-new');
    expect(component.contacts()[0].conversationId).toBe('c-new');
    flush();
    discardPeriodicTasks();
  }));

  it('marks incoming messages as read when the conversation is opened', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    flushContacts([contact('a', 'c-a', 1)]);

    component.openContact(component.contacts()[0]);
    http.expectOne(r => r.url === BASE_API.CONVERSATION.MESSAGES('c-a'))
      .flush({ success: true, data: { conversationId: 'c-a', items: [message('in1', 'c-a', 'ping')], hasMore: false } });

    const read = http.expectOne(BASE_API.CONVERSATION.READ('c-a'));
    expect(read.request.body).toEqual({ messageId: 'in1' });
    expect(component.totalUnread()).toBe(0);
    flush();
    discardPeriodicTasks();
  }));
});
