import { useStore } from "@nanostores/react";
import { atom } from "nanostores";

export const CARD_COLORS = [
  { name: "blue", value: "oklch(57.02% 0.1895 260.46)" },
  { name: "orange", value: "oklch(74% 0.184 70)" },
  { name: "violet", value: "oklch(66% 0.258 308)" },
  { name: "purple", value: "oklch(66% 0.206 285.52)" },
  { name: "brown", value: "oklch(66% 0.0944 71.46)" },
  { name: "green", value: "oklch(68% 0.176 113.11)" },
  { name: "cyan", value: "oklch(66% 0.152 208)" },
  { name: "pink", value: "oklch(71.8% 0.2008 342)" }
];

const title = atom("");
const content = atom("");
const mood = atom("");
const emoji = atom("");
const tags = atom<string[]>([]);
const color = atom(CARD_COLORS[0].value);

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

export function useColor() {
  return useStore(color);
}

export function updateColor(c: string) {
  color.set(c);
}
