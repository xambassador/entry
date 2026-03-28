import type { Mood } from "@/types";

import { useStore } from "@nanostores/react";
import { atom } from "nanostores";

const title = atom("");
const content = atom("");
const mood = atom<Mood | null>(null);
const tags = atom<string[]>([]);

export function updateTitle(newTitle: string) {
  title.set(newTitle);
}

export function updateContent(newContent: string) {
  content.set(newContent);
}

export function updateMood(newMood: Mood | null) {
  mood.set(newMood);
}

export function updateTags(newTags: string[]) {
  tags.set(newTags);
}

export function useTitle() {
  return useStore(title);
}

export function useContent() {
  return useStore(content);
}

export function useMood() {
  return useStore(mood);
}

export function useTags() {
  return useStore(tags);
}
