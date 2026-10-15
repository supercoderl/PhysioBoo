import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse } from "../../shared/types/common";
import { ChatContact, ConversationMessage, ConversationMessagesPage, MessageCursor } from "../../shared/types/conversation.types";
import { LoadingKeys } from "../../shared/types/loading";

/** Team chat between staff of the signed-in user's tenant. */
@Injectable({ providedIn: 'root' })
export class ConversationService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  /** Polled in the background, so failures stay quiet instead of toasting every few seconds. */
  getContacts() {
    return this.http.get<PagedResponse<ChatContact[]>>(BASE_API.CONVERSATION.CONTACTS, {
      context: createHttpContext({ loadingKey: LoadingKeys.CONVERSATION.CONTACTS, skipErrorToast: true })
    });
  }

  openDirect(userId: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.CONVERSATION.DIRECT, { userId }, {
      context: createHttpContext({ loadingKey: LoadingKeys.CONVERSATION.SEND, skipErrorToast: true })
    });
  }

  getMessages(conversationId: string, cursor: MessageCursor = {}) {
    let params = new HttpParams();
    if (cursor.before) params = params.set('before', cursor.before);
    if (cursor.after) params = params.set('after', cursor.after);
    if (cursor.limit) params = params.set('limit', cursor.limit);

    const loadingKey = cursor.before ? LoadingKeys.CONVERSATION.OLDER : LoadingKeys.CONVERSATION.MESSAGES;
    return this.http.get<PagedResponse<ConversationMessagesPage>>(BASE_API.CONVERSATION.MESSAGES(conversationId), {
      params,
      context: createHttpContext({ loadingKey, skipErrorToast: true })
    });
  }

  /** `id` is generated here so a retried send is stored only once. */
  sendMessage(conversationId: string, id: string, content: string) {
    return this.http.post<PagedResponse<ConversationMessage>>(BASE_API.CONVERSATION.MESSAGES(conversationId), { id, content }, {
      context: createHttpContext({ loadingKey: LoadingKeys.CONVERSATION.SEND, skipErrorToast: true })
    });
  }

  markRead(conversationId: string, messageId: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.CONVERSATION.READ(conversationId), { messageId }, {
      context: createHttpContext({ loadingKey: LoadingKeys.CONVERSATION.READ, skipErrorToast: true })
    });
  }
  // #endregion
}
