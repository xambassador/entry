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
  image?: string;
  color: string;
  tilt: number;
};

export type DecoratableEntry = {
  id: string;
  date: string;
  title: string;
  emoji: string;
  excerpt?: string;
  image?: string;
  color: string;
};

/**
 * @deprecated
 */
export const NOTE_COLORS: NoteColor[] = [
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

export function colorForId(id: string): NoteColor {
  return NOTE_COLORS[getHash(id) % NOTE_COLORS.length];
}

export function decorate(entry: DecoratableEntry): JournalNote {
  const h = getHash(entry.id || entry.date);
  return {
    id: entry.id,
    href: entry.id,
    title: entry.title || "Untitled",
    excerpt: entry.excerpt ?? "",
    emoji: entry.emoji,
    image: entry.image,
    color: entry.color,
    tilt: getTilt(h)
  };
}

export function indexByDate<T extends { date: string }>(entries: T[]): Map<string, T> {
  return new Map(entries.map((e) => [e.date, e]));
}
