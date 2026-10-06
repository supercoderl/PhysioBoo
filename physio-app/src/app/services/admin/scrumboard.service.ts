import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { SaveScrumBoardPayload, SaveScrumCardPayload, ScrumBoard, ScrumBoardSummary, ScrumCard, ScrumList } from "../../shared/types/scrumboard.types";

/** Shared team boards (see docs/scrumboard-redesign.md). */
@Injectable({ providedIn: 'root' })
export class ScrumboardService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Boards
  getBoards() {
    return this.http.get<PagedResponse<ScrumBoardSummary[]>>(BASE_API.SCRUMBOARD.BOARDS, { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.BOARDS }) });
  }

  getBoard(boardId: string) {
    return this.http.get<PagedResponse<ScrumBoard>>(BASE_API.SCRUMBOARD.BOARD(boardId), { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.BOARD }) });
  }

  createBoard(payload: SaveScrumBoardPayload) {
    return this.http.post<PagedResponse<ScrumBoardSummary>>(BASE_API.SCRUMBOARD.BOARDS, payload, { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.BOARD_SAVE }) });
  }

  updateBoard(boardId: string, payload: SaveScrumBoardPayload) {
    return this.http.put<PagedResponse<string>>(BASE_API.SCRUMBOARD.BOARD(boardId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.BOARD_SAVE }) });
  }

  deleteBoard(boardId: string) {
    return this.http.delete<PagedResponse<string>>(BASE_API.SCRUMBOARD.BOARD(boardId), { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.BOARD_DELETE }) });
  }
  // #endregion

  // #region Lists
  createList(boardId: string, title: string) {
    return this.http.post<PagedResponse<ScrumList>>(BASE_API.SCRUMBOARD.LIST_CREATE(boardId), { title }, { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.LIST_SAVE }) });
  }

  renameList(listId: string, title: string) {
    return this.http.put<PagedResponse<string>>(BASE_API.SCRUMBOARD.LIST(listId), { title }, { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.LIST_SAVE }) });
  }

  deleteList(listId: string) {
    return this.http.delete<PagedResponse<string>>(BASE_API.SCRUMBOARD.LIST(listId), { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.LIST_DELETE }) });
  }
  // #endregion

  // #region Cards
  createCard(listId: string, payload: SaveScrumCardPayload) {
    return this.http.post<PagedResponse<ScrumCard>>(BASE_API.SCRUMBOARD.CARD_CREATE(listId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.CARD_SAVE }) });
  }

  updateCard(cardId: string, payload: SaveScrumCardPayload) {
    return this.http.put<PagedResponse<ScrumCard>>(BASE_API.SCRUMBOARD.CARD(cardId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.CARD_SAVE }) });
  }

  deleteCard(cardId: string) {
    return this.http.delete<PagedResponse<string>>(BASE_API.SCRUMBOARD.CARD(cardId), { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.CARD_DELETE }) });
  }

  moveCard(cardId: string, targetListId: string, targetIndex: number) {
    return this.http.post<PagedResponse<string>>(BASE_API.SCRUMBOARD.CARD_MOVE(cardId), { targetListId, targetIndex }, { context: createHttpContext({ loadingKey: LoadingKeys.SCRUMBOARD.CARD_MOVE }) });
  }
  // #endregion
}
