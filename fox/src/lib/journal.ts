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
