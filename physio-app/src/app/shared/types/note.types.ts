export interface NoteChecklistItem {
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  title: string | null;
  content: string;
  labels: string[];
  checklist: NoteChecklistItem[];
  reminderAt: string | null;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface NoteLabel {
  label: string;
  count: number;
}

/** Body of both create and update: an update replaces the whole note. */
export interface SaveNotePayload {
  title: string | null;
  content: string;
  labels: string[];
  checklist: NoteChecklistItem[];
  reminderAt: string | null;
  isPinned: boolean;
  isArchived: boolean;
}

export interface NoteFilter {
  search?: string;
  label?: string;
  archived?: boolean;
}
