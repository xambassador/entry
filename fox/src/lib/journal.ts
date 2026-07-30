import type { Entry } from "@/types";

export type NoteColor = {
  name: string;
  bg: string;
  ink: string;
  muted: string;
};

export type JournalVariant = "sticky" | "polaroid" | "postcard";

export type JournalNote = {
  id: string;
  href?: string;
  title: string;
  excerpt: string;
  emoji: string;
  color: NoteColor;
  tilt: number;
};

const NOTE_COLORS: NoteColor[] = [
  { name: "pink", bg: "#F7D6F4", ink: "#4a3348", muted: "#8a6f86" },
  { name: "green", bg: "#CBEFCB", ink: "#2f4630", muted: "#6d8a6d" },
  { name: "purple", bg: "#DBD5F8", ink: "#3a3560", muted: "#736e99" },
  { name: "neutral", bg: "#E8E8E8", ink: "#3a3a3a", muted: "#828282" }
];

export function getHash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getTilt(hash: number) {
  return ((hash % 5) - 2) * 0.9;
}

export function decorate(entry: Entry): JournalNote {
  const h = getHash(entry.id || entry.date);
  return {
    id: entry.id,
    href: entry.id,
    title: entry.title || "Untitled",
    excerpt: "",
    emoji: entry.emoji,
    color: NOTE_COLORS[h % NOTE_COLORS.length],
    tilt: getTilt(h)
  };
}

export function indexByDate(entries: Entry[]): Map<string, Entry> {
  return new Map(entries.map((e) => [e.date, e]));
}
