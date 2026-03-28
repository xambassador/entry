import type {
  CreateEntryInput,
  CreateEntryResponse,
  GetEntriesResponse,
  GetSearchEntriesResponse,
  UpdateEntryInput,
  UpdateEntryResponse
} from "@/types";

import { up } from "up-fetch";

export const api = up(fetch, () => ({
  baseUrl: "http://localhost:3000/api",
  timeout: 30000
}));

export async function getEntries(query?: { month?: number; year?: number }, signal?: AbortSignal) {
  const res = await api<GetEntriesResponse>("/entries", {
    params: query,
    signal
  });
  return res;
}

export async function createEntry(data: CreateEntryInput) {
  const res = await api<CreateEntryResponse>("/entries", {
    method: "POST",
    body: data
  });
  return res;
}

export async function updateEntry(id: string, data: UpdateEntryInput) {
  const res = await api<UpdateEntryResponse>(`/entries/${id}`, {
    method: "PUT",
    body: data
  });
  return res;
}

type SearchInput = { q: string; tags?: string[] } | { q?: string; tags: string[] };

export async function searchEntries(query: SearchInput) {
  const res = await api<GetSearchEntriesResponse>("/entries/search", {
    params: query
  });
  return res;
}
