import { useStore } from "@nanostores/react";
import { atom } from "nanostores";

const title = atom("");
const content = atom("");
const mood = atom("");
const emoji = atom("");
const tags = atom<string[]>([]);

export function updateTitle(newTitle: string) {
  title.set(newTitle);
}

export function updateContent(newContent: string) {
  content.set(newContent);
}

export function updateMood(newMood: string) {
  mood.set(newMood);
}

export function updateEmoji(newEmoji: string) {
  emoji.set(newEmoji);
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

export function useEmoji() {
  return useStore(emoji);
}

export function useTags() {
  return useStore(tags);
}
