export interface GetEntriesResponse {
  entries: Entry[];
  total: number;
  limit: number;
  offset: number;
}

export type Entries = Entry[];

export interface Entry {
  id: string;
  user_id: string;
  date: string;
  title: string;
  mood: string;
  emoji: string;
  word_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateEntryInput {
  title: string;
  date: string;
  mood: string;
  emoji: string;
  tags: string[];
  content: string;
}

export interface CreateEntryResponse {
  id: string;
  user_id: string;
  date: string;
  title: string;
  mood: string;
  emoji: string;
  word_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type UpdateEntryInput = Partial<CreateEntryInput>;
export type UpdateEntryResponse = CreateEntryResponse;

export interface GetSearchEntriesResponse {
  entries: Entry[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetEntryResponse {
  content: string;
  id: string;
  user_id: string;
  date: string;
  title: string;
  mood: string;
  emoji: string;
  word_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface GetYearAtGlanceResponse {
  entries: {
    id: string;
    date: string;
    emoji: string;
  }[];
  total: number;
}
