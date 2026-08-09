import type {
  CreateEntryInput,
  CreateEntryResponse,
  GetEntriesResponse,
  GetEntryResponse,
  GetSearchEntriesResponse,
  GetYearAtGlanceResponse,
  UpdateEntryInput,
  UpdateEntryResponse
} from "@/types";

import { isResponseError, up } from "up-fetch";

export const api = up(fetch, () => ({
  baseUrl: "/api",
  timeout: 30000,
  credentials: "include",
  onError(error) {
    if (isResponseError(error) && error.status === 401) {
      const isAuthEndpoint =
        typeof window !== "undefined" &&
        (window.location.pathname.startsWith("/login") || window.location.pathname.startsWith("/write"));

      if (!isAuthEndpoint) {
        window.location.href = "/";
      }
    }
  }
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

export async function getEntryById(id: string) {
  const res = await api<GetEntryResponse>(`/entries/${id}`);
  return res;
}

export async function getYearAtGlance(year?: number, signal?: AbortSignal) {
  const res = await api<GetYearAtGlanceResponse>("/entries/year-at-glance", {
    params: { year },
    signal
  });
  return res;
}

export async function login(passphrase: string) {
  const res = await api<{ token: string; expires_at: string; write_url: string }>("/auth/login", {
    method: "POST",
    body: { passphrase }
  });
  return res;
}

export async function getSession(opts?: { signal?: AbortSignal }) {
  const res = await api<{ status: "authenticated" | "unauthenticated" }>("/auth/session", { signal: opts?.signal });
  return res;
}

export async function logout() {
  await api("/auth/logout", { method: "POST" });
}
