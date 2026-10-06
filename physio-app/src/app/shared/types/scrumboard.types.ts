export interface ScrumBoardSummary {
  id: string;
  title: string;
  description: string | null;
  listCount: number;
  cardCount: number;
  updatedAt: string;
}

export interface ScrumCard {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  position: number;
}

export interface ScrumList {
  id: string;
  title: string;
  position: number;
  cards: ScrumCard[];
}

export interface ScrumBoard {
  id: string;
  title: string;
  description: string | null;
  /** True only for the person who created the board. */
  canDelete: boolean;
  lists: ScrumList[];
}

export interface SaveScrumBoardPayload {
  title: string;
  description: string | null;
}

export interface SaveScrumCardPayload {
  title: string;
  description: string | null;
  dueDate: string | null;
}
