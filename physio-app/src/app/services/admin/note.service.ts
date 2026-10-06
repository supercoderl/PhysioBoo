import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { Note, NoteFilter, NoteLabel, SaveNotePayload } from "../../shared/types/note.types";

/** Personal notes of the signed-in user (see docs/note-redesign.md). */
@Injectable({ providedIn: 'root' })
export class NoteService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  getNotes(filter: NoteFilter = {}) {
    let params = new HttpParams();
    if (filter.search) params = params.set('search', filter.search);
    if (filter.label) params = params.set('label', filter.label);
    if (filter.archived) params = params.set('archived', true);

    return this.http.get<PagedResponse<Note[]>>(BASE_API.NOTE.LIST, { params, context: createHttpContext({ loadingKey: LoadingKeys.NOTE.LIST }) });
  }

  getLabels() {
    return this.http.get<PagedResponse<NoteLabel[]>>(BASE_API.NOTE.LABELS, { context: createHttpContext({ loadingKey: LoadingKeys.NOTE.LABELS }) });
  }

  createNote(payload: SaveNotePayload) {
    return this.http.post<PagedResponse<Note>>(BASE_API.NOTE.CREATE, payload, { context: createHttpContext({ loadingKey: LoadingKeys.NOTE.SAVE }) });
  }

  updateNote(noteId: string, payload: SaveNotePayload) {
    return this.http.put<PagedResponse<Note>>(BASE_API.NOTE.UPDATE(noteId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.NOTE.SAVE }) });
  }

  deleteNote(noteId: string) {
    return this.http.delete<PagedResponse<string>>(BASE_API.NOTE.DELETE(noteId), { context: createHttpContext({ loadingKey: LoadingKeys.NOTE.DELETE }) });
  }
  // #endregion
}
