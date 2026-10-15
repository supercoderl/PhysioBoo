/** A colleague in the team chat, with the summary of the direct conversation with them (if any). */
export interface ChatContact {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  roleName: string | null;
  conversationId: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  lastMessageIsMine: boolean;
  unreadCount: number;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  content: string;
  createdAt: string;
  /** Decided by the server from the signed-in user. */
  isMine: boolean;
}

/** A slice of history, oldest first; hasMore means older messages exist before the first item. */
export interface ConversationMessagesPage {
  conversationId: string;
  items: ConversationMessage[];
  hasMore: boolean;
}

/** A message in the open thread: stored ones plus the user's own while they are sending or failed. */
export interface ChatThreadMessage extends ConversationMessage {
  status: 'sent' | 'sending' | 'failed';
}

export interface MessageCursor {
  before?: string;
  after?: string;
  limit?: number;
}
